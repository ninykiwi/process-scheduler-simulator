import React, { useState, useEffect } from 'react';

type Processo = {
    [x: string]: any;
    chegada: number;
    duracao: number;
    codigo: number;
    salvarDuracao?: number;
};

type Props = {
    linhas: number;
    tabela: Processo[];
    quantum: number;
    sobrecarga: number;
};

const RR = ({ linhas, tabela, sobrecarga, quantum }: Props) => {
    const NUM_LINHAS = linhas;
    const salvarDuracao = tabela.map((processo, index) => ({ ...processo, salvarDuracao: processo.duracao }));

    const sortedTabela: Processo[] = salvarDuracao.map((processo, index) => ({
        ...processo,
        originalIndex: index
    })).sort((a, b) => a.chegada - b.chegada);

    let TOTAL_QUANTUM = tabela.reduce((acumulador, item) => acumulador + item.duracao, 0);
    const statusGrid: string[][] = Array(NUM_LINHAS).fill(null).map(() => []);
    let processoTerminou = 0;
    let numColunas = 0;

    let fila: Processo[] = [...sortedTabela];
    let processoAtual: Processo | null = null;

    // Adicionar variáveis de controle para animação
    const [currentStatusGrid, setCurrentStatusGrid] = useState<string[][]>(Array(NUM_LINHAS).fill(null).map(() => []));
    const [currentColumn, setCurrentColumn] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            if (currentColumn < numColunas) {
                const newStatusGrid = currentStatusGrid.map((row, rowIndex) => {
                    return rowIndex < NUM_LINHAS ? [...row] : row;
                });

                // Atualizar statusGrid baseado no tempo de execução
                for (let row = 0; row < NUM_LINHAS; row++) {
                    if (statusGrid[row][currentColumn]) {
                        newStatusGrid[row][currentColumn] = statusGrid[row][currentColumn];
                    }
                }

                setCurrentStatusGrid(newStatusGrid);
                setCurrentColumn((prevColumn) => prevColumn + 1);
            } else {
                clearInterval(interval);
            }
        }, 500);

        return () => clearInterval(interval);
    }, [currentColumn, currentStatusGrid]);

    // Algoritmo Round Robin
    while (TOTAL_QUANTUM > 0) {
        if (!processoAtual || processoAtual.duracao <= 0) {
            processoAtual = fila.find(p => p.chegada <= processoTerminou) || null;
            if (processoAtual) {
                fila = fila.filter(p => p !== processoAtual);
            }
        }

        if (processoAtual === null) {
            processoTerminou++;
            continue;
        }

        const startRow = processoAtual.originalIndex;
        const startCol = Math.max(processoAtual.chegada, processoTerminou);
        const tempoExecucao = Math.min(processoAtual.duracao, quantum);
        processoAtual.duracao -= tempoExecucao;
        TOTAL_QUANTUM -= tempoExecucao;
        processoTerminou += tempoExecucao;

        for (let col = startCol; col < startCol + tempoExecucao; col++) {
            if (!statusGrid[startRow]) {
                statusGrid[startRow] = [];
            }
            statusGrid[startRow][col] = 'green';
        }

        if (processoAtual.duracao > 0) {
            for (let col = processoTerminou; col < processoTerminou + sobrecarga; col++) {
                if (!statusGrid[startRow]) {
                    statusGrid[startRow] = [];
                }
                statusGrid[startRow][col] = 'red';
            }
            processoTerminou += sobrecarga;
        }

        for (let col = processoAtual.chegada; col < startCol; col++) {
            if (!statusGrid[startRow]) {
                statusGrid[startRow] = [];
            }
            else if (statusGrid[startRow][col] != 'green' && statusGrid[startRow][col] != 'red') {
                statusGrid[startRow][col] = 'yellow';
            }
        }

        const proximoProcesso = fila.find(p => p.chegada <= processoTerminou);
        if (processoAtual.duracao > 0 && proximoProcesso) {
            fila.push(processoAtual);
            processoAtual = null;
        }

        numColunas = Math.max(numColunas, processoTerminou);
    }

    const createGridItems = () => {
        const items = [];
        for (let row = 0; row < NUM_LINHAS; row++) {
            for (let col = 0; col < numColunas; col++) {
                const status = currentStatusGrid[row][col];
                items.push(
                    <div
                        key={`${row}-${col}`}
                        className={`flex items-center justify-center border border-black border-opacity-40 w-10 h-10 ${status === 'green' ? 'bg-green-500' : (status === 'yellow' ? 'bg-yellow-500' : (status === 'red' ? 'bg-red-500' : 'bg-white'))}`}
                    >
                    </div>
                );
            }
        }
        return items;
    };

    const calculateTurnaroundTime = () => {
        let nonWhiteCells = 0;

        for (let row = 0; row < NUM_LINHAS; row++) {
            for (let col = 0; col < numColunas; col++) {
                if (statusGrid[row][col] !== undefined && statusGrid[row][col] !== 'white') {
                    nonWhiteCells++;
                }
            }
        }

        return nonWhiteCells / linhas;
    };

    const turnaroundTime = calculateTurnaroundTime();

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
                {createGridItems()}
            </div>

            <div className="mt-4">
                <h4 className="text-lg font-extrabold">Turnaround:</h4>
                <p>{turnaroundTime.toFixed(2)}</p>
            </div>
        </div>
    );
};

export default RR;
