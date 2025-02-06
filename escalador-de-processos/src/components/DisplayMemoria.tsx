import React from 'react';
import { MemoryPage } from './types'

type DisplayMemoriaProps = {
  ram: MemoryPage[];
  disk: MemoryPage[];
};

export const DisplayMemoria: React.FC<DisplayMemoriaProps> = ({ ram, disk }) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-md w-full">
      <div className='flex gap-4'>
        <div className='w-1/2'>
          <h4 className="text-md font-semibold">RAM</h4>
          <div className="border p-2 rounded-md bg-gray-100">
            <div className="flex gap-1 flex-wrap">
              {ram.map((slot, index) => (
                <div
                  key={index}
                  className={`w-8 h-8 text-white text-xs flex justify-center items-center rounded ${
                    slot.id === -1 ? 'bg-gray-300' : 'bg-blue-500'
                  }`}
                  title={slot.id === -1 ? 'Free Slot' : `Page ${slot.id} (Process ${slot.processId})`}
                >
                  {slot.id === -1 ? '' : slot.processId}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className='w-1/2'>
          <h4 className="text-md font-semibold">Disco</h4>
          <div className="border p-2 rounded-md bg-gray-100">
            <div className="flex gap-1 flex-wrap">
              {disk.map((page) => (
                <div
                  key={page.id}
                  className="w-8 h-8 bg-gray-500 text-white text-xs flex justify-center items-center rounded"
                  title={`Page ${page.id} (Process ${page.processId})`}
                >
                  {page.processId}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};