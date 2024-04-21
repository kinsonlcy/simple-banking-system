import HealthController from "../controllers/HealthController";
import Route from "./route";

class HealthRoute extends Route {
  private healthController = new HealthController();

  constructor() {
    super();
    this.setRoutes();
  }

  protected setRoutes() {
    this.router.get("/health", this.healthController.healthCheck);
  }
}

export default HealthRoute;
