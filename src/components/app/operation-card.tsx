import { CalendarClock, HandCoins, Landmark, UserRound } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/lib/format";
import { OperationCardData, SettlementStatus } from "@/lib/mock-data";

function statusVariant(status: SettlementStatus): "secondary" | "outline" | "default" {
  if (status === "pagado") return "default";
  if (status === "parcial") return "secondary";
  return "outline";
}

export function OperationCard({ operation }: { operation: OperationCardData }) {
  return (
    <Card className="border border-slate-200 bg-white shadow-sm">
      <CardHeader className="space-y-2 pb-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-sm leading-5 text-slate-900">{operation.cliente}</CardTitle>
          <Badge variant="outline" className="capitalize">
            {operation.etapa}
          </Badge>
        </div>
        <p className="text-xs font-medium text-slate-600">{operation.tipoOperacion}</p>
      </CardHeader>
      <CardContent className="space-y-3 text-xs text-slate-700">
        <div className="grid grid-cols-2 gap-2">
          <DataPill label="Comisión bruta" value={formatCurrency(operation.comisionBruta)} />
          <DataPill label="Comisión colaborador" value={formatCurrency(operation.comisionColaborador)} />
          <DataPill label="Margen empresa" value={formatCurrency(operation.margenEmpresa)} />
          <DataPill label="ID" value={operation.id} />
        </div>

        <div className="grid gap-1.5">
          <div className="flex items-center gap-1.5">
            <UserRound className="h-3.5 w-3.5 text-slate-500" />
            <span>{operation.colaborador}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CalendarClock className="h-3.5 w-3.5 text-slate-500" />
            <span>
              Próxima acción: {operation.proximaAccion} ({formatDate(operation.proximaFecha)})
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5">
          <Badge variant={statusVariant(operation.estadoCobro)}>
            <Landmark className="mr-1 h-3.5 w-3.5" />
            Cobro: {operation.estadoCobro}
          </Badge>
          <Badge variant={statusVariant(operation.estadoPago)}>
            <HandCoins className="mr-1 h-3.5 w-3.5" />
            Pago: {operation.estadoPago}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}

function DataPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5">
      <p className="text-[11px] text-slate-500">{label}</p>
      <p className="font-medium text-slate-900">{value}</p>
    </div>
  );
}
