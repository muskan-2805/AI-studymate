import express from 'express';
import {register,login,getMe,refresh,logout,logoutAll} from "../controllers/auth.controller.js";
import {protect} from '../middleware/auth.middleware.js';
import { forgotPassword,resetPassword,updateProfile,changePassword} from '../controllers/auth.controller.js';

const router = express.Router();

router.post('/register',register);
router.post('/login',login);
router.get('/me',protect,getMe);//it takes two functions ..protect runs first and only if it calls next() then getMe() runs 
router.post('/refresh',refresh);
router.post('/logout',logout);
router.post('/logout-all',protect,logoutAll);
router.post('/forgot-password',forgotPassword);
router.post('/reset-password',resetPassword);
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);

export default router;
