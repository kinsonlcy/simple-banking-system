import BankAccountController from "../controllers/BankAccountController";
import Route from "./route";

class BankAccountRoute extends Route {
  private bankAccountController = new BankAccountController();

  constructor() {
    super();
    this.setRoutes();
  }

  protected setRoutes() {
    this.router.post("/bank-account/create", this.bankAccountController.create);
    this.router.get(
      "/bank-account/:userId",
      this.bankAccountController.findByUserId
    );
    this.router.post(
      "/bank-account/deposit",
      this.bankAccountController.deposit
    );
    this.router.post(
      "/bank-account/withdraw",
      this.bankAccountController.withdraw
    );
    this.router.post(
      "/bank-account/transfer",
      this.bankAccountController.transfer
    );
    this.router.get(
      "/bank-account/transactions/:bankAccountId",
      this.bankAccountController.transactionHistory
    );
  }
}

export default BankAccountRoute;
