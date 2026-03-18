export type OperationStage =
  | "nuevo"
  | "en gestión"
  | "propuesta enviada"
  | "pendiente respuesta"
  | "ganado"
  | "perdido";

export type SettlementStatus = "pendiente" | "parcial" | "pagado";

export type OperationCardData = {
  id: string;
  cliente: string;
  tipoOperacion: string;
  colaborador: string;
  comisionBruta: number;
  comisionColaborador: number;
  margenEmpresa: number;
  estadoCobro: SettlementStatus;
  estadoPago: SettlementStatus;
  proximaAccion: string;
  proximaFecha: string;
  etapa: OperationStage;
};

export type CashItem = {
  id: string;
  concepto: string;
  cliente?: string;
  importe: number;
  fecha: string;
  estado: SettlementStatus;
};

export const operationStages: OperationStage[] = [
  "nuevo",
  "en gestión",
  "propuesta enviada",
  "pendiente respuesta",
  "ganado",
  "perdido",
];

export const operations: OperationCardData[] = [
  {
    id: "OP-2048",
    cliente: "Grupo Pineda",
    tipoOperacion: "Seguro salud colectivo",
    colaborador: "Marta Núñez",
    comisionBruta: 9200,
    comisionColaborador: 2760,
    margenEmpresa: 6440,
    estadoCobro: "parcial",
    estadoPago: "pendiente",
    proximaAccion: "Enviar documentación de alta",
    proximaFecha: "2026-03-19",
    etapa: "pendiente respuesta",
  },
  {
    id: "OP-2051",
    cliente: "Construcciones Delta",
    tipoOperacion: "Leasing flota",
    colaborador: "Iván Soler",
    comisionBruta: 15800,
    comisionColaborador: 4740,
    margenEmpresa: 11060,
    estadoCobro: "pendiente",
    estadoPago: "pendiente",
    proximaAccion: "Llamada de cierre con dirección",
    proximaFecha: "2026-03-18",
    etapa: "propuesta enviada",
  },
  {
    id: "OP-2054",
    cliente: "Farma Norte",
    tipoOperacion: "Renting equipos",
    colaborador: "Lucía Vega",
    comisionBruta: 12100,
    comisionColaborador: 3630,
    margenEmpresa: 8470,
    estadoCobro: "pagado",
    estadoPago: "parcial",
    proximaAccion: "Liquidar segundo tramo colaborador",
    proximaFecha: "2026-03-22",
    etapa: "ganado",
  },
  {
    id: "OP-2060",
    cliente: "Aula Digital 360",
    tipoOperacion: "Póliza RC profesional",
    colaborador: "Jorge Durán",
    comisionBruta: 4300,
    comisionColaborador: 1290,
    margenEmpresa: 3010,
    estadoCobro: "pendiente",
    estadoPago: "pendiente",
    proximaAccion: "Solicitar CIF actualizado",
    proximaFecha: "2026-03-20",
    etapa: "en gestión",
  },
  {
    id: "OP-2064",
    cliente: "Hotel Costa Azul",
    tipoOperacion: "Financiación reforma",
    colaborador: "Marta Núñez",
    comisionBruta: 26700,
    comisionColaborador: 8010,
    margenEmpresa: 18690,
    estadoCobro: "pendiente",
    estadoPago: "pendiente",
    proximaAccion: "Subir propuesta final firmada",
    proximaFecha: "2026-03-24",
    etapa: "nuevo",
  },
  {
    id: "OP-2069",
    cliente: "ElectroSur",
    tipoOperacion: "Seguro crédito",
    colaborador: "Iván Soler",
    comisionBruta: 5900,
    comisionColaborador: 1770,
    margenEmpresa: 4130,
    estadoCobro: "pagado",
    estadoPago: "pagado",
    proximaAccion: "Cerrar expediente y pedir referidos",
    proximaFecha: "2026-03-28",
    etapa: "ganado",
  },
  {
    id: "OP-2072",
    cliente: "Atlántica Eventos",
    tipoOperacion: "Póliza multirriesgo",
    colaborador: "Lucía Vega",
    comisionBruta: 3800,
    comisionColaborador: 1140,
    margenEmpresa: 2660,
    estadoCobro: "pendiente",
    estadoPago: "pendiente",
    proximaAccion: "Registrar pérdida en CRM",
    proximaFecha: "2026-03-21",
    etapa: "perdido",
  },
  {
    id: "OP-2077",
    cliente: "NeoLogística",
    tipoOperacion: "Confirming proveedores",
    colaborador: "Jorge Durán",
    comisionBruta: 9900,
    comisionColaborador: 2970,
    margenEmpresa: 6930,
    estadoCobro: "parcial",
    estadoPago: "pendiente",
    proximaAccion: "Confirmar calendario de cobro",
    proximaFecha: "2026-03-23",
    etapa: "pendiente respuesta",
  },
];

export const cajaIngresos: CashItem[] = [
  {
    id: "I-801",
    concepto: "Comisión OP-2054",
    cliente: "Farma Norte",
    importe: 12100,
    fecha: "2026-03-07",
    estado: "pagado",
  },
  {
    id: "I-807",
    concepto: "Comisión OP-2069",
    cliente: "ElectroSur",
    importe: 5900,
    fecha: "2026-03-11",
    estado: "pagado",
  },
  {
    id: "I-811",
    concepto: "Primer pago OP-2048",
    cliente: "Grupo Pineda",
    importe: 4600,
    fecha: "2026-03-14",
    estado: "parcial",
  },
];

export const cajaGastos: CashItem[] = [
  {
    id: "G-420",
    concepto: "Nómina administrativa",
    importe: 2100,
    fecha: "2026-03-01",
    estado: "pagado",
  },
  {
    id: "G-423",
    concepto: "Licencias software",
    importe: 490,
    fecha: "2026-03-03",
    estado: "pagado",
  },
  {
    id: "G-428",
    concepto: "Publicidad digital",
    importe: 1200,
    fecha: "2026-03-12",
    estado: "pagado",
  },
];

export const cajaPorCobrar: CashItem[] = [
  {
    id: "C-112",
    concepto: "Comisión pendiente OP-2051",
    cliente: "Construcciones Delta",
    importe: 15800,
    fecha: "2026-03-26",
    estado: "pendiente",
  },
  {
    id: "C-115",
    concepto: "Comisión pendiente OP-2064",
    cliente: "Hotel Costa Azul",
    importe: 26700,
    fecha: "2026-03-29",
    estado: "pendiente",
  },
  {
    id: "C-119",
    concepto: "Segundo pago OP-2048",
    cliente: "Grupo Pineda",
    importe: 4600,
    fecha: "2026-03-24",
    estado: "pendiente",
  },
];

export const cajaPorPagar: CashItem[] = [
  {
    id: "P-301",
    concepto: "Comisión colaborador OP-2048",
    importe: 2760,
    fecha: "2026-03-20",
    estado: "pendiente",
  },
  {
    id: "P-307",
    concepto: "Comisión colaborador OP-2051",
    importe: 4740,
    fecha: "2026-03-27",
    estado: "pendiente",
  },
  {
    id: "P-309",
    concepto: "Segundo tramo OP-2054",
    importe: 1815,
    fecha: "2026-03-22",
    estado: "parcial",
  },
];
