const { parse } = require('../utils/validation');
const { publicUser } = require('../utils/serializers');
const { positiveId } = require('../utils/validation');
const { cadastroSchema, loginSchema, updateMeSchema, adminUserCreateSchema, adminUserUpdateSchema } = require('../validators/auth');
const authService = require('../services/auth.service');
const { issueToken, setSessionCookie, clearSessionCookie } = require('../middleware/auth');
const bcrypt = require('bcryptjs');
const { unprocessable } = require('../utils/errors');

function createAuthController(env) {
  return {
    register: async (req, res) => {
      const input = parse(cadastroSchema, req.body);
      const user = await authService.register(input);
      setSessionCookie(res, issueToken(user, env), env);
      return res.status(201).json({ dados: { usuario: publicUser(user) } });
    },

    login: async (req, res) => {
      const input = parse(loginSchema, req.body);
      const user = await authService.login(input);
      setSessionCookie(res, issueToken(user, env), env);
      return res.json({ dados: { usuario: publicUser(user) } });
    },

    registerForm: async (req, res) => {
      if (req.body.senha !== req.body.confirmar_senha) {
        throw unprocessable('SENHAS_DIFERENTES', 'A confirmação da senha não confere.');
      }
      const input = parse(cadastroSchema, {
        nome_jogador: req.body.nome_jogador,
        email: req.body.email,
        senha: req.body.senha,
      });
      const user = await authService.register(input);
      setSessionCookie(res, issueToken(user, env), env);
      return res.redirect(303, '/nexa-quest.html');
    },

    loginForm: async (req, res) => {
      const input = parse(loginSchema, { email: req.body.email, senha: req.body.senha });
      const user = await authService.login(input);
      setSessionCookie(res, issueToken(user, env), env);
      return res.redirect(303, '/nexa-quest.html');
    },

    logout: async (req, res) => {
      if (req.authUser) {
        req.authUser.token_version += 1;
        await req.authUser.save();
      }
      clearSessionCookie(res, env);
      return res.status(204).end();
    },

    me: async (req, res) => {
      const { getProfile } = require('../services/gamification.service');
      return res.json({ dados: await getProfile(req.authUser.id_usuario) });
    },

    updateMe: async (req, res) => {
      const input = parse(updateMeSchema, req.body);
      const user = req.authUser;

      if (input.nova_senha) {
        await authService.changePassword(user, input.senha_atual, input.nova_senha);
      }
      if (input.nome_jogador) user.nome_jogador = input.nome_jogador;
      if (input.email) user.email = input.email;
      await user.save();

      if (input.nova_senha) clearSessionCookie(res, env);
      return res.json({ dados: { usuario: publicUser(user) } });
    },

    listUsers: async (req, res) => {
      const { Usuario } = require('../models');
      const { pagination, searchWhere } = require('../utils/serializers');
      const { pagina, limite, offset } = pagination(req.query);
      const where = searchWhere(req.query, ['nome_jogador', 'email']);
      if (req.query.status && ['ativo', 'suspenso'].includes(req.query.status)) where.status = req.query.status;
      const { rows, count } = await Usuario.findAndCountAll({
        where,
        attributes: { exclude: ['senha_hash', 'token_version', 'excluido_em'] },
        order: [['criado_em', 'DESC']],
        limit: limite,
        offset,
      });
      return res.json({
        dados: rows,
        paginacao: { pagina, limite, total: count, paginas: Math.ceil(count / limite) },
      });
    },

    getUser: async (req, res) => {
      const { Usuario } = require('../models');
      const { notFound } = require('../utils/errors');
      const user = await Usuario.findByPk(positiveId(req.params.id, 'id_usuario'), {
        attributes: { exclude: ['senha_hash', 'token_version', 'excluido_em'] },
      });
      if (!user) throw notFound('Usuário não encontrado.');
      return res.json({ dados: user });
    },

    updateUser: async (req, res) => {
      const { Usuario } = require('../models');
      const { notFound, badRequest } = require('../utils/errors');
      const input = parse(adminUserUpdateSchema, req.body);
      const user = await Usuario.findByPk(positiveId(req.params.id, 'id_usuario'));
      if (!user) throw notFound('Usuário não encontrado.');
      if (user.id_usuario === req.authUser.id_usuario && input.status === 'suspenso') {
        throw badRequest('Não é possível suspender a própria conta.');
      }
      Object.assign(user, input);
      if (input.status === 'suspenso') user.token_version += 1;
      await user.save();
      return res.json({ dados: { usuario: publicUser(user) } });
    },

    deleteUser: async (req, res) => {
      const { Usuario } = require('../models');
      const { notFound, badRequest } = require('../utils/errors');
      const user = await Usuario.findByPk(positiveId(req.params.id, 'id_usuario'));
      if (!user) throw notFound('Usuário não encontrado.');
      if (user.id_usuario === req.authUser.id_usuario) throw badRequest('Não é possível excluir a própria conta.');
      user.token_version += 1;
      await user.save();
      await user.destroy();
      return res.status(204).end();
    },

    createUser: async (req, res) => {
      const { Usuario } = require('../models');
      const input = parse(adminUserCreateSchema, req.body);
      const exists = await Usuario.findOne({ where: { email: input.email }, paranoid: false });
      if (exists) {
        const { conflict } = require('../utils/errors');
        throw conflict('Este e-mail já está cadastrado.');
      }
      const user = await Usuario.create({
        nome_jogador: input.nome_jogador,
        email: input.email,
        senha_hash: await bcrypt.hash(input.senha, 12),
        papel: input.papel,
        status: input.status,
      });
      return res.status(201).json({ dados: { usuario: publicUser(user) } });
    },
  };
}

module.exports = { createAuthController };

