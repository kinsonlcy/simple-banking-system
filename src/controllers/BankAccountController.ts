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

  async transfer(req: Request, res: Response) {
    const { fromAccountId, toAccountId, amount } = req.body;

    if (amount <= 0) {
      return res.status(400).send({ error: "amount is invalid" });
    }

    try {
      const result = await prisma.$transaction(async (tx) => {
        const fromBankAccount = await tx.bankAccount.update({
          data: {
            balance: {
              decrement: amount,
            },
          },
          where: {
            id: fromAccountId,
          },
        });

        if (fromBankAccount.balance < 0) {
          throw new Error(
            `bank account id: ${fromAccountId} does not have enough fund`
          );
        }

        const toBankAccount = await tx.bankAccount.update({
          data: {
            balance: {
              increment: amount,
            },
          },
          where: {
            id: toAccountId,
          },
        });

        return { from: fromBankAccount, to: toBankAccount };
      });
      res.json(result);
    } catch (e: any) {
      res.json({ error: `Transfer failed, ${e.message}` });
    }
  }
}

export default BankAccountController;
