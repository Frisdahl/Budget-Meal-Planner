import { z } from "zod";

const envSchema = z.object({
  PORT: z.coerce.number().default(3001),
  SALLING_API_TOKEN: z.string().min(1, "SALLING_API_TOKEN is required"),
  SALLING_API_BASE_URL: z
    .string()
    .url()
    .default("https://api.sallinggroup.com/v1"),
  CACHE_TTL_SECONDS: z.coerce.number().int().positive().default(900),
  REQUEST_TIMEOUT_MS: z.coerce.number().int().positive().default(8000),
});

export type Env = z.infer<typeof envSchema>;

let cachedEnv: Env | null = null;

export function getEnv(): Env {
  if (!cachedEnv) {
    cachedEnv = envSchema.parse(process.env);
  }
  return cachedEnv;
}

/** Call at startup to fail fast when configuration is invalid. */
export function validateEnv(): Env {
  return getEnv();
}
