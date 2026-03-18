import { ComponentType } from "react";
import { ArrowDownRight, ArrowUpRight, Banknote, BriefcaseBusiness, Wallet } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/format";

type KpiData = {
  ingresosMes: number;
  gastosMes: number;
  porCobrar: number;
  porPagar: number;
  margenNeto: number;
  operacionesActivas: number;
};

type KpiItem = {
  id: string;
  label: string;
  value: string;
  icon: ComponentType<{ className?: string }>;
  accent: string;
};

export function KpiGrid({ data }: { data: KpiData }) {
  const items: KpiItem[] = [
    {
      id: "ingresos",
      label: "Ingresos del mes",
      value: formatCurrency(data.ingresosMes),
      icon: ArrowUpRight,
      accent: "text-emerald-600",
    },
    {
      id: "gastos",
      label: "Gastos del mes",
      value: formatCurrency(data.gastosMes),
      icon: ArrowDownRight,
      accent: "text-rose-600",
    },
    {
      id: "por-cobrar",
      label: "Por cobrar",
      value: formatCurrency(data.porCobrar),
      icon: Wallet,
      accent: "text-amber-600",
    },
    {
      id: "por-pagar",
      label: "Por pagar",
      value: formatCurrency(data.porPagar),
      icon: Banknote,
      accent: "text-orange-600",
    },
    {
      id: "margen",
      label: "Margen neto",
      value: formatCurrency(data.margenNeto),
      icon: ArrowUpRight,
      accent: "text-sky-700",
    },
    {
      id: "activas",
      label: "Operaciones activas",
      value: String(data.operacionesActivas),
      icon: BriefcaseBusiness,
      accent: "text-indigo-700",
    },
  ];

  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold tracking-tight">Resumen rápido</h2>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.id} className="border border-white/70 bg-white/90 shadow-sm">
              <CardHeader className="pb-1">
                <CardTitle className="flex items-center justify-between text-sm text-slate-600">
                  <span>{item.label}</span>
                  <Icon className={`h-4 w-4 ${item.accent}`} />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold tracking-tight text-slate-900">{item.value}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
