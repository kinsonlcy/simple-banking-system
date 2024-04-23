import app from "../src/index";
import request from "supertest";

describe("Test index.ts", () => {
  test("Catch-all route", async () => {
    const res = await request(app).get("/");
    expect(res.body).toEqual("Hello world!");
  });
});
