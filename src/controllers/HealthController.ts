import { Request, Response } from "express";

class HealthController {
  healthCheck(req: Request, res: Response) {
    res.json("I'm healthy!");
  }
}

export default HealthController;
