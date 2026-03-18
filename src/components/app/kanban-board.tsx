import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OperationCard } from "@/components/app/operation-card";
import { OperationCardData, OperationStage } from "@/lib/mock-data";

type Props = {
  stages: OperationStage[];
  operations: OperationCardData[];
};

export function KanbanBoard({ stages, operations }: Props) {
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold tracking-tight">Operaciones</h2>
      <div className="overflow-x-auto pb-2">
        <div className="grid min-w-[1200px] grid-cols-6 gap-3">
          {stages.map((stage) => {
            const stageOperations = operations.filter((operation) => operation.etapa === stage);
            return (
              <Card key={stage} className="h-full border border-slate-200 bg-slate-100/70 shadow-none">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center justify-between text-sm capitalize">
                    <span>{stage}</span>
                    <span className="rounded-full bg-white px-2 py-0.5 text-xs text-slate-600">
                      {stageOperations.length}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {stageOperations.length ? (
                    stageOperations.map((operation) => (
                      <OperationCard key={operation.id} operation={operation} />
                    ))
                  ) : (
                    <div className="rounded-lg border border-dashed border-slate-300 bg-white/70 p-4 text-center text-xs text-slate-500">
                      Sin operaciones
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
