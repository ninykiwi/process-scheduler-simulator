import React from 'react';
import FIFO from "@/components/FIFO";
import SJF from "@/components/SJF";
import EDF from "@/components/EDF";
import RR from "@/components/RR";
import { Processo } from './types';

type GraficoEscalonadorProps = {
  selecionarEscalonamento: string | null;
  processosEscalonador: Processo[];
  valorQuantumNumber: number;
  valorSobrecargaNumber: number;
};

export const GraficoEscalonador: React.FC<GraficoEscalonadorProps> = ({
  selecionarEscalonamento,
  processosEscalonador,
  valorQuantumNumber,
  valorSobrecargaNumber,
}) => {
  return (
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
  );
};