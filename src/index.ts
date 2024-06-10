import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import multer from 'multer';
import uploadRoute from './routes/upload';

dotenv.config();

const app: Express = express();
const upload = multer({ dest: '../assets/uploads/' });

const port = process.env.PORT || 3000;

app.use('/upload', upload.single('file'), uploadRoute);

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
