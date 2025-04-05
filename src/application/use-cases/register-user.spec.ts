import { InMemoryUsersRepository } from "../../domains/users/repository/in-memory/in-memory-user-repository";
import { RegisterUserUseCase } from "./register-user";
import { compare } from "bcryptjs";
import { makeUser } from "@/shared/test/factories/make-user";
import { ValidationErrors } from "@/shared/errors/validation-errors"; // Added import

describe("Register Use Case test suite", () => {
  let inMemoryUsersRepository: InMemoryUsersRepository;
  let sut: RegisterUserUseCase;

  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    sut = new RegisterUserUseCase(inMemoryUsersRepository);
  });

  it("should be able to register an user", async () => {
    // Act - Execute use case
    const registerData = makeUser();

    const result = await sut.execute(registerData);

    // Assert - Verificar o resultado
    expect(result.isRight()).toBeTruthy();

    if (result.isRight()) {
      const userData = result.value;
      expect(userData.id).toBeDefined();
      expect(userData.email).toBe(registerData.email);
      expect(userData.name).toBe(registerData.name);
      expect(userData.password).toEqual(expect.any(String));
    }
  });

  it("should be able to hash password when registering a user", async () => {
    // Act - Execute use case
    const registerData = makeUser();

    const result = await sut.execute(registerData);

    // Assert - Verificar o resultado
    expect(result.isRight()).toBeTruthy();

    if (result.isRight()) {
      const userData = result.value;
      // Check for hashed password
      expect(userData.password).toBeDefined();
      expect(userData.password).not.toBe(registerData.password);
      expect(userData.password).toMatch(/^\$2[ab]\$\d+\$/);

      const isProperlyHashed = await compare(
        registerData.password,
        userData.password
      );

      expect(isProperlyHashed).toBeTruthy();
    }
  });

  it("should not be possible to register with a previsouly registered email", async () => {
    let result;
    const specificEmail = "test.duplicate@example.com";
    const registerData = makeUser({ email: specificEmail });

    // Act - Execute use case (primeira tentativa com email específico)
    result = await sut.execute(registerData);

    // Assert - Verificar o resultado da primeira tentativa
    expect(result.isRight()).toBeTruthy();

    // Segunda tentativa com o mesmo email
    result = await sut.execute({
      name: "Other User",
      email: specificEmail,
      password: "anotherPassword123!",
    });

    expect(result.isLeft()).toBeTruthy();

    if (result.isLeft()) {
      const error = result.value;
      expect(error.message).toBe(`Email '${specificEmail}' is already in use`);
      expect(error.name).toBe("ConflictError");
    }
  });

  it("should return an error if name is empty", async () => {
    const registerData = makeUser({ name: "" });
    const result = await sut.execute(registerData);

    expect(result.isLeft()).toBeTruthy();
    if (result.isLeft()) {
      const error = result.value as ValidationErrors;
      expect(error).toBeInstanceOf(ValidationErrors);
      expect(error.errors).toHaveLength(1);
      expect(error.errors[0].message).toBe("Name is required.");
    }
  });

  it("should return an error if email format is invalid", async () => {
    const registerData = makeUser({ email: "invalid-email-format" });
    const result = await sut.execute(registerData);

    expect(result.isLeft()).toBeTruthy();
    if (result.isLeft()) {
      const error = result.value as ValidationErrors;
      expect(error).toBeInstanceOf(ValidationErrors);
      expect(error.errors).toHaveLength(1);
      expect(error.errors[0].message).toBe("Invalid email format");
    }
  });

  it("should return an error if password is too short", async () => {
    const registerData = makeUser({ password: "aB1!" });
    const result = await sut.execute(registerData);

    expect(result.isLeft()).toBeTruthy();
    if (result.isLeft()) {
      const error = result.value as ValidationErrors;
      expect(error).toBeInstanceOf(ValidationErrors);
      expect(error.errors).toHaveLength(1);
      expect(error.errors[0].message).toBe(
        "Password must be at least 6 characters long."
      );
    }
  });

  it("should return an error if password lacks an uppercase letter", async () => {
    const registerData = makeUser({ password: "password1!" });
    const result = await sut.execute(registerData);

    expect(result.isLeft()).toBeTruthy();
    if (result.isLeft()) {
      const error = result.value as ValidationErrors;
      expect(error).toBeInstanceOf(ValidationErrors);
      expect(error.errors).toHaveLength(1);
      expect(error.errors[0].message).toContain(
        "Password must contain at least one uppercase letter"
      );
    }
  });

  it("should return an error if password lacks a number", async () => {
    const registerData = makeUser({ password: "Password!" });
    const result = await sut.execute(registerData);

    expect(result.isLeft()).toBeTruthy();
    if (result.isLeft()) {
      const error = result.value as ValidationErrors;
      expect(error).toBeInstanceOf(ValidationErrors);
      expect(error.errors).toHaveLength(1);
      expect(error.errors[0].message).toContain(
        "Password must contain at least one number"
      );
    }
  });

  it("should return an error if password lacks a special character", async () => {
    const registerData = makeUser({ password: "Password123" });
    const result = await sut.execute(registerData);

    expect(result.isLeft()).toBeTruthy();
    if (result.isLeft()) {
      const error = result.value as ValidationErrors;
      expect(error).toBeInstanceOf(ValidationErrors);
      expect(error.errors).toHaveLength(1);
      expect(error.errors[0].message).toContain(
        "Password must contain at least one special character"
      );
    }
  });

  it("should trim whitespace from name before saving", async () => {
    const registerData = makeUser({ name: "  John Doe  " });
    const result = await sut.execute(registerData);

    expect(result.isRight()).toBeTruthy();
    if (result.isRight()) {
      expect(result.value.name).toBe("John Doe");
    }
  });

  it("should trim whitespace from email before saving", async () => {
    const registerData = makeUser({ email: "  test@example.com  " });
    const result = await sut.execute(registerData);

    expect(result.isRight()).toBeTruthy();
    if (result.isRight()) {
      expect(result.value.email).toBe("test@example.com");
    }
  });

  it("should return an error if name contains only whitespace", async () => {
    const registerData = makeUser({ name: "   " });
    const result = await sut.execute(registerData);

    expect(result.isLeft()).toBeTruthy();
    if (result.isLeft()) {
      const error = result.value as ValidationErrors;
      expect(error).toBeInstanceOf(ValidationErrors);
      expect(error.errors).toHaveLength(1);
      // After trimming, the name becomes empty
      expect(error.errors[0].message).toBe("Name is required.");
    }
  });

  it("should return an error if email contains only whitespace", async () => {
    const registerData = makeUser({ email: "   " });
    const result = await sut.execute(registerData);

    expect(result.isLeft()).toBeTruthy();
    if (result.isLeft()) {
      const error = result.value as ValidationErrors;
      expect(error).toBeInstanceOf(ValidationErrors);
      expect(error.errors).toHaveLength(1);
      // After trimming, the email becomes empty, failing email validation
      expect(error.errors[0].message).toBe("Invalid email format");
    }
  });
});
