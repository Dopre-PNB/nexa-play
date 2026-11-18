const { positiveId } = require('../utils/validation');
const sharingService = require('../services/sharing.service');

function createSharingController(env) {
  return {
    create: async (req, res) => {
      const result = await sharingService.createShare(
        req.authUser.id_usuario,
        positiveId(req.params.id, 'id_conquista'),
        env,
      );
      return res.status(201).json({ dados: result });
    },
    getPublic: async (req, res) => {
      return res.json({ dados: await sharingService.getPublicShare(req.params.token) });
    },
    revoke: async (req, res) => {
      const result = await sharingService.revokeShare(
        req.authUser.id_usuario,
        positiveId(req.params.id, 'id_compartilhamento'),
      );
      return res.json({ dados: { revogado_em: result.revogado_em } });
    },
  };
}

module.exports = { createSharingController };

