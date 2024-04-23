import app from "../../src/index";
import request from "supertest";

describe("Health check endpoint", () => {
  test("/GET health", async () => {
    const res = await request(app).get("/health");
    expect(res.body).toEqual("I'm healthy!");
  });
});
