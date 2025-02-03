'use client';
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

type MemoryPage = {
  id: number;
  size: number;
  inMemory: boolean;
  processId?: number;
};

type Processo = {
  chegada: number;
  duracao: number;
  deadline: number;
  codigo: number;
  pagina: number;
  pages: MemoryPage[];
  totalMemory: number;
};

const PAGE_SIZE = 4;
const MAX_PAGES = 10;
const TOTAL_MEMORY = 200;
const TOTAL_SLOTS = TOTAL_MEMORY / PAGE_SIZE;

export default function Home() {
  const [numeroDoProcesso, setNumeroDoProcesso] = useState(1);
  const [chegada, setChegada] = useState('');
  const [duracao, setDuracao] = useState('');
  const [deadline, setDeadline] = useState('');
  const [quantum, setQuantum] = useState('');
  const [sobrecarga, setSobrecarga] = useState('');
  const [tabelaProcessos, setTabelaProcessos] = useState<Processo[]>([]);
  const [selecionarEscalonamento, setSelecionarEscalonamento] = useState<string | null>(null);
  const [totalUsedMemory, setTotalUsedMemory] = useState(0);
  const [pageReplacementAlgorithm, setPageReplacementAlgorithm] = useState<'FIFO' | 'LRU'>('FIFO');
  const [ram, setRam] = useState<MemoryPage[]>(Array(TOTAL_SLOTS).fill({ id: -1, size: PAGE_SIZE, inMemory: false }));
  const [disk, setDisk] = useState<MemoryPage[]>([]);
  const [lastAccessTimes, setLastAccessTimes] = useState(new Map<number, number>());
  const [diskUsageDelay, setDiskUsageDelay] = useState(2000);
  const [isSchedulerRunning, setIsSchedulerRunning] = useState(false);
  const [processosEscalonador, setProcessosEscalonador] = useState<Processo[]>([]);

  const valorQuantumNumber = Number(quantum);
  const valorSobrecargaNumber = Number(sobrecarga);

  const handleCreateProcess = (chegada: string, duracao: string, deadline: string, pagina: string) => {
    const numPaginas = Number(pagina);

    if (isNaN(numPaginas) || numPaginas <= 0 || numPaginas > MAX_PAGES) {
      alert(`O número de páginas deve ser um valor entre 1 e ${MAX_PAGES}.`);
      return;
    }

    let pages: MemoryPage[] = [];
    let usedMemory = totalUsedMemory;

    for (let i = 0; i < numPaginas; i++) {
      const page: MemoryPage = {
        id: numeroDoProcesso * MAX_PAGES + i,
        size: PAGE_SIZE,
        inMemory: false,
        processId: numeroDoProcesso,
      };

      setDisk((prevDisk) => [...prevDisk, page]);
      pages.push(page);
    }

    const newProcesso: Processo = {
      chegada: Number(chegada),
      duracao: Number(duracao),
      deadline: Number(deadline),
      codigo: numeroDoProcesso,
      pagina: numPaginas,
      pages,
      totalMemory: pages.reduce((sum, page) => sum + page.size, 0),
    };

    setTabelaProcessos((prev) => [...prev, newProcesso]);
    setNumeroDoProcesso((prev) => prev + 1);
    setTotalUsedMemory(usedMemory);
  };

  const startScheduler = () => {
    if (!selecionarEscalonamento) {
      alert("Por favor, selecione um algoritmo de escalonamento.");
      return;
    }
  
    setIsSchedulerRunning(true);
  
    setRam(Array(TOTAL_SLOTS).fill({ id: -1, size: PAGE_SIZE, inMemory: false }));
    setDisk([]); 
  
    setProcessosEscalonador([]);
  
    const processosCopia = tabelaProcessos.map((processo) => ({
      ...processo,
      duracao: processo.duracao, 
    }));
  
    setProcessosEscalonador(processosCopia);
  
    const interval = setInterval(() => {
      setProcessosEscalonador((prevProcessos) => {
        const updatedProcessos = prevProcessos.map((processo) => {
          return processo; 
        });
  
        if (updatedProcessos.every((p) => p.duracao <= 0)) {
          clearInterval(interval);
          setIsSchedulerRunning(false);
        }
  
        return updatedProcessos;
      });
    }, 1000); 
  };
  
  useEffect(() => {
    setProcessosEscalonador([]);
    setIsSchedulerRunning(false);
  }, [selecionarEscalonamento]);
  

  const handlePageFault = (page: MemoryPage) => {
    if (totalUsedMemory + PAGE_SIZE > TOTAL_MEMORY) {
      let pageToReplace: MemoryPage;

      if (pageReplacementAlgorithm === "FIFO") {
        pageToReplace = ram.find((slot) => slot.id !== -1)!;
      } else {
        pageToReplace = ram.reduce((oldest, current) =>
          (lastAccessTimes.get(current.id) ?? 0) < (lastAccessTimes.get(oldest.id) ?? 0) ? current : oldest
        );
      }

      setDisk((prevDisk) => [...prevDisk, pageToReplace]);
      const updatedRam = ram.map((slot) =>
        slot.id === pageToReplace.id ? { id: -1, size: PAGE_SIZE, inMemory: false } : slot
      );
      setRam(updatedRam);

      setTimeout(() => {
        const freeSlotIndex = updatedRam.findIndex((slot) => slot.id === -1);
        if (freeSlotIndex !== -1) {
          const newRam = [...updatedRam];
          newRam[freeSlotIndex] = page;
          setRam(newRam);
          updateAccessTime(page.id);
          setTotalUsedMemory((prev) => prev - pageToReplace.size + PAGE_SIZE);
        }
      }, diskUsageDelay);
    } else {
      const freeSlotIndex = ram.findIndex((slot) => slot.id === -1);
      if (freeSlotIndex !== -1) {
        const updatedRam = [...ram];
        updatedRam[freeSlotIndex] = page;
        setRam(updatedRam);
        updateAccessTime(page.id);
        setTotalUsedMemory((prev) => prev + PAGE_SIZE);
      }
    }
  };

  const excluirProcesso = (codigo: number) => {
    setTabelaProcessos((prevTabelaProcessos) => {
      const processo = prevTabelaProcessos.find((p) => p.codigo === codigo);
      if (processo) {
        const freedMemory = processo.pages.reduce((sum, page) => sum + (page.inMemory ? page.size : 0), 0);
        setTotalUsedMemory((prev) => prev - freedMemory);
        const updatedRam = ram.map((slot) =>
          slot.processId === codigo ? { id: -1, size: PAGE_SIZE, inMemory: false } : slot
        );
        setRam(updatedRam);
        setDisk((prevDisk) => prevDisk.filter((p) => p.processId !== codigo));
      }
      return prevTabelaProcessos.filter((p) => p.codigo !== codigo);
    });
  };

  const updateAccessTime = (pageId: number) => {
    setLastAccessTimes((prev) => new Map(prev).set(pageId, Date.now()));
  };

  return (
    <main className="flex flex-col align-center justify-center bg-white px-24 py-8 gap-8">
      <div className="w-full flex flex-row items-center justify-between">
        <Logo />
        <LogoUfba />
      </div>

      <div className="flex flex-col bg-slate-100 min-h-36 gap-y-4 p-5 rounded-3xl drop-shadow-2xl">
        <div className='flex flex-row justify-between'>
          <div className="flex flex-col justify-between px-5 py-5 gap-10">
            <Botoes selecionarEscalonamento={selecionarEscalonamento} setSelecionarEscalonamento={setSelecionarEscalonamento} />
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

        <div className="p-4 w-full">
          <div className="flex gap-4">
            <label className="font-bold gap-1">
              Algoritmo de Substituição de Páginas: 
              <select
                value={pageReplacementAlgorithm}
                onChange={(e) => setPageReplacementAlgorithm(e.target.value as 'FIFO' | 'LRU')}
                className="py-2 pl-3 pr-2 rounded-lg bg-slate-300"
              >
                <option value="FIFO">FIFO</option>
                <option value="LRU">LRU</option>
              </select>
            </label>
          </div>
        </div>

        <button
          onClick={startScheduler}
          disabled={isSchedulerRunning}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          {isSchedulerRunning ? 'Executar' : 'Executar'}
        </button>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-md w-full">
        <h3 className="text-lg font-bold mb-4">Uso da Memória</h3>
        <div className='flex gap-4'>
          <div className="w-1/2">
            <h4 className="text-md font-semibold">RAM ({totalUsedMemory}/{TOTAL_MEMORY} KB)</h4>
            <div className="flex gap-1 flex-wrap border p-2 rounded-md bg-gray-100">
              {ram.map((slot, index) => (
                <div
                  key={index}
                  className={`w-8 h-8 text-white text-xs flex justify-center items-center rounded ${slot.id === -1 ? 'bg-gray-300' : 'bg-blue-500'}`}
                  title={slot.id === -1 ? 'Free Slot' : `Page ${slot.id} (Process ${slot.processId})`}
                >
                  {slot.id === -1 ? '' : slot.processId}
                </div>
              ))}
            </div>
          </div>
          <div className='w-1/2'>
            <h4 className="text-md font-semibold">DISK</h4>
            <div className="flex gap-1 flex-wrap border p-2 rounded-md bg-gray-100">
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

      <div className="bg-white p-4 rounded-lg shadow-md w-full">
        <h3 className="text-lg font-bold mb-4">Gráfico de Escalonamento</h3>
        <div className="grid gap-4 py-4">
          {selecionarEscalonamento === 'FIFO' && processosEscalonador.length > 0 && <FIFO tabela={processosEscalonador} linhas={processosEscalonador.length} />}
          {selecionarEscalonamento === 'SJF' && processosEscalonador.length > 0 && <SJF tabela={processosEscalonador} linhas={processosEscalonador.length} />}
          {selecionarEscalonamento === 'EDF' && processosEscalonador.length > 0 && valorQuantumNumber > 0 && <EDF tabela={processosEscalonador} linhas={processosEscalonador.length} quantum={valorQuantumNumber} sobrecarga={valorSobrecargaNumber} />}
          {selecionarEscalonamento === 'RR' && processosEscalonador.length > 0 && valorQuantumNumber > 0 && <RR tabela={processosEscalonador} linhas={processosEscalonador.length} quantum={valorQuantumNumber} sobrecarga={valorSobrecargaNumber} />}
        </div>
      </div>
    </main>
  );
}
