import { Router } from 'express';
import requireAuth from '../middleware/auth.js';
import buildItemController from '../controllers/itemControllerFactory.js';

export default function buildItemRoutes(Model, type) {
  const router = Router();
  const { list, create, update, remove, archive } = buildItemController(Model, type);

  router.use(requireAuth); // every route below this line requires a logged-in user

  router.get('/', list);
  router.post('/', create);
  router.put('/:id', update);
  router.delete('/:id', remove);
  router.patch('/:id/archive', archive);

  return router;
}
