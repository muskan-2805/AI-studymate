import express from 'express';
import { logRevision,getTodayRevisions } from '../controllers/revision.controller.js';
import {protect} from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/log',protect,logRevision);
router.get('/today',protect,getTodayRevisions);

export default router;