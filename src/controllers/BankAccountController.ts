import { Request, Response } from "express";

import prisma from "./../../client";

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
    const { userId } = req.params;
    const { name } = req.query;

    const bankAccounts = await prisma.bankAccount.findMany({
      where: {
        ownerId: Number(userId),
        ...(name ? { AND: [{ name: String(name) }] } : {}),
      },
    });

    if (bankAccounts.length === 0) {
      return res
        .status(404)
        .send({ error: `No bank account found, userId: ${userId}` });
    }

    res.json(bankAccounts);
  }

  async deposit(req: Request, res: Response) {
    const { bankAccountId, amount } = req.body;

    try {
      if (amount <= 0) {
        throw new Error("amount is invalid");
      }

      const result = await prisma.$transaction(async (tx) => {
        const bankAccount = await tx.bankAccount.update({
          where: { id: Number(bankAccountId) },
          data: { balance: { increment: amount } },
        });

        await tx.transaction.create({
          data: {
            type: "DEPOSIT",
            amount: amount,
            bankAccount: { connect: { id: bankAccount.id } },
          },
        });

        return bankAccount;
      });
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ error: `Deposit failed, ${error.message}` });
    }
  }

  async withdraw(req: Request, res: Response) {
    const { bankAccountId, amount } = req.body;

    try {
      if (amount <= 0) {
        throw new Error("amount is invalid");
      }

      const bankAccount = await prisma.bankAccount.findUnique({
        where: { id: Number(bankAccountId) },
      });

      if (bankAccount && bankAccount.balance < amount) {
        throw new Error("bank account does not have enough balance");
      }

      const result = await prisma.$transaction(async (tx) => {
        const updatedBankAccount = await prisma.bankAccount.update({
          where: { id: Number(bankAccountId) },
          data: { balance: { decrement: amount } },
        });

        await tx.transaction.create({
          data: {
            type: "WITHDRAW",
            amount: amount,
            bankAccount: { connect: { id: updatedBankAccount.id } },
          },
        });

        return updatedBankAccount;
      });

      res.json(result);
    } catch (error: any) {
      res.status(400).json({ error: `Withdraw failed, ${error.message}` });
    }
  }

  async transfer(req: Request, res: Response) {
    const { fromAccountId, toAccountId, amount } = req.body;

    try {
      if (amount <= 0) {
        throw new Error("amount is invalid");
      }

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

        await tx.transaction.create({
          data: {
            type: "TRANSFER_OUT",
            amount: amount,
            bankAccount: { connect: { id: fromBankAccount.id } },
          },
        });

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

        await tx.transaction.create({
          data: {
            type: "TRANSFER_IN",
            amount: amount,
            bankAccount: { connect: { id: toBankAccount.id } },
          },
        });

        return { from: fromBankAccount, to: toBankAccount };
      });
      res.json(result);
    } catch (e: any) {
      res.status(400).json({ error: `Transfer failed, ${e.message}` });
    }
  }

  async transactionHistory(req: Request, res: Response) {
    const { bankAccountId } = req.params;

    const transactionHistory = await prisma.transaction.findMany({
      where: {
        bankAccountId: Number(bankAccountId),
      },
    });

    res.json(transactionHistory);
  }
}

export default BankAccountController;
