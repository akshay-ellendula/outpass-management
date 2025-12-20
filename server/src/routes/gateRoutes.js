import express from 'express';
import { protect, authorize } from '../middleware/authMiddleware.js';


const router = express.Router();


export default router;