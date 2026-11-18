const { z } = require('zod');

const email = z.string().trim().email().max(254).transform((value) => value.toLowerCase());
const password = z.string().min(8).max(72).refine(
  (value) => Buffer.byteLength(value, 'utf8') <= 72,
  'A senha pode ter no máximo 72 bytes.',
);

const cadastroSchema = z.object({
  nome_jogador: z.string().trim().min(2).max(40),
  email,
  senha: password,
}).strict();

const loginSchema = z.object({ email, senha: z.string().min(1).max(72) }).strict();

const updateMeSchema = z.object({
  nome_jogador: z.string().trim().min(2).max(40).optional(),
  email: email.optional(),
  senha_atual: z.string().min(1).max(72).optional(),
  nova_senha: password.optional(),
}).strict().refine(
  (value) => Boolean(value.nome_jogador || value.email || value.nova_senha),
  'Informe ao menos um campo para atualizar.',
).refine(
  (value) => !value.nova_senha || Boolean(value.senha_atual),
  'Informe a senha atual para criar uma nova senha.',
);

const adminUserCreateSchema = z.object({
  nome_jogador: z.string().trim().min(2).max(40),
  email,
  senha: password,
  papel: z.enum(['jogador', 'admin']).default('jogador'),
  status: z.enum(['ativo', 'suspenso']).default('ativo'),
}).strict();

const adminUserUpdateSchema = z.object({
  nome_jogador: z.string().trim().min(2).max(40).optional(),
  email: email.optional(),
  papel: z.enum(['jogador', 'admin']).optional(),
  status: z.enum(['ativo', 'suspenso']).optional(),
}).strict().refine((value) => Object.keys(value).length > 0, 'Informe ao menos um campo.');

module.exports = { cadastroSchema, loginSchema, updateMeSchema, adminUserCreateSchema, adminUserUpdateSchema };

