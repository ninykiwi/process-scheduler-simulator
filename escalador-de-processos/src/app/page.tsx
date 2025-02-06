'use client'
import { useState, useEffect } from 'react';
import styled from 'styled-components';
import Botoes from '@/components/botoes';
import Quantum from '@/components/quantum';
import Modal from '@/components/modal';
import { TabelaProcessos } from '@/components/TabelaProcessos';
import { DisplayMemoria } from '@/components/DisplayMemoria';
import { GraficoEscalonador } from '@/components/GraficoEscalonador';
import LogoUfba from '@/components/logoufba';
import Logo from '@/components/logo';
import { Processo, MemoryPage } from '@/components/types';

const MAX_PAGES = 10;
const PAGE_SIZE_KB = 4; 
const TOTAL_RAM_KB = 200;
const TOTAL_SLOTS = TOTAL_RAM_KB / PAGE_SIZE_KB; 

export default function Home() {
  const [numeroDoProcesso, setNumeroDoProcesso] = useState(1);
  const [quantum, setQuantum] = useState('');
  const [sobrecarga, setSobrecarga] = useState('');
  const [tabelaProcessos, setTabelaProcessos] = useState<Processo[]>([]);
  const [selecionarEscalonamento, setSelecionarEscalonamento] = useState<string | null>(null);
  const [processosEscalonador, setProcessosEscalonador] = useState<Processo[]>([]);
  const [isSchedulerRunning, setIsSchedulerRunning] = useState(false);
  const [disk, setDisk] = useState<MemoryPage[]>([]); 
  const [ram, setRam] = useState<MemoryPage[]>(Array(TOTAL_SLOTS).fill({ id: -1, processId: -1 })); 
  const [showGraficoEscalonador, setShowGraficoEscalonador] = useState(false); 
  const [currentProcess, setCurrentProcess] = useState<Processo | null>(null); 
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
  
    setShowGraficoEscalonador(true);
  
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
                proximoProcesso = filaRR[(indexAtual + 1) % filaRR.length]; 
              }

              setUltimoProcessoRR(proximoProcesso);
              nextProcess = proximoProcesso;
            }
          } else if (selecionarEscalonamento === 'EDF') {
            nextProcess = processosEscalonador
                .filter((processo) => {
                    const paginasDoProcesso = disk.filter((page) => page.processId === processo.codigo);
                    return paginasDoProcesso.length > 0 && paginasDoProcesso.length <= freeSlots;
                })
                .sort((a, b) => a.deadline - b.deadline)[0];
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
                setShowGraficoEscalonador(false); 
              }}
            />
            <Quantum valorQuantum={setQuantum} valorSobrecarga={setSobrecarga} />
          </div>
          <Modal numeroDoProcesso={numeroDoProcesso} onClick={(chegada, duracao, deadline, pagina) => handleCreateProcess(chegada, duracao, deadline, pagina)} />
          <TabelaProcessos tabelaProcessos={tabelaProcessos} excluirProcesso={excluirProcesso} />
        </div>

        <button
          onClick={startScheduler}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Executar
        </button>
      </div>

      <DisplayMemoria ram={ram} disk={disk} />

      {showGraficoEscalonador && processosEscalonador.length > 0 && (
        <GraficoEscalonador
          selecionarEscalonamento={selecionarEscalonamento}
          processosEscalonador={processosEscalonador}
          valorQuantumNumber={valorQuantumNumber}
          valorSobrecargaNumber={valorSobrecargaNumber}
        />
      )}
    </main>
  );
}