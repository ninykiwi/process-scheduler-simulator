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


type Processo = {
  chegada: number;
  duracao: number;
  deadline: number;
  codigo: number;


}
export default function Home() {
  const [numeroDoProcesso, setNumeroDoProcesso] = useState(1);
  const [chegada, setChegada] = useState("");
  const [duracao, setDuracao] = useState("");
  const [deadline, setDeadline] = useState("");
  const [quantum, setQuantum] = useState('');
  const [sobrecarga, setSobrecarga] = useState('');
  const [tabelaProcessos, setTabelaProcessos] = useState<Processo[]>([]);
  const [selecionarEscalonamento, setSelecionarEscalonamento] = useState<string | null>(null);

  function handleCreateProcess(chegada: string, duracao: string, deadline: string) {
    const newProcesso: Processo = {
      chegada: Number(chegada),
      duracao: Number(duracao),
      deadline: Number(deadline),
      codigo: numeroDoProcesso
    };


    setTabelaProcessos((prevTabelaProcessos) => [...prevTabelaProcessos, newProcesso]);
    setNumeroDoProcesso((prevNumero) => prevNumero + 1);
  }

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
    </main>
  );
}
