import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import FIFO from "@/components/FIFO";
import SJF from "@/components/SJF";
import EDF from "@/components/EDF";
import RR from "@/components/RR";

type Processo = {
  [x: string]: any;
  chegada: number;
  duracao: number;
  deadline: number;
  codigo: number;
  salvarDuracao?: number;
}

type SheetDemoProps = {
  tabelaProcessos: Processo[];
  selecionarEscalonamento: string | null;
  quantum: number;
  sobrecarga: number;
};

export function SheetDemo({
  tabelaProcessos,
  selecionarEscalonamento,
  quantum,
  sobrecarga,
}: SheetDemoProps) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        {tabelaProcessos.length > 0 ? (
          <Button variant="botao" size='sm'>Abrir gráfico</Button>
        ) : (
          <Button variant="undefined" size='sm'>Abrir gráfico</Button>
        )
        }
      </SheetTrigger>
      <SheetContent className="overflow-x-auto">
        <SheetHeader className="ml-4">
          <SheetTitle className="text-3xl font-bold mt-4">Escalonamento</SheetTitle>
          <SheetDescription className="text-base">
            Visualize as tabelas de escalonamento abaixo.
          </SheetDescription>
        </SheetHeader>
        <div className="grid gap-4 py-4">
          {selecionarEscalonamento === 'FIFO' && tabelaProcessos.length > 0 && <FIFO tabela={tabelaProcessos} linhas={tabelaProcessos.length} />}
          {selecionarEscalonamento === 'SJF' && tabelaProcessos.length > 0 && <SJF tabela={tabelaProcessos} linhas={tabelaProcessos.length} />}
          {selecionarEscalonamento === 'EDF' && tabelaProcessos.length > 0 && quantum > 0 && <EDF tabela={tabelaProcessos} linhas={tabelaProcessos.length} quantum={quantum} sobrecarga={sobrecarga} />}
          {selecionarEscalonamento === 'RR' && tabelaProcessos.length > 0 && quantum > 0 && <RR tabela={tabelaProcessos} linhas={tabelaProcessos.length} quantum={quantum} sobrecarga={sobrecarga} />}
        </div>
        {/* <SheetFooter>
          <SheetClose asChild>
            <Button variant="botao">Close</Button>
          </SheetClose>
        </SheetFooter> */}
      </SheetContent>
    </Sheet>
  );
}
