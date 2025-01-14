import { useState } from "react";

type Props = {
  numeroDoProcesso: number;
  onClick: (chegada: string, duracao: string, deadline: string) => void;
};

const Modal = ({ numeroDoProcesso, onClick: criarProcesso }: Props) => {
  const [chegada, setChegada] = useState("");
  const [duracao, setDuracao] = useState("");
  const [deadline, setDeadline] = useState("");

  const handleClick = () => {
    criarProcesso(chegada, duracao, deadline);
  };

  return (
    <div className="flex flex-col justify-center">
      <div className="flex flex-col gap-3">
        <h2 className="font-bold"> Processo: {numeroDoProcesso}</h2>
        <div className="flex flex-col gap-1">
          <label htmlFor="chegada" className="font-bold">Chegada</label>
          <input
            type="number"
            id="chegada"
            className="py-2 pl-3 pr-2 rounded-lg bg-slate-300"
            placeholder="0"
            value={chegada}
            onChange={(e) => setChegada(e.target.value)}
            min={0}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="duracao" className="font-bold">Duração</label>
          <input
            type="number"
            id="duracao"
            className="py-2 pl-3 pr-2 rounded-lg bg-slate-300"
            placeholder="0"
            value={duracao}
            onChange={(e) => setDuracao(e.target.value)}
            min={0}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="deadline" className="font-bold">Deadline</label>
          <input
            type="number"
            id="deadline"
            className="py-2 pl-3 pr-2 rounded-lg bg-slate-300"
            placeholder="0"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            min={0}
          />
        </div>
        <button onClick={handleClick} className="w-full py-2 mt-3 rounded-lg text-white bg-slate-600">
          Criar processo
        </button>
      </div>
    </div>
  );
};

export default Modal;
