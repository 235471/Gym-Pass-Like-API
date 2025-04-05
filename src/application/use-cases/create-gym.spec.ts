import { CreateGymUseCase } from "./create-gym";
import { InMemoryGymRepository } from "@/domains/gyms/repository/in-memory/in-memory-gym-repository";
import { Decimal } from "@prisma/client/runtime/library";
import { MakeGym } from "@/shared/test/factories/make-gym";
import { ValidationErrors } from "@/shared/errors/validation-errors";
import { RegisterGymDTO } from "../dtos/gym-dto";

let sut: CreateGymUseCase;
let inMemoryGymRepository: InMemoryGymRepository;

describe("Create Gym Use Case", () => {
  beforeEach(() => {
    inMemoryGymRepository = new InMemoryGymRepository();
    sut = new CreateGymUseCase(inMemoryGymRepository);
  });

  afterEach(() => {
    inMemoryGymRepository.items = [];
  });

  it("should create a gym successfully", async () => {
    const gymData = MakeGym();

    const createGym: RegisterGymDTO = {
      ...gymData,
      latitude: Number(gymData.latitude),
      longitude: Number(gymData.longitude),
    };

    const result = await sut.execute(createGym);

    expect(result.isRight()).toBeTruthy();
    if (result.isRight()) {
      expect(result.value).toHaveProperty("id");
      expect(result.value.title).toBe(gymData.title);
    }
  });

  it("should return an error if validation fails", async () => {
    const gymData = MakeGym({ title: "" });

    const createGym: RegisterGymDTO = {
      ...gymData,
      latitude: Number(gymData.latitude),
      longitude: Number(gymData.longitude),
    };

    const result = await sut.execute(createGym);

    expect(result.isLeft()).toBeTruthy();
    if (result.isLeft()) {
      const error = result.value as ValidationErrors;
      expect(error).toBeInstanceOf(ValidationErrors);
      expect(error.errors).toHaveLength(1);
      expect(error.errors[0]).toHaveProperty("message");
      expect(error.errors[0].message).toBe("Title is required.");
    }
  });

  it("should create a gym successfully with null description", async () => {
    const gymData = MakeGym();

    const createGym: RegisterGymDTO = {
      title: gymData.title,
      description: null,
      phone: gymData.phone,
      latitude: Number(gymData.latitude),
      longitude: Number(gymData.longitude),
    };

    const result = await sut.execute(createGym);

    expect(result.isRight()).toBeTruthy();
    if (result.isRight()) {
      expect(result.value).toHaveProperty("id");
      expect(result.value.title).toBe(gymData.title);
      expect(result.value.description).toBeNull();
    }
  });

  it("should create a gym successfully with null phone", async () => {
    const gymData = MakeGym();

    const createGym: RegisterGymDTO = {
      title: gymData.title,
      description: gymData.description,
      phone: null,
      latitude: Number(gymData.latitude),
      longitude: Number(gymData.longitude),
    };

    const result = await sut.execute(createGym);

    expect(result.isRight()).toBeTruthy();
    if (result.isRight()) {
      expect(result.value).toHaveProperty("id");
      expect(result.value.title).toBe(gymData.title);
      expect(result.value.phone).toBeNull();
    }
  });

  // --- Latitude/Longitude Tests ---

  it("should return an error if latitude is invalid", async () => {
    // Use Decimal for the invalid latitude, provide valid phone
    const gymData = MakeGym({
      latitude: new Decimal("91"),
      phone: "(11) 98888-7777",
    });

    const createGym: RegisterGymDTO = {
      title: gymData.title,
      description: gymData.description,
      phone: gymData.phone,
      latitude: Number(gymData.latitude), // Invalid latitude
      longitude: Number(gymData.longitude), // Valid longitude from factory
    };

    const result = await sut.execute(createGym);

    expect(result.isLeft()).toBeTruthy();
    if (result.isLeft()) {
      const error = result.value as ValidationErrors;
      expect(error).toBeInstanceOf(ValidationErrors);
      expect(error.errors).toHaveLength(1);
      expect(error.errors[0]).toHaveProperty("message");
      expect(error.errors[0].message).toBe(
        "Latitude must be between -90 and 90."
      );
    }
  });

  it("should return an error if latitude is less than -90", async () => {
    const gymData = MakeGym({
      latitude: new Decimal("-91"),
      phone: "(11) 98888-7777",
    });

    const createGym: RegisterGymDTO = {
      title: gymData.title,
      description: gymData.description,
      phone: gymData.phone,
      latitude: Number(gymData.latitude), // Invalid latitude
      longitude: Number(gymData.longitude), // Valid longitude from factory
    };

    const result = await sut.execute(createGym);

    expect(result.isLeft()).toBeTruthy();
    if (result.isLeft()) {
      const error = result.value as ValidationErrors;
      expect(error).toBeInstanceOf(ValidationErrors);
      expect(error.errors).toHaveLength(1);
      expect(error.errors[0]).toHaveProperty("message");
      expect(error.errors[0].message).toBe(
        "Latitude must be between -90 and 90."
      );
    }
  });

  it("should return an error if longitude is invalid", async () => {
    const gymData = MakeGym({
      longitude: new Decimal("181"),
      phone: "(11) 98888-7777", // Explicitly valid phone
    });

    const createGym: RegisterGymDTO = {
      title: gymData.title,
      description: gymData.description,
      phone: gymData.phone,
      latitude: Number(gymData.latitude), // Valid latitude from factory
      longitude: Number(gymData.longitude), // Invalid longitude
    };

    const result = await sut.execute(createGym);

    expect(result.isLeft()).toBeTruthy();
    if (result.isLeft()) {
      const error = result.value as ValidationErrors;
      expect(error).toBeInstanceOf(ValidationErrors);
      expect(error.errors).toHaveLength(1);
      expect(error.errors[0]).toHaveProperty("message");
      expect(error.errors[0].message).toBe(
        "Longitude must be between -180 and 180."
      );
    }
  });

  it("should return an error if longitude is less than -180", async () => {
    const gymData = MakeGym({
      longitude: new Decimal("-181"),
      phone: "(11) 98888-7777",
    });

    const createGym: RegisterGymDTO = {
      title: gymData.title,
      description: gymData.description,
      phone: gymData.phone,
      latitude: Number(gymData.latitude), // Valid latitude from factory
      longitude: Number(gymData.longitude), // Invalid longitude
    };

    const result = await sut.execute(createGym);

    expect(result.isLeft()).toBeTruthy();
    if (result.isLeft()) {
      const error = result.value as ValidationErrors;
      expect(error).toBeInstanceOf(ValidationErrors);
      expect(error.errors).toHaveLength(1);
      expect(error.errors[0]).toHaveProperty("message");
      expect(error.errors[0].message).toBe(
        "Longitude must be between -180 and 180."
      );
    }
  });
});
