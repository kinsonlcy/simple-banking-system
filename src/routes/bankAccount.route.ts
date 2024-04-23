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
      "/bank-account/:user_id",
      this.bankAccountController.findByUserId
    );
  }
}

export default BankAccountRoute;
