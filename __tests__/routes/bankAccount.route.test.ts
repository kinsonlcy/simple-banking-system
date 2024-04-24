import app from "../../src/index";
import { prismaMock } from "./../../singleton";
import request from "supertest";

describe("Bank account routes", () => {
  describe("POST /bank-account/create", () => {
    test("successfully create bank account", async () => {
      const bankAccountName = "Food";
      const user = {
        id: 1,
        name: "Kinson",
        email: "me@kinsonleung.com",
      };
      const bankAccount = {
        id: 1,
        name: bankAccountName,
        balance: 0,
        owner: user,
        ownerId: user.id,
      };

      prismaMock.user.create.mockResolvedValue(user);
      prismaMock.bankAccount.create.mockResolvedValue(bankAccount);

      const res = await request(app)
        .post("/bank-account/create")
        .send({ bankAccountName, ownerEmail: user.email })
        .expect(200);

      expect(res.body).toEqual(bankAccount);
    });

    test("bank account name is empty", async () => {
      const res = await request(app)
        .post("/bank-account/create")
        .send({ ownerEmail: "me@kinsonleung.com" })
        .expect(400);

      expect(res.body).toEqual({ error: "Bank account name is empty" });
    });

    test("error occurs when creating bank account", async () => {
      prismaMock.bankAccount.create.mockRejectedValue(new Error("some error"));

      const res = await request(app)
        .post("/bank-account/create")
        .send({ bankAccountName: "Food", ownerEmail: "me@kinsonleung.com" })
        .expect(400);

      expect(res.body).toEqual({ error: "some error" });
    });
  });

  describe("GET /bank-account/:userId", () => {
    test("return all accounts for the same user", async () => {
      const user = {
        id: 1,
        name: "Kinson",
        email: "me@kinsonleung.com",
      };

      const bankAccounts = [
        {
          id: 1,
          name: "Default",
          balance: 0,
          owner: user,
          ownerId: user.id,
        },
        {
          id: 2,
          name: "Food",
          balance: 10,
          owner: user,
          ownerId: user.id,
        },
      ];

      prismaMock.user.findUnique.mockResolvedValue(user);
      prismaMock.bankAccount.findMany.mockResolvedValue(bankAccounts);

      const res = await request(app).get("/bank-account/1").expect(200);

      expect(res.body).toEqual(bankAccounts);
    });

    test("return specific account for the same user", async () => {
      const user = {
        id: 1,
        name: "Kinson",
        email: "me@kinsonleung.com",
      };

      const bankAccounts = [
        {
          id: 2,
          name: "Food",
          balance: 10,
          owner: user,
          ownerId: user.id,
        },
      ];

      prismaMock.user.findUnique.mockResolvedValue(user);
      prismaMock.bankAccount.findMany.mockResolvedValue(bankAccounts);

      const res = await request(app)
        .get("/bank-account/1")
        .query({ name: "Food" })
        .expect(200);

      expect(res.body).toEqual(bankAccounts);
    });

    test("bank account not found", async () => {
      prismaMock.bankAccount.findMany.mockResolvedValue([]);

      const res = await request(app).get("/bank-account/1").expect(404);

      expect(res.body).toEqual({ error: "No bank account found, userId: 1" });
    });
  });

  describe("POST /bank-account/deposit", () => {
    test("successfully deposit bank account", async () => {
      const amount = 20;
      const user = {
        id: 1,
        name: "Kinson",
        email: "me@kinsonleung.com",
      };
      const bankAccount = {
        id: 1,
        name: "Food",
        balance: amount,
        owner: user,
        ownerId: user.id,
      };
      const transactionHistory = {
        id: 1,
        type: "DEPOSIT",
        amount,
        createdAt: new Date(),
        bankAccount,
        bankAccountId: bankAccount.id,
      };

      prismaMock.bankAccount.update.mockResolvedValue(bankAccount);
      prismaMock.transaction.create.mockResolvedValue(transactionHistory);

      prismaMock.$transaction.mockImplementation((callback) =>
        callback(prismaMock)
      );

      const res = await request(app)
        .post("/bank-account/deposit")
        .send({ bankAccountId: bankAccount.id, amount })
        .expect(200);

      expect(res.body).toEqual(bankAccount);
    });

    test("amount is invalid", async () => {
      const res = await request(app)
        .post("/bank-account/deposit")
        .send({ bankAccountId: 1, amount: 0 })
        .expect(400);

      expect(res.body).toEqual({ error: "Deposit failed, amount is invalid" });
    });

    test("error occurs when updating balance in bank account", async () => {
      prismaMock.$transaction.mockRejectedValue(new Error("some error"));

      const res = await request(app)
        .post("/bank-account/deposit")
        .send({ bankAccountId: 1, amount: 20 })
        .expect(400);

      expect(res.body).toEqual({ error: "Deposit failed, some error" });
    });
  });

  describe("POST /bank-account/withdraw", () => {
    test("successfully withdraw bank account", async () => {
      const amount = 20;
      const user = {
        id: 1,
        name: "Kinson",
        email: "me@kinsonleung.com",
      };
      const bankAccount = {
        id: 1,
        name: "Food",
        balance: 0,
        owner: user,
        ownerId: user.id,
      };

      const transactionHistory = {
        id: 1,
        type: "WITHDRAW",
        amount,
        createdAt: new Date(),
        bankAccount,
        bankAccountId: bankAccount.id,
      };

      prismaMock.bankAccount.findUnique.mockResolvedValue({
        ...bankAccount,
        balance: amount,
      });
      prismaMock.bankAccount.update.mockResolvedValue(bankAccount);
      prismaMock.transaction.create.mockResolvedValue(transactionHistory);

      prismaMock.$transaction.mockImplementation((callback) =>
        callback(prismaMock)
      );

      const res = await request(app)
        .post("/bank-account/withdraw")
        .send({ bankAccountId: bankAccount.id, amount })
        .expect(200);

      expect(res.body).toEqual(bankAccount);
    });

    test("amount is invalid", async () => {
      const res = await request(app)
        .post("/bank-account/withdraw")
        .send({ bankAccountId: 1, amount: 0 })
        .expect(400);

      expect(res.body).toEqual({ error: "Withdraw failed, amount is invalid" });
    });

    test("does not have enough balance", async () => {
      const user = {
        id: 1,
        name: "Kinson",
        email: "me@kinsonleung.com",
      };
      const bankAccount = {
        id: 1,
        name: "Food",
        balance: 0,
        owner: user,
        ownerId: user.id,
      };

      prismaMock.bankAccount.findUnique.mockResolvedValue(bankAccount);

      const res = await request(app)
        .post("/bank-account/withdraw")
        .send({ bankAccountId: bankAccount.id, amount: 20 })
        .expect(400);

      expect(res.body).toEqual({
        error: "Withdraw failed, bank account does not have enough balance",
      });
    });

    test("error occurs when updating balance in bank account", async () => {
      prismaMock.$transaction.mockRejectedValue(new Error("some error"));

      const res = await request(app)
        .post("/bank-account/withdraw")
        .send({ bankAccountId: 1, amount: 20 })
        .expect(400);

      expect(res.body).toEqual({ error: "Withdraw failed, some error" });
    });
  });

  describe("POST /bank-account/transfer", () => {
    test("successfully transfer balance", async () => {
      const amount = 20;
      const user = {
        id: 1,
        name: "Kinson",
        email: "me@kinsonleung.com",
      };
      const from = {
        id: 1,
        name: "Default",
        balance: 0,
        owner: user,
        ownerId: user.id,
      };
      const to = {
        id: 2,
        name: "Food",
        balance: amount,
        owner: user,
        ownerId: user.id,
      };
      const fromHistory = {
        id: 1,
        type: "TRANSFER_OUT",
        amount,
        createdAt: new Date(),
        bankAccount: from,
        bankAccountId: from.id,
      };
      const toHistory = {
        id: 2,
        type: "TRANSFER_IN",
        amount,
        createdAt: new Date(),
        bankAccount: to,
        bankAccountId: to.id,
      };

      prismaMock.bankAccount.update.mockResolvedValueOnce(from);
      prismaMock.transaction.create.mockResolvedValue(fromHistory);
      prismaMock.bankAccount.update.mockResolvedValueOnce(to);
      prismaMock.transaction.create.mockResolvedValue(toHistory);

      prismaMock.$transaction.mockImplementation((callback) =>
        callback(prismaMock)
      );

      const res = await request(app)
        .post("/bank-account/transfer")
        .send({ fromAccountId: from.id, toAccountId: to.id, amount })
        .expect(200);

      expect(res.body).toEqual({ from, to });
    });

    test("amount is invalid", async () => {
      const res = await request(app)
        .post("/bank-account/transfer")
        .send({ fromAccountId: 1, toAccountId: 2, amount: 0 })
        .expect(400);

      expect(res.body).toEqual({ error: "Transfer failed, amount is invalid" });
    });

    test("does not have enough balance", async () => {
      const user = {
        id: 1,
        name: "Kinson",
        email: "me@kinsonleung.com",
      };
      const bankAccount = {
        id: 1,
        name: "Default",
        balance: -20,
        owner: user,
        ownerId: user.id,
      };

      prismaMock.bankAccount.update.mockResolvedValue(bankAccount);
      prismaMock.$transaction.mockImplementation((callback) =>
        callback(prismaMock)
      );

      const res = await request(app)
        .post("/bank-account/transfer")
        .send({ fromAccountId: 1, toAccountId: 2, amount: 20 })
        .expect(400);

      expect(res.body).toEqual({
        error: "Transfer failed, bank account id: 1 does not have enough fund",
      });
    });

    test("error occurs when updating balance in bank account", async () => {
      prismaMock.$transaction.mockRejectedValue(new Error("some error"));

      const res = await request(app)
        .post("/bank-account/transfer")
        .send({ fromAccountId: 1, toAccountId: 2, amount: 20 })
        .expect(400);

      expect(res.body).toEqual({ error: "Transfer failed, some error" });
    });
  });

  describe("GET /bank-account/transactions/:bankAccountId", () => {
    test("return bank account transaction history", async () => {
      const user = {
        id: 1,
        name: "Kinson",
        email: "me@kinsonleung.com",
      };

      const bankAccount = {
        id: 1,
        name: "Default",
        balance: 20,
        owner: user,
        ownerId: user.id,
      };

      const transactionHistory = [
        {
          id: 1,
          type: "TRANSFER_OUT",
          amount: 20,
          createdAt: new Date(),
          bankAccount: bankAccount,
          bankAccountId: bankAccount.id,
        },
        {
          id: 2,
          type: "TRANSFER_IN",
          amount: 50,
          createdAt: new Date(),
          bankAccount: bankAccount,
          bankAccountId: bankAccount.id,
        },
      ];

      prismaMock.transaction.findMany.mockResolvedValue(transactionHistory);

      const res = await request(app)
        .get("/bank-account/transactions/1")
        .expect(200);

      expect(res.body).toEqual(
        transactionHistory.map((history) => {
          return { ...history, createdAt: history.createdAt.toISOString() };
        })
      );
    });

    test("history not found", async () => {
      prismaMock.transaction.findMany.mockResolvedValue([]);

      const res = await request(app)
        .get("/bank-account/transactions/1")
        .expect(200);

      expect(res.body).toEqual([]);
    });
  });
});
