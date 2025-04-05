import { FastifyInstance } from "fastify";
import request from "supertest";
import { faker } from "@faker-js/faker";
import { prismaTestClient } from "@/shared/test/setup-e2e";
import { hashSync } from "bcryptjs";

/**
 * Utility to create and authenticate a user in E2E tests.
 * Returns the access token and user ID. Refresh token is set in cookie.
 *
 * @param app Fastify instance
 * @returns An object containing the access token and user ID
 */
export async function createAndAuthenticateE2EUser(
  app: FastifyInstance, isAdmin = false
): Promise<{ accessToken: string; userId: string }> {
  // Return only accessToken and userId
  const name = faker.person.fullName();
  const email = faker.internet.email();
  const passwordHash = hashSync("ValidP@ssw0rd", 6);

  // Register the user via HTTP request
  await prismaTestClient.user.create({
    data: { name, email, passwordHash, role: isAdmin ? "ADMIN" : "USER" },
  });

  // Authenticate the user
  const authResponse = await request(app.server).post("/users/auth").send({
    email,
    password: "ValidP@ssw0rd",
  });

  // Extract only access token from the response body
  const { accessToken } = authResponse.body;
  // Refresh token is now in the Set-Cookie header, not returned here

  // Obtain the registered user ID
  const user = await prismaTestClient.user.findUniqueOrThrow({
    where: { email },
  });

  // Return only access token and user ID
  return { accessToken, userId: user.id };
}
