import { Router } from 'express';
import requireAuth from '../middleware/auth.js';
import { list, restore, moveToArchive, remove, empty } from '../controllers/trashController.js';

const router = Router();
router.use(requireAuth);

router.get('/', list);
router.post('/:id/restore', restore);
router.post('/:id/archive', moveToArchive);
router.delete('/:id', remove);
router.delete('/', empty);

export default router;
