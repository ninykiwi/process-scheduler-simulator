import React from 'react';

type MemoryPage = {
  id: number;
  size: number; // tamanho em KB
  inMemory: boolean; // se está na RAM ou não
};

type Process = {
  codigo: number;
  pages: MemoryPage[];
  totalMemory: number;
};

type MemoryManagerProps = {
  process: Process;
  onPageAllocation: (processId: number, pageId: number) => void;
};

const PAGE_SIZE = 4; // máximo de 4KB por página
const MAX_PAGES = 10; // máximo de páginas por processo
const TOTAL_MEMORY = 200; // 200KB RAM

const MemoryManager = ({ process, onPageAllocation }: MemoryManagerProps) => {
  const usedMemory = process.pages.reduce((sum, page) => 
    sum + (page.inMemory ? page.size : 0), 0);

  return (
    <div className="p-4 border rounded-lg bg-white">
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-bold">Páginas do Processo {process.codigo}</h3>
          <div className="text-sm text-gray-600">
            {process.pages.length}/{MAX_PAGES} páginas
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm">Memória Total: {process.totalMemory}KB</span>
          <span className="text-sm">Em Uso: {usedMemory}KB</span>
          <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-500 transition-all"
              style={{ width: `${(usedMemory / process.totalMemory) * 100}%` }}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-2">
        {process.pages.map((page) => (
          <button
            key={page.id}
            onClick={() => onPageAllocation(process.codigo, page.id)}
            className={`
              p-3 rounded-md text-center transition-all
              ${page.inMemory 
                ? 'bg-green-500 text-white hover:bg-green-600' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}
            `}
          >
            <div className="text-sm font-medium">Página {page.id + 1}</div>
            <div className="text-xs">{page.size}KB</div>
            <div className="text-xs mt-1">
              {page.inMemory ? 'Na RAM' : 'Em Swap'}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default MemoryManager;