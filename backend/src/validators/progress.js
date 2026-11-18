const { z } = require('zod');

const startMissionSchema = z.object({}).strict();
const completeMissionSchema = z.discriminatedUnion('tipo', [
  z.object({ tipo: z.literal('quiz'), respostas: z.array(z.object({
    id_questao: z.coerce.number().int().positive(),
    indice_opcao: z.coerce.number().int().min(0).max(5),
  }).strict()).min(1).max(100).superRefine((answers, context) => {
    const questionIds = answers.map((answer) => answer.id_questao);
    if (new Set(questionIds).size !== questionIds.length) {
      context.addIssue({ code: 'custom', message: 'Cada questão deve aparecer uma única vez.', path: [] });
    }
  }) }).strict(),
  z.object({ tipo: z.literal('confirmacao'), confirmada: z.literal(true) }).strict(),
]);

const idSchema = z.object({ id: z.coerce.number().int().positive() });

module.exports = { startMissionSchema, completeMissionSchema, idSchema };

