import { Router } from 'express';
import { MediaController } from '../controllers/media.controller.js';
import { authenticate, optionalAuth } from '../middleware/auth.js';
import { checkMediaOwnership } from '../middleware/rbac.js';
import { upload } from '../middleware/upload.js';
import { activityLogger } from '../middleware/activityLogger.js';

const router = Router();

router.get('/uploads', optionalAuth, MediaController.getMedia);
router.post('/uploads', authenticate, upload.single('file'), activityLogger('Uploaded Media'), MediaController.uploadMedia);
router.post('/uploads/bulk', authenticate, upload.array('files', 10), activityLogger('Bulk Uploaded Media'), MediaController.uploadBulk);
router.put('/uploads/:id', authenticate, checkMediaOwnership, upload.single('file'), activityLogger('Replaced Media'), MediaController.replaceMedia);
router.patch('/uploads/bulk-move', authenticate, activityLogger('Bulk Moved Media'), MediaController.bulkMove);
router.patch('/uploads/:id', authenticate, checkMediaOwnership, upload.none(), activityLogger('Updated Media'), MediaController.updateMedia);
router.delete('/uploads/:id', authenticate, checkMediaOwnership, activityLogger('Deleted Media'), MediaController.deleteMedia);

router.get('/uploads/folders/all', MediaController.getFolders);
router.post('/uploads/folders', authenticate, activityLogger('Created Folder'), MediaController.createFolder);
router.delete('/uploads/folders/:id', authenticate, activityLogger('Deleted Folder'), MediaController.deleteFolder);

export default router;
