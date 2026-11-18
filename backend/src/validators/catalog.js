const { z } = require('zod');

const id = z.coerce.number().int().positive();
const shortText = (max = 120) => z.string().trim().min(1).max(max);
const optionalText = (max = 2000) => z.string().trim().max(max).nullable().optional();
const slug = z.string().trim().min(2).max(100).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
const positiveInteger = z.coerce.number().int().min(0);
const publication = z.enum(['rascunho', 'publicada', 'arquivada']);
const activeStatus = z.enum(['ativo', 'inativo']);
const webUrl = z.string().trim().url().max(2000).refine((value) => {
  try {
    return ['http:', 'https:'].includes(new URL(value).protocol);
  } catch {
    return false;
  }
}, 'Informe um endereço HTTP ou HTTPS.');

const schemas = {
  empresa: z.object({
    nome: shortText(120),
    descricao: optionalText(),
    ano_fundacao: z.coerce.number().int().min(1800).max(2200).nullable().optional(),
    slogan: optionalText(240),
  }).strict(),
  jogo: z.object({
    id_empresa: id,
    slug,
    nome: shortText(120),
    descricao: optionalText(),
    genero: optionalText(80),
    plataforma: optionalText(120),
    status: activeStatus.default('ativo'),
  }).strict(),
  jornada: z.object({
    id_jogo: id,
    slug,
    titulo: shortText(120),
    descricao: optionalText(),
    ordem_jornada: positiveInteger.default(1),
    nivel_minimo: positiveInteger.default(1),
    status: publication.default('rascunho'),
  }).strict(),
  missao: z.object({
    id_jornada: id,
    slug,
    titulo: shortText(120),
    descricao: optionalText(),
    ordem_missao: positiveInteger.default(1),
    tipo: z.enum(['quiz', 'confirmacao']).default('confirmacao'),
    nota_minima: z.coerce.number().min(0).max(100).default(100),
    xp_recompensa: z.coerce.number().int().min(0).max(10000).default(0),
    nivel_minimo: positiveInteger.default(1),
    status: publication.default('rascunho'),
  }).strict(),
  questao: z.object({
    enunciado: shortText(1000),
    opcoes: z.array(shortText(300)).min(2).max(6),
    indice_resposta: z.coerce.number().int().min(0).max(5),
    ordem_questao: z.coerce.number().int().min(1).max(100),
  }).strict(),
  desafio: z.object({
    id_jogo: id,
    id_missao: id,
    slug,
    titulo: shortText(120),
    descricao: optionalText(),
    xp_bonus: z.coerce.number().int().min(0).max(10000).default(0),
    inicia_em: z.coerce.date(),
    termina_em: z.coerce.date(),
    status: z.enum(['rascunho', 'ativo', 'encerrado']).default('rascunho'),
  }).strict(),
  nivel: z.object({
    numero_nivel: z.coerce.number().int().min(1).max(1000),
    titulo: shortText(80),
    xp_minimo: positiveInteger,
  }).strict(),
  conquista: z.object({
    codigo: slug,
    titulo: shortText(100),
    descricao: shortText(500),
    criterio: z.enum([
      'missoes_concluidas',
      'jornadas_concluidas',
      'desafios_concluidos',
      'xp_total',
    ]),
    meta: z.coerce.number().int().min(1).max(1000000),
    icone: z.string().trim().max(500).nullable().optional(),
    status: activeStatus.default('ativo'),
  }).strict(),
  conteudo: z.object({
    id_jogo: id,
    slug,
    titulo: shortText(120),
    resumo: optionalText(500),
    tipo: z.enum(['artigo', 'video', 'bonus']),
    corpo: optionalText(20000),
    url: webUrl.nullable().optional(),
    nivel_minimo: positiveInteger.default(1),
    xp_minimo: positiveInteger.default(0),
    status: activeStatus.default('ativo'),
  }).strict(),
};

function partial(schema) {
  return schema.partial();
}

module.exports = { schemas, partial };

