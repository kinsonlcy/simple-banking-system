import { Request, Response } from "express";

import prisma from "./../../client";

class UserController {
  async create(req: Request, res: Response) {
    const { name, email } = req.body;

    const primaryBankAccount = [{ name: "default", balance: 0 }];

    try {
      const result = await prisma.user.create({
        data: {
          name,
          email,
          bankAccounts: {
            create: primaryBankAccount,
          },
        },
      });
      return res.json(result);
    } catch (e: any) {
      return res.status(400).send({ error: e.message });
    }
  }

  async find(req: Request, res: Response) {
    const { userId } = req.params;

    const user = await prisma.user.findUnique({
      where: {
        id: Number(userId),
      },
    });

    if (user === null) {
      return res
        .status(404)
        .send({ error: `User not found, userId: ${userId}` });
    }

    res.json(user);
  }
}

export default UserController;
