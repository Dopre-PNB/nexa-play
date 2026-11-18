const { z } = require('zod');

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().min(1).max(65535).default(3000),
  DB_DIALECT: z.enum(['mysql', 'postgres']).default('mysql'),
  DATABASE_URL: z.string().url().optional(),
  DB_HOST: z.string().min(1).optional(),
  DB_PORT: z.coerce.number().int().min(1).max(65535).optional(),
  DB_NAME: z.string().min(1).optional(),
  DB_USER: z.string().min(1).optional(),
  DB_PASSWORD: z.string().default(''),
  DB_SSL: z.enum(['true', 'false']).default('false'),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET precisa ter pelo menos 32 caracteres.'),
  JWT_EXPIRES_IN: z.string().default('8h'),
  COOKIE_NAME: z.string().default('nexa_session'),
  COOKIE_SECURE: z.enum(['true', 'false']).default('false'),
  FRONTEND_ORIGINS: z.string().default('http://localhost:5500,http://127.0.0.1:5500'),
  PUBLIC_APP_URL: z.string().url().default('http://localhost:5500'),
  API_PUBLIC_URL: z.string().url().optional(),
}).superRefine((value, context) => {
  if (!value.DATABASE_URL) {
    for (const key of ['DB_HOST', 'DB_NAME', 'DB_USER']) {
      if (!value[key]) context.addIssue({ code: 'custom', path: [key], message: 'Informe este campo ou use DATABASE_URL.' });
    }
  }
});

function loadEnv() {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    const lines = parsed.error.issues.map((issue) => `- ${issue.path.join('.')}: ${issue.message}`);
    throw new Error(`Configuração inválida. Confira o arquivo .env:\n${lines.join('\n')}`);
  }

  const env = parsed.data;
  env.DB_PORT = env.DB_PORT || (env.DB_DIALECT === 'postgres' ? 5432 : 3306);
  env.DB_SSL = env.DB_SSL === 'true';
  env.API_PUBLIC_URL = env.API_PUBLIC_URL || `${process.env.RENDER_EXTERNAL_URL || 'http://localhost:3000'}/api`;
  env.FRONTEND_ORIGINS = env.FRONTEND_ORIGINS.split(',').map((item) => item.trim()).filter(Boolean);
  env.COOKIE_SECURE = env.COOKIE_SECURE === 'true' || env.NODE_ENV === 'production';
  return env;
}

module.exports = { loadEnv };

