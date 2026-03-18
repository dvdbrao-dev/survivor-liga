"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/lib/format";
import { CashItem } from "@/lib/mock-data";

type Props = {
  ingresos: CashItem[];
  gastos: CashItem[];
  porCobrar: CashItem[];
  porPagar: CashItem[];
};

export function CashTabs({ ingresos, gastos, porCobrar, porPagar }: Props) {
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold tracking-tight">Caja</h2>
      <Card className="border border-slate-200 bg-white shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-slate-700">Control de flujo</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="ingresos" className="w-full">
            <TabsList className="mb-3 w-full justify-start overflow-x-auto bg-slate-100 p-1">
              <TabsTrigger value="ingresos">Ingresos</TabsTrigger>
              <TabsTrigger value="gastos">Gastos</TabsTrigger>
              <TabsTrigger value="por-cobrar">Por cobrar</TabsTrigger>
              <TabsTrigger value="por-pagar">Por pagar</TabsTrigger>
            </TabsList>
            <TabsContent value="ingresos">
              <CashTable rows={ingresos} />
            </TabsContent>
            <TabsContent value="gastos">
              <CashTable rows={gastos} />
            </TabsContent>
            <TabsContent value="por-cobrar">
              <CashTable rows={porCobrar} />
            </TabsContent>
            <TabsContent value="por-pagar">
              <CashTable rows={porPagar} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </section>
  );
}

function CashTable({ rows }: { rows: CashItem[] }) {
  return (
    <div className="overflow-hidden rounded-lg border border-slate-200">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
          <tr>
            <th className="px-3 py-2">Concepto</th>
            <th className="px-3 py-2">Cliente</th>
            <th className="px-3 py-2">Fecha</th>
            <th className="px-3 py-2">Importe</th>
            <th className="px-3 py-2">Estado</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="border-t border-slate-100">
              <td className="px-3 py-2 font-medium text-slate-800">{row.concepto}</td>
              <td className="px-3 py-2 text-slate-600">{row.cliente ?? "-"}</td>
              <td className="px-3 py-2 text-slate-600">{formatDate(row.fecha)}</td>
              <td className="px-3 py-2 text-slate-800">{formatCurrency(row.importe)}</td>
              <td className="px-3 py-2">
                <Badge variant="outline" className="capitalize">
                  {row.estado}
                </Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
