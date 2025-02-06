import React from 'react';
import styled from 'styled-components';
import { Processo } from './types';

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

type TabelaProcessosProps = {
  tabelaProcessos: Processo[];
  excluirProcesso: (codigo: number) => void;
};

export const TabelaProcessos: React.FC<TabelaProcessosProps> = ({ tabelaProcessos, excluirProcesso }) => {
  return (
    <TableContainer className="bg-slate-200 space-y-2">
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
  );
};