import BankAccountRoute from "./routes/bankAccount.route";
import HealthRoute from "./routes/health.route";
import Route from "./routes/route";
import UserRoute from "./routes/user.route";

export const router: Array<Route> = [
  new HealthRoute(),
  new UserRoute(),
  new BankAccountRoute(),
];
