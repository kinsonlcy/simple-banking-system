import Route from "./route";
import UserController from "../controllers/UserController";

class UserRoute extends Route {
  private userController = new UserController();

  constructor() {
    super();
    this.setRoutes();
  }

  protected setRoutes() {
    this.router.post("/user/create", this.userController.create);
    this.router.get("/user/:userId", this.userController.find);
  }
}

export default UserRoute;
