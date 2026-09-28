import express from 'express';
import { logRevision,getTodayRevisions,getAllRevisions } from '../controllers/revision.controller.js';
import {protect} from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/log',protect,logRevision);
router.get('/today',protect,getTodayRevisions);
router.get('/all',protect,getAllRevisions);

export default router;