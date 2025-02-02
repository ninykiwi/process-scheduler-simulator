'use client'
import React from 'react';

type BotoesProps = {
  selecionarEscalonamento: string | null;
  setSelecionarEscalonamento: (value: string | null) => void;
};

const Botoes: React.FC<BotoesProps> = ({ selecionarEscalonamento, setSelecionarEscalonamento }) => {
  const handleEscalonamentoChange = (e: any) => {
    const escalonamento = e.target.value;
    const novoEscalonamento = escalonamento === selecionarEscalonamento ? null : escalonamento;
    setSelecionarEscalonamento(novoEscalonamento);
  };

  return (
    <div className='text-black justify-center flex flex-col gap-3 h-min'>
      <div className='flex space-x-5 items-center justify-around'>
        <label className='flex items-center space-x-2 rounded-full hover:scale-105 transition-transform duration-200'>
          <input
            value='SJF'
            onChange={handleEscalonamentoChange}
            type='checkbox'
            className='w-6 h-6 border-gray-500 drop-shadow-md mr-0.5 rounded-md transition-all duration-300 checked:bg-blue-400 checked:border-blue-600'
            checked={selecionarEscalonamento === 'SJF'}
          />
          <span className='text-sm font-medium text-gray-700'>SJF</span>
        </label>
        <label className='flex items-center space-x-2 rounded-full hover:scale-105 transition-transform duration-200'>
          <input
            value='FIFO'
            onChange={handleEscalonamentoChange}
            type='checkbox'
            className='w-6 h-6 border-gray-500 drop-shadow-md rounded-md transition-all duration-300 checked:bg-green-400 checked:border-green-600'
            checked={selecionarEscalonamento === 'FIFO'}
          />
          <span className='text-sm font-medium text-gray-700'>FIFO</span>
        </label>
      </div>
      <div className='flex space-x-5 items-center'>
        <label className='flex items-center space-x-2 rounded-full hover:scale-105 transition-transform duration-200'>
          <input
            value='EDF'
            onChange={handleEscalonamentoChange}
            type='checkbox'
            className='w-6 h-6 border-gray-500 drop-shadow-md rounded-md transition-all duration-300 checked:bg-red-400 checked:border-red-600'
            checked={selecionarEscalonamento === 'EDF'}
          />
          <span className='text-sm font-medium text-gray-700'>EDF</span>
        </label>
        <label className='flex items-center space-x-2 rounded-full hover:scale-105 transition-transform duration-200'>
          <input
            value='RR'
            onChange={handleEscalonamentoChange}
            type='checkbox'
            className='w-6 h-6 border-gray-500 drop-shadow-md rounded-md transition-all duration-300 checked:bg-purple-400 checked:border-purple-600'
            checked={selecionarEscalonamento === 'RR'}
          />
          <span className='text-sm font-medium text-gray-700'>RR</span>
        </label>
      </div>
    </div>
  );
};

export default Botoes;
