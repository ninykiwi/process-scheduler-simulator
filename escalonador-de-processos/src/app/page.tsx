'use client'
import { useState, useEffect } from 'react';
import styled from 'styled-components';
import Botoes from '@/components/botoes';
import Quantum from '@/components/quantum';
import Modal from '@/components/modal';
import FIFO from "@/components/FIFO";
import SJF from "@/components/SJF";
import EDF from "@/components/EDF";
import RR from "@/components/RR";
import LogoUfba from '@/components/logoufba';
import Logo from '@/components/logo';

const TableContainer = styled.div`
  width: 50%;
  height: 400px;
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
  padding: 10px;
  gap: 10px;
  overflow-y: auto;
`;

type Processo = {
  chegada: number;
  duracao: number;
  deadline: number;
  codigo: number;
  pagina: number;
};

type MemoryPage = {
  id: number;
  processId: number;
};

const MAX_PAGES = 10;
const PAGE_SIZE_KB = 4; 
const TOTAL_RAM_KB = 200;
const TOTAL_SLOTS = TOTAL_RAM_KB / PAGE_SIZE_KB; 

export default function Home() {
  const [numeroDoProcesso, setNumeroDoProcesso] = useState(1);
  const [chegada, setChegada] = useState('');
  const [duracao, setDuracao] = useState('');
  const [deadline, setDeadline] = useState('');
  const [quantum, setQuantum] = useState('');
  const [sobrecarga, setSobrecarga] = useState('');
  const [tabelaProcessos, setTabelaProcessos] = useState<Processo[]>([]);
  const [selecionarEscalonamento, setSelecionarEscalonamento] = useState<string | null>(null);
  const [processosEscalonador, setProcessosEscalonador] = useState<Processo[]>([]);
  const [isSchedulerRunning, setIsSchedulerRunning] = useState(false);
  const [disk, setDisk] = useState<MemoryPage[]>([]); 
  const [ram, setRam] = useState<MemoryPage[]>(Array(TOTAL_SLOTS).fill({ id: -1, processId: -1 })); 
  const [showSchedulerChart, setShowSchedulerChart] = useState(false); 
  const [currentProcess, setCurrentProcess] = useState<Processo | null>(null); // Estado para o processo atual em execução
  const [ultimoProcessoRR, setUltimoProcessoRR] = useState<Processo | null>(null);

  const valorQuantumNumber = Number(quantum);
  const valorSobrecargaNumber = Number(sobrecarga);

  const handleCreateProcess = (chegada: string, duracao: string, deadline: string, pagina: string) => {
    const numPaginas = Number(pagina);

    if (isNaN(numPaginas) || numPaginas <= 0 || numPaginas > MAX_PAGES) {
      alert(`O número de páginas deve ser um valor entre 1 e ${MAX_PAGES}.`);
      return;
    }

    const pages: MemoryPage[] = [];
    for (let i = 0; i < numPaginas; i++) {
      pages.push({ id: numeroDoProcesso * MAX_PAGES + i, processId: numeroDoProcesso });
    }

    setDisk((prevDisk) => [...prevDisk, ...pages]);

    const newProcesso: Processo = {
      chegada: Number(chegada),
      duracao: Number(duracao),
      deadline: Number(deadline),
      codigo: numeroDoProcesso,
      pagina: numPaginas,
    };

    setTabelaProcessos((prev) => [...prev, newProcesso]);
    setNumeroDoProcesso((prev) => prev + 1);
  };

  const startScheduler = () => {
    if (!selecionarEscalonamento) {
      alert("Por favor, selecione um algoritmo de escalonamento.");
      return;
    }
  
    setDisk((prevDisk) => {
      const ramPages = ram.filter((page) => page.id !== -1); 
      return [...prevDisk, ...ramPages]; 
    });
  
    setRam(Array(TOTAL_SLOTS).fill({ id: -1, processId: -1 }));
  
    setProcessosEscalonador([...tabelaProcessos]);
  
    setShowSchedulerChart(true);
  
    setIsSchedulerRunning(true);
  };

  const excluirProcesso = (codigo: number) => {
    setTabelaProcessos((prevTabelaProcessos) => prevTabelaProcessos.filter((p) => p.codigo !== codigo));
    setDisk((prevDisk) => prevDisk.filter((page) => page.processId !== codigo));
    setRam((prevRam) => prevRam.map((slot) => (slot.processId === codigo ? { id: -1, processId: -1 } : slot)));
  };

  useEffect(() => {
  if (!isSchedulerRunning) return;

  const interval = setInterval(() => {
    setRam((prevRam) => {
      const freeSlots = prevRam.filter((slot) => slot.id === -1).length;

      if (!currentProcess) {
        let nextProcess: Processo | undefined;

        if (selecionarEscalonamento === 'FIFO') {
          nextProcess = processosEscalonador.find((processo) => {
            const paginasDoProcesso = disk.filter((page) => page.processId === processo.codigo);
            return paginasDoProcesso.length > 0 && paginasDoProcesso.length <= freeSlots;
          });
        } else if (selecionarEscalonamento === 'SJF') {
          nextProcess = processosEscalonador
            .filter((processo) => {
              const paginasDoProcesso = disk.filter((page) => page.processId === processo.codigo);
              return paginasDoProcesso.length > 0 && paginasDoProcesso.length <= freeSlots;
            })
            .sort((a, b) => a.duracao - b.duracao)[0];
        } else if (selecionarEscalonamento === 'RR') {
          let filaRR = processosEscalonador.filter((processo) => {
            const paginasDoProcesso = disk.filter((page) => page.processId === processo.codigo);
            return paginasDoProcesso.length > 0 && paginasDoProcesso.length <= freeSlots;
          });

          if (filaRR.length > 0) {
            let proximoProcesso: Processo;

            if (!ultimoProcessoRR || !filaRR.some((p) => p.codigo === ultimoProcessoRR.codigo)) {
              proximoProcesso = filaRR[0];
            } else {
              const indexAtual = filaRR.findIndex((p) => p.codigo === ultimoProcessoRR.codigo);
              proximoProcesso = filaRR[(indexAtual + 1) % filaRR.length]; // Próximo da fila (circular)
            }

            setUltimoProcessoRR(proximoProcesso);
            nextProcess = proximoProcesso;
          }
        }

        if (nextProcess) {
          setCurrentProcess(nextProcess);

          const paginasParaMover = disk.filter((page) => page.processId === nextProcess!.codigo);
          const newRam = [...prevRam];

          for (const page of paginasParaMover) {
            const freeSlotIndex = newRam.findIndex((slot) => slot.id === -1);
            if (freeSlotIndex !== -1) {
              newRam[freeSlotIndex] = page;
            }
          }

          setDisk((prevDisk) => prevDisk.filter((page) => page.processId !== nextProcess!.codigo));
          return newRam;
        }
      }

      return prevRam;
    });
  }, 500);

  return () => clearInterval(interval);
}, [isSchedulerRunning, disk, processosEscalonador, currentProcess, selecionarEscalonamento, ultimoProcessoRR]);


  useEffect(() => {
    if (currentProcess) {
      const timeout = setTimeout(() => {
        setCurrentProcess(null); 
      }, currentProcess.duracao * 300); 

      return () => clearTimeout(timeout);
    }
  }, [currentProcess]);

  return (
    <main className="flex flex-col align-center justify-center bg-white px-24 py-8 gap-8">
      <div className="w-full flex flex-row items-center justify-between">
        <Logo />
        <LogoUfba />
      </div>

      <div className="flex flex-col bg-slate-100 min-h-36 gap-y-4 p-5 rounded-3xl drop-shadow-2xl">
        <div className='flex flex-row justify-between'>
          <div className="flex flex-col justify-between px-5 py-5 gap-10">
          <Botoes
            selecionarEscalonamento={selecionarEscalonamento}
            setSelecionarEscalonamento={(escalonador) => {
              setSelecionarEscalonamento(escalonador);
              setShowSchedulerChart(false); 
            }}
          />
          <Quantum valorQuantum={setQuantum} valorSobrecarga={setSobrecarga} />
          </div>
          <Modal numeroDoProcesso={numeroDoProcesso} onClick={(chegada, duracao, deadline, pagina) => handleCreateProcess(chegada, duracao, deadline, pagina)} />
          <TableContainer className="bg-slate-200 space-y-2 ">
            {tabelaProcessos.map((processo) => (
              <div key={processo.codigo} className="flex justify-between items-center p-2 border-[3px] border-x-[5px] border-slate-300 shadow-md rounded-md">
                <span className="font-bold">{`Processo:  ${processo.codigo}`}</span>
                <p className="font-bold"> {`Chegada:  ${processo.chegada}`} </p>
                <p className="font-bold"> {`Duração:  ${processo.duracao}`} </p>
                <p className="font-bold"> {`Deadline:  ${processo.deadline ? processo.deadline : 0}`}  </p>
                <p className="font-bold"> {`Páginas:  ${processo.pagina}`} </p>
                <button onClick={() => excluirProcesso(processo.codigo)} className="bg-slate-700 text-white px-2 py-1 rounded">
                  Excluir
                </button>
              </div>
            ))}
          </TableContainer>
        </div>

        <button
          onClick={startScheduler}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Executar
        </button>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-md w-full">
        <div className='flex gap-4'>
          <div className='w-1/2'>
            <h4 className="text-md font-semibold">RAM</h4>
            <div className="border p-2 rounded-md bg-gray-100">
              <div className="flex gap-1 flex-wrap">
                {ram.map((slot, index) => (
                  <div
                    key={index}
                    className={`w-8 h-8 text-white text-xs flex justify-center items-center rounded ${
                      slot.id === -1 ? 'bg-gray-300' : 'bg-blue-500'
                    }`}
                    title={slot.id === -1 ? 'Free Slot' : `Page ${slot.id} (Process ${slot.processId})`}
                  >
                    {slot.id === -1 ? '' : slot.processId}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className='w-1/2'>
            <h4 className="text-md font-semibold">Disco</h4>
            <div className="border p-2 rounded-md bg-gray-100">
              <div className="flex gap-1 flex-wrap">
                {disk.map((page) => (
                  <div
                    key={page.id}
                    className="w-8 h-8 bg-gray-500 text-white text-xs flex justify-center items-center rounded"
                    title={`Page ${page.id} (Process ${page.processId})`}
                  >
                    {page.processId}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {showSchedulerChart && processosEscalonador.length > 0 && (
        <div className="bg-white p-4 rounded-lg shadow-md w-full">
          <h3 className="text-lg font-bold mb-4">Gráfico de Escalonamento</h3>
          <div className="grid gap-4 py-4">
            {selecionarEscalonamento === 'FIFO' && <FIFO tabela={processosEscalonador} linhas={processosEscalonador.length} />}
            {selecionarEscalonamento === 'SJF' && <SJF tabela={processosEscalonador} linhas={processosEscalonador.length} />}
            {selecionarEscalonamento === 'EDF' && valorQuantumNumber > 0 && (
              <EDF tabela={processosEscalonador} linhas={processosEscalonador.length} quantum={valorQuantumNumber} sobrecarga={valorSobrecargaNumber} />
            )}
            {selecionarEscalonamento === 'RR' && valorQuantumNumber > 0 && (
              <RR tabela={processosEscalonador} linhas={processosEscalonador.length} quantum={valorQuantumNumber} sobrecarga={valorSobrecargaNumber} />
            )}
          </div>
        </div>
      )}
    </main>
  );
}