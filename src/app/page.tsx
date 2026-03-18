import { CashTabs } from "@/components/app/cash-tabs";
import { KanbanBoard } from "@/components/app/kanban-board";
import { KpiGrid } from "@/components/app/kpi-grid";
import {
  cajaGastos,
  cajaIngresos,
  cajaPorCobrar,
  cajaPorPagar,
  operationStages,
  operations,
} from "@/lib/mock-data";

function sum(values: number[]) {
  return values.reduce((total, value) => total + value, 0);
}

export default function Home() {
  const ingresosMes = sum(cajaIngresos.map((item) => item.importe));
  const gastosMes = sum(cajaGastos.map((item) => item.importe));
  const porCobrar = sum(cajaPorCobrar.map((item) => item.importe));
  const porPagar = sum(cajaPorPagar.map((item) => item.importe));
  const margenNeto = ingresosMes - gastosMes;
  const operacionesActivas = operations.filter(
    (operation) => operation.etapa !== "ganado" && operation.etapa !== "perdido"
  ).length;

  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-[1500px] space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        <header className="rounded-2xl border border-white/60 bg-gradient-to-r from-cyan-100/80 via-sky-50 to-emerald-100/70 p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-600">
            Operaciones y caja
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
            Panel comercial diario
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-700">
            Vista única para seguimiento de operaciones, cobros y pagos sin sobrecarga visual.
          </p>
        </header>

        <KpiGrid
          data={{
            ingresosMes,
            gastosMes,
            porCobrar,
            porPagar,
            margenNeto,
            operacionesActivas,
          }}
        />

        <KanbanBoard stages={operationStages} operations={operations} />

        <CashTabs
          ingresos={cajaIngresos}
          gastos={cajaGastos}
          porCobrar={cajaPorCobrar}
          porPagar={cajaPorPagar}
        />
      </div>
    </main>
  );
}
