import request from "supertest";
import { app } from "@/app";
import { faker } from "@faker-js/faker";

describe("Create Check-in (E2E)", () => {
  let token: string;
  let gymId: string;

  beforeAll(async () => {
    await app.ready();
    // Create and authenticate user within beforeAll
    const email = faker.internet.email();
    const password = "ValidP@ssw0rd";
    await request(app.server).post("/users").send({
      name: faker.person.fullName(),
      email,
      password,
    });
    const authResponse = await request(app.server).post("/users/auth").send({
      email,
      password,
    });
    token = authResponse.body.accessToken; // Correct property name
  });

  afterAll(async () => {
    await app.close();
  });

  it("should be able to create a check-in", async () => {
    const gym = await request(app.server)
      .post("/gyms")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "JavaScript Gym",
        description: "Some description.",
        phone: null,
        latitude: -27.2092052,
        longitude: -49.6401091,
      });

    gymId = gym.body.id; // Store the gym ID for later use

    const response = await request(app.server)
      .post(`/gyms/${gymId}/check-ins`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        userLatitude: -27.2092052,
        userLongitude: -49.6401091,
      });

    expect(response.statusCode).toEqual(201);
  });

  it("should not be able to create two check-ins on the same day", async () => {

    // Attempt second check-in on the same day
    const response = await request(app.server)
      .post(`/gyms/${gymId}/check-ins`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        userLatitude: -27.2092052,
        userLongitude: -49.6401091,
      });

    expect(response.statusCode).toEqual(429);
    expect(response.body).toEqual(
      expect.objectContaining({
        error: "TooManyRequestsError",
        message:
          "You can only check in to one gym per day. Please try again tomorrow.",
      })
    );
  });
});
