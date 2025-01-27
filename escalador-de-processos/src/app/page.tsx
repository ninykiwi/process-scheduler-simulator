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
  width:50%;
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
    }

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

  const excluirProcesso = (codigo: number) => {
    setTabelaProcessos((prevTabelaProcessos) =>
      prevTabelaProcessos.filter(processo => processo.codigo !== codigo)
    );
  };

  return (
    <main className="flex flex-col align-center justify-center bg-white px-24 py-8 gap-10">
      <div className="w-full flex flex-row items-center justify-between">
        <Logo></Logo>
        <LogoUfba />
      </div>
      <div className="flex flex-row justify-between bg-slate-100 min-h-36 gap-y-44 p-5 rounded-3xl drop-shadow-2xl">
        <div className="flex flex-col justify-between px-5 py-5 gap-10">
          <Botoes selecionarEscalonamento={selecionarEscalonamento} setSelecionarEscalonamento={setSelecionarEscalonamento} />
          <Quantum valorQuantum={setQuantum} valorSobrecarga={setSobrecarga} />
          <SheetDemo
            tabelaProcessos={tabelaProcessos}
            selecionarEscalonamento={selecionarEscalonamento}
            quantum={Number(quantum)}
            sobrecarga={Number(sobrecarga)}
          />
        </div>
        <Modal numeroDoProcesso={numeroDoProcesso} onClick={handleCreateProcess} />
        <TableContainer className="bg-slate-200 space-y-2 ">
          {tabelaProcessos.map((processo) => (
            <div key={processo.codigo} className="flex justify-between items-center p-2   border-[3px] border-x-[5px] border-slate-300  shadow-md rounded-md ">
              <span className="font-bold">{`Processo:  ${processo.codigo}`}</span>
              <p className="font-bold"> {`Chegada:  ${processo.chegada}`} </p>
              <p className="font-bold"> {`Duração:  ${processo.duracao}`} </p>
              <p className="font-bold"> {`Deadline:  ${processo.deadline ? processo.deadline : 0}`}  </p>

              <button
                onClick={() => excluirProcesso(processo.codigo)}
                className="bg-slate-700 text-white px-2 py-1 rounded"
              >
                Excluir
              </button>
            </div>
          ))}
        </TableContainer>

      </div>
       {/* Barra de status de memória geral */}
       <div className="bg-white p-4 rounded-lg shadow-md">
        <h3 className="text-lg font-bold mb-4">Status da Memória</h3>
        <div className="flex flex-col gap-2">
          <div className="flex justify-between text-sm">
            <span>RAM Total: {TOTAL_MEMORY}KB</span>
            <span>Em Uso: {totalUsedMemory}KB</span>
            <span>Disponível: {TOTAL_MEMORY - totalUsedMemory}KB</span>
          </div>
          <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-500 transition-all"
              style={{ width: `${(totalUsedMemory / TOTAL_MEMORY) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Lista de processos */}
      <div className="space-y-4">
        {currentProcessos.map((processo) => (
          <div key={processo.codigo} className="bg-white p-4 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
              <div className="flex gap-4">
                <span className="font-bold">Processo {processo.codigo}</span>
                <span>Chegada: {processo.chegada}</span>
                <span>Duração: {processo.duracao}</span>
                <span>Deadline: {processo.deadline || 0}</span>
              </div>
              
              <div className="flex gap-2">
                {processo.pages.length < MAX_PAGES && (
                  <button
                    onClick={() => handleAddPage(processo.codigo)}
                    className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
                  >
                    Adicionar Página
                  </button>
                )}
                <button
                  onClick={() => excluirProcesso(processo.codigo)}
                  className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors"
                >
                  Excluir
                </button>
              </div>
            </div>
            
            <MemoryManager 
              process={processo}
              onPageAllocation={handlePageAllocation}
            />
          </div>
        ))}
      </div>

      {/* Mensagem de erro (se houver) */}
      {errorMessage && (
        <div 
          className="fixed bottom-4 right-4 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md shadow-md"
          onClick={() => setErrorMessage('')}
        >
          {errorMessage}
        </div>
      )}

      {/* Paginação */}
      <Pagination
        itemsPerPage={ITEMS_PER_PAGE}
        totalItems={tabelaProcessos.length}
        currentPage={currentPage}
        onPageChange={handlePageChange}
      />
    </main>
  );
}
