import express, { Express, Request, Response } from "express";

import dotenv from "dotenv";
import { router } from "./router";

dotenv.config();

const app: Express = express();

app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.json("Hello world!");
});

for (const route of router) {
  app.use(route.getRouter());
}

export default app;
