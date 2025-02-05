import React, { useState } from 'react';

type Props = {
    valorQuantum: (quantum: string) => void;
    valorSobrecarga: (sobrecarga: string) => void;
}

const Quantum = ({ valorQuantum, valorSobrecarga }: Props) => {
    const [quantum, setQuantum] = useState('');
    const [sobrecarga, setSobrecarga] = useState('');

    const handleQuantumChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setQuantum(newValue);
        valorQuantum(newValue);
    }

    const handleSobrecargaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setSobrecarga(newValue);
        valorSobrecarga(newValue);
    }

    return (
        <div className='flex flex-col gap-3 font-bold text-black'>
            <label className='flex flex-col gap-1'>
                Quantum
                <input
                    type='number'
                    min={1}
                    max={99}
                    placeholder="0"
                    value={quantum}
                    onChange={handleQuantumChange}
                    className='mt-px py-2 pl-3 pr-2 rounded-lg w-24 bg-slate-300 font-normal'
                />
            </label>
            <label className='flex flex-col gap-1'>
                Sobrecarga
                <input
                    type='number'
                    min={1}
                    max={99}
                    placeholder="0"
                    value={sobrecarga}
                    onChange={handleSobrecargaChange}
                    className='mt-px py-2 pl-3 pr-2 rounded-lg w-24 bg-slate-300 font-normal'
                />
            </label>
        </div>
    );
}

export default Quantum;
