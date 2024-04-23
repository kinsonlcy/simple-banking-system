import app from "../../src/index";
import { prismaMock } from "./../../singleton";
import request from "supertest";

describe("User routes", () => {
  describe("POST /user/create", () => {
    test("successfully create user", async () => {
      const user = {
        id: 1,
        name: "Kinson",
        email: "me@kinsonleung.com",
      };

      prismaMock.user.create.mockResolvedValue(user);

      const res = await request(app)
        .post("/user/create")
        .send({ name: "Kinson", email: "me@kinsonleung.com" })
        .expect(200);

      expect(res.body).toEqual({
        email: "me@kinsonleung.com",
        id: 1,
        name: "Kinson",
      });
    });

    test("create user error", async () => {
      prismaMock.user.create.mockRejectedValue(new Error("duplicated record"));

      const res = await request(app)
        .post("/user/create")
        .send({ name: "Kinson", email: "me@kinsonleung.com" })
        .expect(400);

      expect(res.body).toEqual({ error: "duplicated record" });
    });
  });

  describe("POST /user/:userId", () => {
    test("return correct user", async () => {
      const user = {
        id: 1,
        name: "Kinson",
        email: "me@kinsonleung.com",
      };

      prismaMock.user.findUnique.mockResolvedValue(user);

      const res = await request(app).get("/user/1").expect(200);

      expect(res.body).toEqual({
        email: "me@kinsonleung.com",
        id: 1,
        name: "Kinson",
      });
    });

    test("user not found", async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      const res = await request(app).get("/user/1").expect(404);

      expect(res.body).toEqual({ error: "User not found, user_id: 1" });
    });
  });
});
