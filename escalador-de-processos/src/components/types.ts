export type Processo = {
    chegada: number;
    duracao: number;
    deadline: number;
    codigo: number;
    pagina: number;
  };
  
  export type MemoryPage = {
    id: number;
    processId: number;
  };