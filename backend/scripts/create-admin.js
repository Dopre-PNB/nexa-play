require('dotenv').config();

const bcrypt = require('bcryptjs');
const { z } = require('zod');
const { sequelize, Usuario } = require('../src/models');

const settings = z.object({
  ADMIN_NAME: z.string().trim().min(2).max(40),
  ADMIN_EMAIL: z.string().trim().email().max(254).transform((value) => value.toLowerCase()),
  ADMIN_PASSWORD: z.string().min(12).max(72),
}).safeParse(process.env);

async function main() {
  if (!settings.success) {
    const missing = settings.error.issues.map((issue) => issue.path.join('.')).join(', ');
    throw new Error(`Configure ADMIN_NAME, ADMIN_EMAIL e ADMIN_PASSWORD no .env. Verifique: ${missing}`);
  }

  await sequelize.authenticate();
  const { ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD } = settings.data;
  const existing = await Usuario.findOne({ where: { email: ADMIN_EMAIL }, paranoid: false });

  if (existing) {
    if (existing.papel !== 'admin') {
      throw new Error('Este e-mail já pertence a um jogador. Remova a conta ou use outro e-mail para o primeiro administrador.');
    }
    console.info('O administrador informado já existe; nenhuma alteração foi feita.');
    return;
  }

  await Usuario.create({
    nome_jogador: ADMIN_NAME,
    email: ADMIN_EMAIL,
    senha_hash: await bcrypt.hash(ADMIN_PASSWORD, 12),
    papel: 'admin',
    status: 'ativo',
  });
  console.info(`Administrador ${ADMIN_EMAIL} criado.`);
}

main()
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(async () => sequelize.close());
