'use client'
import { useState } from "react";
import Botoes from "@/components/botoes";
import Quantum from "@/components/quantum";
import Coluna from "@/components/coluna";
import Modal from "@/components/modal";
import FIFO from "@/components/FIFO";
import SJF from "@/components/SJF";
import Image from "next/image";
import styled from "styled-components";
import EDF from "@/components/EDF";
import RR from "@/components/RR";
import { SheetDemo } from "@/components/sheet";
import LogoUfba from "@/components/logoufba";
import Logo from "@/components/logo";

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
};

type Processo = {
  chegada: number;
  duracao: number;
  deadline: number;
  codigo: number;
  pages: MemoryPage[];
  totalMemory: number;
}

const PAGE_SIZE = 4;
const MAX_PAGES = 10;
const TOTAL_MEMORY = 200;
const ITEMS_PER_PAGE = 5;

export default function Home() {
  const [numeroDoProcesso, setNumeroDoProcesso] = useState(1);
  const [chegada, setChegada] = useState("");
  const [duracao, setDuracao] = useState("");
  const [deadline, setDeadline] = useState("");
  const [quantum, setQuantum] = useState('');
  const [sobrecarga, setSobrecarga] = useState('');
  const [tabelaProcessos, setTabelaProcessos] = useState<Processo[]>([]);
  const [selecionarEscalonamento, setSelecionarEscalonamento] = useState<string | null>(null);
  const [totalUsedMemory, setTotalUsedMemory] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');

  function handleCreateProcess(chegada: string, duracao: string, deadline: string) {
    const initialPage: MemoryPage = {
      id: 0,
      size: PAGE_SIZE,
      inMemory: totalUsedMemory + PAGE_SIZE <= TOTAL_MEMORY
    };

    const newProcesso: Processo = {
      chegada: Number(chegada),
      duracao: Number(duracao),
      deadline: Number(deadline),
      codigo: numeroDoProcesso,
      pages: [initialPage],
      totalMemory: PAGE_SIZE
    };

    if (initialPage.inMemory) {
      setTotalUsedMemory(prev => prev + PAGE_SIZE);
    }

    setTabelaProcessos((prevTabelaProcessos) => [...prevTabelaProcessos, newProcesso]);
    setNumeroDoProcesso((prevNumero) => prevNumero + 1);
  }

  const handleAddPage = (processId: number) => {
    setTabelaProcessos(prevProcessos => {
      return prevProcessos.map(processo => {
        if (processo.codigo === processId) {
          if (processo.pages.length >= MAX_PAGES) {
            setErrorMessage(`Limite máximo de páginas atingido para o processo ${processId}`);
            return processo;
          }

          const canAllocateMemory = totalUsedMemory + PAGE_SIZE <= TOTAL_MEMORY;
          const newPage: MemoryPage = {
            id: processo.pages.length,
            size: PAGE_SIZE,
            inMemory: canAllocateMemory
          };

          if (canAllocateMemory) {
            setTotalUsedMemory(prev => prev + PAGE_SIZE);
          }

          return {
            ...processo,
            pages: [...processo.pages, newPage],
            totalMemory: processo.totalMemory + PAGE_SIZE
          };
        }
        return processo;
      });
    });
  };

  const handlePageAllocation = (processId: number, pageId: number) => {
    if (totalUsedMemory + PAGE_SIZE > TOTAL_MEMORY) {
      setErrorMessage('Memória RAM insuficiente para alocar nova página');
      return;
    }

    setTabelaProcessos(prevProcessos => {
      return prevProcessos.map(processo => {
        if (processo.codigo === processId) {
          const updatedPages = processo.pages.map(page => {
            if (page.id === pageId) {
              const newInMemory = !page.inMemory;
              if (newInMemory && totalUsedMemory + PAGE_SIZE <= TOTAL_MEMORY) {
                setTotalUsedMemory(prev => prev + PAGE_SIZE);
                return { ...page, inMemory: true };
              } else if (!newInMemory) {
                setTotalUsedMemory(prev => prev - PAGE_SIZE);
                return { ...page, inMemory: false };
              }
            }
            return page;
          });
          return { ...processo, pages: updatedPages };
        }
        return processo;
      });
    });
  };

  const excluirProcesso = (codigo: number) => {
    setTabelaProcessos((prevTabelaProcessos) =>
      prevTabelaProcessos.filter(processo => processo.codigo !== codigo)
    );
  };

  return (
    <main className="flex flex-col align-center justify-center bg-white px-24 py-8 gap-10">
      <div className="w-full flex flex-row items-center justify-between">
        <Logo />
        <LogoUfba />
      </div>

      <div className="flex flex-row justify-between bg-slate-100 min-h-36 gap-y-44 p-5 rounded-3xl drop-shadow-2xl">
        <div className="flex flex-col justify-between px-5 py-5 gap-10">
          <Botoes selecionarEscalonamento={selecionarEscalonamento} setSelecionarEscalonamento={setSelecionarEscalonamento} />
          <Quantum valorQuantum={setQuantum} valorSobrecarga={setSobrecarga} />
          <SheetDemo tabelaProcessos={tabelaProcessos} selecionarEscalonamento={selecionarEscalonamento} quantum={Number(quantum)} sobrecarga={Number(sobrecarga)} />
        </div>
        <Modal numeroDoProcesso={numeroDoProcesso} onClick={handleCreateProcess} />
        <TableContainer className="bg-slate-200 space-y-2 ">
          {tabelaProcessos.map((processo) => (
            <div key={processo.codigo} className="flex justify-between items-center p-2 border-[3px] border-x-[5px] border-slate-300 shadow-md rounded-md">
              <span className="font-bold">{`Processo:  ${processo.codigo}`}</span>
              <p className="font-bold"> {`Chegada:  ${processo.chegada}`} </p>
              <button onClick={() => excluirProcesso(processo.codigo)} className="bg-slate-700 text-white px-2 py-1 rounded">
                Excluir
              </button>
            </div>
          ))}
        </TableContainer>
      </div>
    </main>
  );
}
