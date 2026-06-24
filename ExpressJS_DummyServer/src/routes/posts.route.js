import express from 'express';
import { getPosts } from "../controllers/posts.controller.js";

export const apiRouter = express.Router();
apiRouter.get('/posts', getPosts);
