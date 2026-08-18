import { Router } from 'express';
import requireAuth from '../middleware/auth.js';
import { list, restore, moveToTrash } from '../controllers/archiveController.js';

const router = Router();
router.use(requireAuth);

router.get('/', list);
router.post('/:id/restore', restore);
router.post('/:id/trash', moveToTrash);

export default router;
