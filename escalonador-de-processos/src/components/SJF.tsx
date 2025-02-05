import React, { useState, useEffect } from 'react';

type Processo = {
    chegada: number;
    duracao: number;
    deadline?: number;
    codigo: number;
    originalIndex?: number;
}

type Props = {
    linhas: number;
    tabela: Processo[];
};

const SJF = ({ linhas, tabela }: Props) => {
    const NUM_LINHAS = linhas;

    const originalIndex = tabela.map((processo, index) => ({ ...processo, originalIndex: index }));

    let sortedTabela = originalIndex.slice().sort((a, b) => {
        if (a.chegada === b.chegada) {
            if (a.duracao === b.duracao) {
                return a.codigo - b.codigo;
            }
            return a.duracao - b.duracao;
        }
        return a.chegada - b.chegada;
    });

    const createGridItems = () => {
        const items = [];
        const statusGrid: string[][] = Array(NUM_LINHAS).fill(null).map(() => []);
        let processoTerminou = 0;
        let numColunas = 0;

        while (sortedTabela.length > 0) {
            const processo = sortedTabela.shift();
            if (processo === undefined) {
                continue
            }
            const startRow = processo.originalIndex!;
            const startCol = Math.max(processo.chegada, processoTerminou);

            for (let col = startCol; col < startCol + processo.duracao; col++) {
                statusGrid[startRow][col] = 'green';
            }

            for (let col = processo.chegada; col < startCol; col++) {
                statusGrid[startRow][col] = 'yellow';
            }

            processoTerminou = startCol + processo.duracao;
            numColunas = Math.max(numColunas, processoTerminou);

            sortedTabela.sort((a, b) => {
                if (a.chegada <= processoTerminou && b.chegada <= processoTerminou) {
                    if (a.duracao === b.duracao) {
                        return a.codigo - b.codigo;
                    }
                    return a.duracao - b.duracao;
                }
                return a.chegada - b.chegada;
            });
        }

        return { items, numColunas, statusGrid };
    };

    const { items, numColunas, statusGrid } = createGridItems();

    const calculateTurnaroundTime = () => {
        let nonWhiteCells = 0;

        for (let row = 0; row < NUM_LINHAS; row++) {
            for (let col = 0; col < numColunas; col++) {
                if (statusGrid[row][col] !== undefined ) {
                    nonWhiteCells++;
                }
            }
        }

        return nonWhiteCells / NUM_LINHAS;
    };

    const turnaroundTime = calculateTurnaroundTime();

    const [isDetailVisible, setIsDetailVisible] = useState(false);
    const [currentStatusGrid, setCurrentStatusGrid] = useState<string[][]>(Array(NUM_LINHAS).fill(null).map(() => []));
    const [currentColumn, setCurrentColumn] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            if (currentColumn < numColunas) {
                const newStatusGrid = currentStatusGrid.map((row, rowIndex) => {
                    return rowIndex < NUM_LINHAS ? [...row] : row;
                });

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

    function handleDetailVisibility() {
        setIsDetailVisible(!isDetailVisible);
    }

    return (
        <div className="flex flex-col items-center bg-gray-100 p-4 rounded-3xl">
            <button onClick={handleDetailVisibility} className='text-blue-800 font-semibold py-1 px-3 mb-4 rounded-lg'>
                {isDetailVisible ? "Esconder detalhes" : "Mostrar detalhes"}
            </button>

            {isDetailVisible ? (
                <div className="mb-4 -mt-2">
                    <h3 className="text-lg font-extrabold mt-2 mb-2">Tabela de Processos Ordenada:</h3>
                    <ul>
                        {originalIndex.map(processo => (
                            <li key={processo.codigo} className="flex gap-3 mb-2">
                                <span>{`Código: ${processo.codigo}`}</span>
                                <span>{` Chegada: ${processo.chegada}`}</span>
                                <span>{` Duração: ${processo.duracao}`}</span>
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
                {Array.from({ length: NUM_LINHAS }).map((_, row) => 
                    Array.from({ length: numColunas }).map((_, col) => {
                        const status = currentStatusGrid[row][col];
                        return (
                            <div
                                key={`${row}-${col}`}
                                className={`flex items-center justify-center border border-black border-opacity-40 w-10 h-10 ${status === 'green' ? 'bg-green-500' : (status === 'yellow' ? 'bg-yellow-400' : 'bg-white')}`}
                            />
                        );
                    })
                )}
            </div>

            <div className="mt-8">
                <h4 className="text-lg font-extrabold">Turnaround:</h4>
                <p>{turnaroundTime.toFixed(2)}</p>
            </div>
        </div>
    );
};

export default SJF;
