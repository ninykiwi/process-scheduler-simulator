import React, { useState } from 'react';

type Processo = {
    [x: string]: any;
    chegada: number;
    duracao: number;
    deadline: number;
    codigo: number;
};

type Props = {
    linhas: number;
    tabela: Processo[];
    quantum: number;
    sobrecarga: number;
};

const EDF = ({ linhas, tabela, sobrecarga, quantum }: Props) => {
    const NUM_LINHAS = linhas;

    const tabelaDeadline = tabela.map(processo => ({
        ...processo,
        processoDeadline: processo.chegada + processo.deadline
    }));

    const salvarDuracao = tabelaDeadline.map(processo => ({
        ...processo,
        salvarDuracao: processo.duracao
    }));

    const sortedTabela: Processo[] = salvarDuracao.map((processo, index) => ({
        ...processo,
        originalIndex: index
    })).sort((a, b) => {
        if (a.chegada === b.chegada) {
            if (a.processoDeadline === b.processoDeadline) {
                return a.codigo - b.codigo;
            }
            return a.processoDeadline - b.processoDeadline;
        }
        return a.chegada - b.chegada;
    });

    let TOTAL_QUANTUM = tabela.reduce((acumulador, item) => acumulador + item.duracao, 0);

    const createGridItems = () => {
        const items = [];
        const statusGrid: string[][] = Array(NUM_LINHAS).fill(null).map(() => []);
        let processoTerminou = 0;
        let numColunas = 0;

        let fila: Processo[] = [...sortedTabela];
        let processoAtual: Processo | null = null;

        while (TOTAL_QUANTUM > 0) {
            fila = fila.sort((a, b) => {
                if (a.chegada <= processoTerminou && b.chegada <= processoTerminou) {
                    return a.processoDeadline - b.processoDeadline
                }
                return a.chegada - b.chegada;
            });

            if (!processoAtual || processoAtual.duracao <= 0) {
                processoAtual = fila.find(p => p.chegada <= processoTerminou) || null;
                if (!processoAtual) {
                    processoTerminou++;
                    continue;
                }
                fila = fila.filter(p => p !== processoAtual);
            }

            if (processoAtual) {
                const startRow = processoAtual.originalIndex;
                const startCol = Math.max(processoAtual.chegada, processoTerminou);
                const processoDeadline = processoAtual.processoDeadline!;
                const tempoExecucao = Math.min(processoAtual.duracao, quantum);
                processoAtual.duracao -= tempoExecucao;
                TOTAL_QUANTUM -= tempoExecucao;
                processoTerminou += tempoExecucao;

                for (let col = startCol; col < startCol + tempoExecucao; col++) {
                    if (col < processoDeadline) {
                        statusGrid[startRow][col] = 'green';
                    } else {
                        statusGrid[startRow][col] = 'black';
                    }
                }

                if (processoAtual.duracao > 0) {
                    for (let col = processoTerminou; col < processoTerminou + sobrecarga; col++) {
                        statusGrid[startRow][col] = 'red';
                    }
                    processoTerminou += sobrecarga;
                }

                for (let col = processoAtual.chegada; col < startCol; col++) {
                    if (col > processoDeadline && statusGrid[startRow][col] !== 'red') {
                        statusGrid[startRow][col] = 'black';
                    } else if (statusGrid[startRow][col] !== 'green' && statusGrid[startRow][col] !== 'red' && statusGrid[startRow][col] !== 'black') {
                        statusGrid[startRow][col] = 'yellow';
                    }
                }

                const proximoProcesso = fila.find(p => {
                    const deadlineProximo = p.processoDeadline!;
                    return p.chegada <= processoTerminou && deadlineProximo < processoDeadline;
                });

                if (proximoProcesso && processoAtual.duracao > 0) {
                    fila.push(processoAtual);
                    processoAtual = null;
                } else if (processoAtual.duracao > 0) {
                    fila.unshift(processoAtual);
                    processoAtual = null;
                }

                numColunas = Math.max(numColunas, processoTerminou);
            }
        }

        for (let row = 0; row < NUM_LINHAS; row++) {
            for (let col = 0; col < numColunas; col++) {
                const status = statusGrid[row][col];
                items.push(
                    <div
                        key={`${row}-${col}`}
                        className={`flex items-center justify-center border border-black border-opacity-40 w-10 h-10 ${status === 'green' ? 'bg-green-500' : (status === 'yellow' ? 'bg-yellow-500' : (status === 'red' ? 'bg-red-500' : (status === 'black' ? 'bg-black' : 'bg-white')))}`}
                    >
                    </div>
                );
            }
        }

        return { items, numColunas, statusGrid };
    };

    const { items, numColunas, statusGrid } = createGridItems();

    const calculateTurnaroundTime = () => {
        let nonWhiteCells = 0;

        for (let row = 0; row < NUM_LINHAS; row++) {
            for (let col = 0; col < numColunas; col++) {
                if (statusGrid[row][col] !== undefined && statusGrid[row][col] !== 'white') {
                    nonWhiteCells++;
                }
            }
        }
        const TurnaroundTime = nonWhiteCells / linhas;

        return {
            nonWhiteCells,
            TurnaroundTime,
        };
    };
    
    const { nonWhiteCells, TurnaroundTime } = calculateTurnaroundTime();

    const [isDetailVisible, setIsDetailVisible] = useState(false);

    function handleDetailVisibility() {
        setIsDetailVisible(!isDetailVisible);
    }

    return (
        <div className="flex flex-col items-center bg-gray-100 p-4 rounded-3xl">
            <button onClick={handleDetailVisibility} className='text-blue-800 font-semibold py-1 px-3 mb-4 rounded-lg'>{isDetailVisible ? "Esconder detalhes" : "Mostrar detalhes"}</button>
            {isDetailVisible ? (
                <div className="mb-4 -mt-2">
                    <h3 className="text-lg font-extrabold mb-2">Tabela de Processos Ordenada:</h3>
                    <ul>
                        {sortedTabela.map(processo => (
                            <li key={processo.codigo} className="flex gap-3 mb-2">
                                <span>{`Código: ${processo.codigo}`}</span>
                                <span>{` Chegada: ${processo.chegada}`}</span>
                                <span>{` Duração: ${processo.salvarDuracao}`}</span>
                                <span>{` Deadline: ${processo.processoDeadline}`}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            ) : (
                ""
            )}

            <div
                className="grid gap-0"
                style={{
                    gridTemplateColumns: `repeat(${numColunas}, 1fr)`,
                    gridTemplateRows: `repeat(${NUM_LINHAS}, 1fr)`,
                }}
            >
                {items}
            </div>

            <div className="mt-4">
                <h4 className="text-lg font-extrabold">Turnaround:</h4>
                <p>{nonWhiteCells}/{NUM_LINHAS} =  {TurnaroundTime.toFixed(2)}</p>
            </div>
        </div>
    );
};

export default EDF;
