import { z } from "zod";

export const finalizarCombustibleSchema = z.object({
  formaPago: z.enum(["carga", "ticket", "tarjeta", "efectivo", "otro"], {
    message: "Seleccione una forma de pago válida",
  }),
  valorTotal: z.number({
    message: "El monto debe ser un número válido",
  }).positive("El monto debe ser mayor a $0.00"),
  numVale: z.string().optional(),
  archivos: z.array(z.instanceof(File)).min(1, "Adjunta al menos un comprobante (JPG, PNG o PDF)."),
});

export type FinalizarCombustibleFormValues = z.infer<typeof finalizarCombustibleSchema>;

export const finalizarMantenimientoSchema = z.object({
  fechaRealizada: z.string().min(1, "Indique la fecha de ejecución técnica."),
  costoReal: z.number({
    message: "El monto debe ser un número válido",
  }).min(0, "El monto debe ser 0 o superior."),
  archivos: z.array(z.instanceof(File)).min(1, "Adjunta al menos un comprobante (JPG, PNG o PDF)."),
});

export type FinalizarMantenimientoFormValues = z.infer<typeof finalizarMantenimientoSchema>;
