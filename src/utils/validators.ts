import { z } from "zod";

export const objectIdSchema = z
  .string()
  .refine(
    (v) => /^[a-fA-F0-9]{24}$/.test(v),
    { message: "Invalid Mongo ObjectId" }
  );

export const scanUpdateSchema = z.object({
  status: z.enum(["pending", "processing", "completed", "failed"]).optional(),
  failureReason: z.string().optional(),
  processedAt: z.coerce.date().optional(),
  result: z
    .object({
      diseaseId: z.string().optional(),
      label: z.string().optional(),
      confidence: z.number().min(0).max(1).optional(),
      notes: z.string().optional(),
      secondaryFindings: z
        .array(
          z.object({
            label: z.string(),
            confidence: z.number().min(0).max(1).optional(),
          })
        )
        .optional(),
    })
    .optional(),
  metadata: z.record(z.unknown()).optional(),
  rawModelOutput: z.unknown().optional(),
});

export const scanCompleteSchema = z.object({
  label: z.string().optional(),
  confidence: z.number().min(0).max(1).optional(),
  notes: z.string().optional(),
  severity: z.string().optional(),
  severityLocal: z.string().optional(),
  localeDisease: z.string().optional(),
  rawModelOutput: z.unknown().optional(),
  processedAt: z.coerce.date().optional(),
});

export const scanCreateSchema = scanUpdateSchema;

export const avatarUploadSchema = z.object({
  userId: objectIdSchema,
});
