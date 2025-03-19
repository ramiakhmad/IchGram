import { Router } from 'express';
import ifAuthenticated from "../middlewares/authMiddleware";
import {getChatByReceiverUsername, getUserChats} from "../controllers/messageController";

const router: Router = Router();

router.post('/get_chat', ifAuthenticated, getChatByReceiverUsername );
router.get('/get_user_chats', ifAuthenticated, getUserChats );

export default router;