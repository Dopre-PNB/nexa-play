const express = require('express');
const { createAuthController } = require('../controllers/auth.controller');
const { progressController } = require('../controllers/progress.controller');
const { createSharingController } = require('../controllers/sharing.controller');
const { createCatalogController, resources } = require('../controllers/catalog.controller');
const { adminQuestionsController } = require('../controllers/admin-questions.controller');
const { createAuthMiddleware } = require('../middleware/auth');
const { createAuthLimiter } = require('../middleware/rate-limit');
const { sequelize } = require('../models');

function dispatchAdmin(action, catalog) {
  return (req, res, next) => {
    const controller = catalog[req.params.resource];
    if (!controller) return next();
    return controller[action](req, res, next);
  };
}

function createApiRouter(env) {
  const router = express.Router();
  const auth = createAuthMiddleware(env);
  const authController = createAuthController(env);
  const sharingController = createSharingController(env);
  const catalog = createCatalogController();
  const limiter = createAuthLimiter();

  router.get('/health', async (_req, res) => {
    await sequelize.authenticate();
    return res.json({ dados: { status: 'ok', banco: 'conectado' } });
  });

  router.post('/usuarios', limiter, authController.register);
  router.post('/auth/login', limiter, authController.login);
  router.post('/forms/cadastro', limiter, authController.registerForm);
  router.post('/forms/login', limiter, authController.loginForm);
  router.post('/auth/logout', auth.optionalAuthenticate, authController.logout);
  router.get('/auth/me', auth.authenticate, authController.me);
  router.patch('/usuarios/me', auth.authenticate, authController.updateMe);
  router.get('/usuarios/me/progresso', auth.authenticate, progressController.userProgress);
  router.get('/usuarios/me/conquistas', auth.authenticate, progressController.userAchievements);

  router.get('/jornadas/:id/missoes', catalog.journeyMissions);
  router.get('/missoes/:id/questoes', auth.authenticate, progressController.missionQuestions);
  router.post('/missoes/:id/iniciar', auth.authenticate, progressController.startMission);
  router.post('/missoes/:id/concluir', auth.authenticate, progressController.completeMission);
  router.post('/desafios/:id/iniciar', auth.authenticate, progressController.startChallenge);
  router.post('/desafios/:id/concluir', auth.authenticate, progressController.completeChallenge);
  router.get('/conteudos', auth.authenticate, progressController.contents);

  router.post('/conquistas/:id/compartilhar', auth.authenticate, sharingController.create);
  router.get('/compartilhamentos/:token', sharingController.getPublic);
  router.delete('/compartilhamentos/:id', auth.authenticate, sharingController.revoke);

  for (const [name, resource] of Object.entries(resources)) {
    if (resource.playerOnly) continue;
    router.get(`/${name}`, catalog[name].publicList);
    router.get(`/${name}/:id`, catalog[name].publicGet);
  }

  router.use('/admin', auth.authenticate, auth.requireAdmin);
  router.get('/admin/usuarios', authController.listUsers);
  router.post('/admin/usuarios', authController.createUser);
  router.get('/admin/usuarios/:id', authController.getUser);
  router.patch('/admin/usuarios/:id', authController.updateUser);
  router.delete('/admin/usuarios/:id', authController.deleteUser);

  router.get('/admin/missoes/:id/questoes', adminQuestionsController.list);
  router.post('/admin/missoes/:id/questoes', adminQuestionsController.create);
  router.patch('/admin/questoes/:id', adminQuestionsController.update);
  router.delete('/admin/questoes/:id', adminQuestionsController.remove);

  router.get('/admin/:resource', dispatchAdmin('adminList', catalog));
  router.post('/admin/:resource', dispatchAdmin('create', catalog));
  router.get('/admin/:resource/:id', dispatchAdmin('adminGet', catalog));
  router.patch('/admin/:resource/:id', dispatchAdmin('update', catalog));
  router.delete('/admin/:resource/:id', dispatchAdmin('remove', catalog));

  return router;
}

module.exports = { createApiRouter };
