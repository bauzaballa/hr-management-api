import { createCommentRequests } from '@components/Request/controllers/POST';
import { Router } from 'express';

const router = Router();

router.post('/activity/request/:id', createCommentRequests);

export default router;
