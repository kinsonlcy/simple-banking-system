import { Request, Response } from "express";

class HealthController {
  healthCheck(req: Request, res: Response) {
    res.send("I'm healthy!");
  }
}

export default HealthController;
