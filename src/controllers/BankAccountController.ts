import { Request, Response } from "express";

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

class BankAccountController {
  async create(req: Request, res: Response) {
    const { bankAccountName, ownerEmail } = req.body;

    if (bankAccountName === undefined) {
      return res.status(400).send({ error: "Bank account name is empty" });
    }

    try {
      const result = await prisma.bankAccount.create({
        data: {
          name: bankAccountName,
          balance: 0,
          owner: { connect: { email: ownerEmail } },
        },
      });
      res.json(result);
    } catch (e: any) {
      return res.status(400).send({ error: e.message });
    }
  }

  async findByUserId(req: Request, res: Response) {
    const { user_id } = req.params;
    const { name } = req.query;

    const bankAccounts = await prisma.bankAccount.findMany({
      where: {
        ownerId: Number(user_id),
        ...(name ? { AND: [{ name: String(name) }] } : {}),
      },
    });

    res.json(bankAccounts);
  }

  async deposit(req: Request, res: Response) {
    const { bankAccountId, amount } = req.body;

    if (amount <= 0) {
      return res.status(400).send({ error: "amount is invalid" });
    }

    try {
      const bankAccount = await prisma.bankAccount.update({
        where: { id: Number(bankAccountId) },
        data: { balance: { increment: amount } },
      });

      res.json(bankAccount);
    } catch (error) {
      res.json({ error: "Deposit failed" });
    }
  }

  async withdraw(req: Request, res: Response) {
    const { bankAccountId, amount } = req.body;

    if (amount <= 0) {
      return res.status(400).send({ error: "amount is invalid" });
    }

    try {
      const bankAccount = await prisma.bankAccount.findUnique({
        where: { id: Number(bankAccountId) },
      });

      if (bankAccount && bankAccount.balance < amount) {
        return res
          .status(400)
          .send({ error: "bank account does not have enough balance" });
      }

      const updatedBankAccount = await prisma.bankAccount.update({
        where: { id: Number(bankAccountId) },
        data: { balance: { decrement: amount } },
      });

      res.json(updatedBankAccount);
    } catch (error) {
      res.json({ error: "Withdraw failed" });
    }
  }
}

export default BankAccountController;
