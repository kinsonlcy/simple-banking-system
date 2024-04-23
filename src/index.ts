import express, { Express, Request, Response } from "express";

import dotenv from "dotenv";
import { router } from "./router";

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.send("Hello world!");
});

for (const route of router) {
  app.use(route.getRouter());
}

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
