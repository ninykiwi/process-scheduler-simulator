import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const PAGE_ACCESS_TIME = 1; // 1 u.t. para acesso a RAM
const DISK_ACCESS_TIME = 5; // 5 u.t. para acesso ao disco
const DISK_SIZE = 1000; // 1000KB disponíveis em disco

const VirtualMemoryManager = ({ 
  process, 
  onPageAllocation, 
  totalRAM = 200,
  pageSize = 4 
}) => {
  const [diskPages, setDiskPages] = useState([]);
  const [timeMetrics, setTimeMetrics] = useState([]);
  const [currentTime, setCurrentTime] = useState(0);
  const [usageHistory, setUsageHistory] = useState([]);

  // Calcular uso atual da RAM e disco
  const ramUsage = process.pages.reduce((sum, page) => 
    sum + (page.inMemory ? page.size : 0), 0);
  
  const diskUsage = process.pages.reduce((sum, page) => 
    sum + (!page.inMemory ? page.size : 0), 0);

  // Atualizar histórico de uso
  useEffect(() => {
    setUsageHistory(prev => [...prev, {
      time: currentTime,
      ramUsage,
      diskUsage,
      totalRAM,
      totalDisk: DISK_SIZE
    }].slice(-20)); // manter apenas os últimos 20 pontos
    
    setCurrentTime(prev => prev + 1);
  }, [ramUsage, diskUsage]);

  const handlePageSwap = async (processId, pageId) => {
    // simular tempo de acesso ao disco se necessário
    const page = process.pages.find(p => p.id === pageId);
    if (!page.inMemory) {
      setTimeMetrics(prev => [...prev, {
        pageId,
        operation: 'Page Fault',
        time: DISK_ACCESS_TIME,
        timestamp: currentTime
      }]);
      
      // aguardar o tempo de acesso ao disco
      await new Promise(resolve => setTimeout(resolve, DISK_ACCESS_TIME * 100));
    }
    
    onPageAllocation(processId, pageId);
  };

  return (
    <div className="space-y-6 p-4 border rounded-lg bg-white">
      <div className="grid grid-cols-2 gap-4">
        {/* Status da RAM */}
        <div className="p-4 bg-blue-50 rounded-lg">
          <h4 className="font-bold mb-2">RAM Status</h4>
          <div className="flex justify-between text-sm mb-2">
            <span>Em uso: {ramUsage}KB</span>
            <span>Disponível: {totalRAM - ramUsage}KB</span>
          </div>
          <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-500 transition-all"
              style={{ width: `${(ramUsage / totalRAM) * 100}%` }}
            />
          </div>
        </div>

        {/* Status do Disco */}
        <div className="p-4 bg-green-50 rounded-lg">
          <h4 className="font-bold mb-2">Disco Status</h4>
          <div className="flex justify-between text-sm mb-2">
            <span>Em uso: {diskUsage}KB</span>
            <span>Disponível: {DISK_SIZE - diskUsage}KB</span>
          </div>
          <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-green-500 transition-all"
              style={{ width: `${(diskUsage / DISK_SIZE) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Gráfico de uso */}
      <div className="h-64">
        <LineChart width={600} height={240} data={usageHistory}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" label={{ value: 'Tempo (u.t.)', position: 'bottom' }} />
          <YAxis label={{ value: 'Uso (KB)', angle: -90, position: 'left' }} />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="ramUsage" stroke="#3B82F6" name="RAM" />
          <Line type="monotone" dataKey="diskUsage" stroke="#22C55E" name="Disco" />
        </LineChart>
      </div>

      {/* Grade de Páginas */}
      <div className="grid grid-cols-5 gap-2">
        {process.pages.map((page) => (
          <button
            key={page.id}
            onClick={() => handlePageSwap(process.codigo, page.id)}
            className={`
              p-3 rounded-md text-center transition-all
              ${page.inMemory 
                ? 'bg-blue-500 text-white hover:bg-blue-600' 
                : 'bg-green-500 text-white hover:bg-green-600'}
            `}
          >
            <div className="text-sm font-medium">Página {page.id + 1}</div>
            <div className="text-xs">{page.size}KB</div>
            <div className="text-xs mt-1">
              {page.inMemory ? 'RAM' : 'Disco'}
            </div>
          </button>
        ))}
      </div>

      {/* Métricas de Tempo */}
      <div className="mt-4">
        <h4 className="font-bold mb-2">Histórico de Page Faults</h4>
        <div className="max-h-32 overflow-y-auto">
          {timeMetrics.map((metric, index) => (
            <div key={index} className="text-sm text-gray-600">
              {`Página ${metric.pageId + 1}: ${metric.operation} - ${metric.time} u.t. (T=${metric.timestamp})`}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VirtualMemoryManager;