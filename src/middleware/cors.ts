import cors from 'cors';
import express from 'express';

export const corsMiddleware = cors();
export const jsonMiddleware = express.json();