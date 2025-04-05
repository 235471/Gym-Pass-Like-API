# API SOLID: A Showcase of Clean Architecture and Best Practices

This project is a backend API, inspired by the GymPass application model, designed to demonstrate the application of SOLID principles, Clean Architecture, Domain-Driven Design (DDD), and various software engineering best practices. It serves as a practical example of building scalable, maintainable, and testable Node.js applications using TypeScript.

## Key Features (Functional Requirements)

*   User registration and authentication.
*   User profile retrieval (logged-in user).
*   Retrieval of user check-in count and history.
*   Ability to search for nearby gyms (within a 10km radius).
*   Ability to search for gyms by name.
*   Functionality for users to check into a gym.
*   Validation of user check-ins.
*   Gym registration (potentially restricted to administrators).

## Core Architectural Principles

This project is built upon a foundation of established architectural principles to ensure robustness and flexibility:

*   **SOLID**: The five principles (Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, Dependency Inversion) guide the design of classes and modules, promoting maintainability and reducing coupling.
*   **Clean Architecture**: The codebase is structured into distinct layers (Domain, Application, Infrastructure) with a strict dependency rule (dependencies flow inwards), isolating the core business logic from external concerns.
*   **Domain-Driven Design (DDD)**: Concepts like focusing on the core domain (Users, Gyms, Check-ins) and using repository interfaces help model the business logic effectively.

## Detailed Architecture Breakdown

The application follows a layered architecture:

1.  **Domain Layer (`src/domains`)**:
    *   The heart of the application, containing core business logic and entity definitions (implicit through repository interactions).
    *   Defines repository interfaces (`IUserRepository`, `IGymRepository`, `ICheckInRepository`) using the Dependency Inversion Principle.
    *   Completely independent of frameworks and infrastructure details.

2.  **Application Layer (`src/application`)**:
    *   Orchestrates use cases (e.g., `RegisterUserUseCase`, `FetchNearbyGymsUseCase`).
    *   Contains Data Transfer Objects (DTOs) and validation schemas (using Zod) for data contracts.
    *   Depends on Domain layer abstractions (interfaces).

3.  **Infrastructure Layer (`src/infrastructure`)**:
    *   Handles all external concerns and technical details.
    *   Provides concrete implementations for repositories (e.g., `PrismaUsersRepository`).
    *   Manages HTTP requests/responses via Controllers and Routes (using Fastify).
    *   Configures database connections (Prisma).
    *   Implements Dependency Injection setup (using TSyringe).
    *   Contains Factories for object creation.

4.  **Shared Layer (`src/shared`)**:
    *   Holds reusable components across layers, such as custom error classes, utility functions (like the `Either` type for functional error handling), data presenters, and test helpers.

**Dependency Flow:** `Infrastructure` -> `Application` -> `Domain`

## Design Patterns Implemented

Several design patterns are employed to solve common problems and enhance the design:

1.  **Repository Pattern**: Abstracts data persistence logic behind interfaces, decoupling the application from specific database technologies.
2.  **Dependency Injection (DI)**: Utilizes TSyringe to manage dependencies, promoting loose coupling and high testability. Dependencies are defined via interfaces and injected into constructors.
3.  **Factory Pattern**: Used both for creating complex objects (like controllers with their dependencies injected) and for generating test data (e.g., using Faker).
4.  **Use Case Pattern (Application Services)**: Encapsulates specific pieces of business logic into dedicated classes within the Application layer.
5.  **Either Pattern**: For functional error handling, clearly distinguishing between successful results (`Right`) and errors (`Left`), making error management explicit and predictable.
6.  **In-Memory Repository**: Specific implementations of repository interfaces used for fast and isolated unit/integration testing without needing a real database.
7.  **Mapper Pattern**: Implicitly used for converting data between layers or formats (e.g., Prisma models to DTOs).
8.  **Presenter Pattern**: Formats data specifically for the presentation layer (e.g., API responses).

## Testing Strategy

Testing is a crucial part of this project, ensuring both individual components and overall application flows work correctly:

*   **Unit Tests**: Focused on testing individual use cases, domain logic, and utility functions in isolation. Vitest is used as the testing framework.
*   **In-Memory Repositories**: These test doubles replace actual database interactions during unit tests, ensuring speed and isolation. They implement the same interfaces as the production repositories (`IUserRepository`, etc.).
*   **End-to-End (E2E) Tests**:
    *   Validate complete application flows, simulating real user interactions from HTTP request to database persistence and back.
    *   Utilize `supertest` to make HTTP requests against the running Fastify application instance (`app.server`).
    *   Run against a dedicated test database (managed via `prismaTestClient` and environment variables configured in `vitest.config.e2e.ts`'s setup file - `src/shared/test/setup-e2e.ts`), ensuring isolation from development/production data.
    *   Employ setup and teardown hooks (`beforeAll`, `afterAll`, `afterEach`) within Vitest to manage the application lifecycle and database state (e.g., cleaning up data between tests).
    *   Helper utilities (like `src/shared/utils/test-auth.ts::createAndAuthenticateE2EUser`) are used to streamline common E2E setup tasks, such as user creation and authentication, reducing boilerplate code in test files.
    *   E2E test configuration is managed separately in `vitest.config.e2e.ts`.

## API Endpoints Overview

The API exposes the following main endpoints, grouped by resource:

**Users (`/users`)**
*   `POST /`: Register a new user.
*   `POST /auth`: Authenticate a user. Returns JWT access token in the body and sets refresh token in an HTTP-only cookie.
*   `POST /refresh`: Obtain a new access token using the refresh token cookie (implements token rotation). Returns new access token in body and sets new refresh token cookie.
*   `POST /logout` (Authenticated): Invalidate the user's session by deleting their refresh tokens from DB and clearing the refresh token cookie.
*   `GET /me` (Authenticated): Get the profile of the currently logged-in user.

**Gyms (`/gyms`)**
*   `POST /` (Authenticated): Register a new gym (potentially admin-only).
*   `GET /search` (Authenticated): Search for gyms by name (paginated).
*   `GET /nearby` (Authenticated): Fetch gyms within a 10km radius based on user coordinates (paginated).
*   `POST /{gymId}/check-ins` (Authenticated): Create a check-in for the specified gym.

**Check-ins (`/check-ins`)**
*   `GET /history` (Authenticated): Fetch the logged-in user's check-in history (paginated).
*   `GET /metrics` (Authenticated): Get the total check-in count for the logged-in user.
*   `PATCH /{checkInId}/validate` (Authenticated): Validate a specific check-in (potentially admin-only).

## API Documentation (Swagger)

Interactive API documentation is available via Swagger UI at the `/docs` endpoint when the application is running. This allows developers to explore endpoints, view schemas, and test requests directly in the browser.

## Security Measures

Security is addressed through multiple mechanisms:

*   **Authentication with JWT (RS256)**:
    *   Uses JSON Web Tokens signed with the asymmetric RS256 algorithm.
    *   **Asymmetric Signing**: Employs a public/private key pair. The private key (kept secure on the server) signs the token, while the public key can be distributed to verify the token's authenticity without exposing the signing key. This is more secure than symmetric algorithms (like HS256) for many scenarios.
    *   JWTs identify authenticated users for subsequent requests (typically short-lived, e.g., 7 days).
*   **Refresh Token Strategy (using HTTP-only Cookies)**:
    *   Upon successful authentication (`POST /users/auth`), a short-lived JWT **access token** (e.g., 7 days) is returned in the response body, and a long-lived **refresh token** (e.g., 30 days) is set as an `HttpOnly`, `Secure` (in production), `Path=/`, `SameSite=Strict` cookie. Storing the refresh token in an HTTP-only cookie prevents it from being accessed by client-side JavaScript, mitigating XSS attacks.
    *   Refresh tokens are also stored securely in the database, associated with the user.
    *   When an access token expires, the client sends a request to the `POST /users/refresh` endpoint. The browser automatically includes the refresh token cookie.
    *   **Token Rotation**: The `/refresh` endpoint validates the cookie token against the database. If valid, it implements refresh token rotation: the used token is invalidated (deleted from DB), and a *new* refresh token is set as an HTTP-only cookie, while a new access token is returned in the response body. This enhances security by limiting the lifespan of each refresh token.
    *   **Logout**: The `POST /users/logout` endpoint invalidates the user's session by deleting all associated refresh tokens from the database and clearing the refresh token cookie on the client.
*   **Password Hashing**: User passwords are securely hashed using `bcrypt` before being stored. Plain text passwords are never stored.
*   **Input Validation**: All incoming data (request bodies, query parameters) is rigorously validated using Zod schemas to prevent invalid or malicious data from entering the system.

## Error Handling

*   The application utilizes a functional approach to error handling via the **Either Pattern** (`Left` for errors, `Right` for success).
*   Custom error classes are defined in `src/shared/errors` for specific failure scenarios (e.g., `ResourceNotFoundError`, `InvalidCredentialsError`).
*   A global error handler middleware likely exists to catch unhandled exceptions and format error responses consistently.

## Dependency Injection with TSyringe

*   **TSyringe** is the chosen library for managing Dependency Injection (DI), promoting loose coupling and enhancing testability.
*   **Configuration (`src/infrastructure/container/container.ts`)**:
    *   This central file registers all application dependencies with the TSyringe container.
    *   Concrete implementations (e.g., `PrismaUserRepository`) are registered as singletons against their corresponding interfaces (e.g., `IUserRepository`) using string tokens.
    *   Use Cases and Controllers are typically registered using their class names (`RegisterUserUseCase.name`).
    *   Core services like the `PrismaClient` instance are also registered, making them injectable into other classes (like repositories).
*   **Usage**:
    *   Classes needing dependencies are typically decorated with `@injectable()`.
    *   Dependencies are declared in constructors using the `@inject("TokenName")` or `@inject(ClassName.name)` decorator, specifying the token or class name registered in the container.
*   **Factories (`src/infrastructure/factories/`)**:
    *   Simple functions (like `makeUserController`) act as factories. Their primary role is to resolve specific instances (usually controllers or use cases) directly from the configured TSyringe container (`container.resolve(ControllerName)`).
    *   These factories abstract the container interaction, making it cleaner to instantiate objects, especially within route definitions.
*   **Benefits**: This setup significantly improves testability, as dependencies can be easily mocked or replaced during tests by registering alternative implementations in the container. It also centralizes object creation logic.

## Business Rules (Examples)

*   Users cannot register with duplicate emails.
*   Users cannot perform more than one check-in per day.
*   Check-ins are only allowed if the user is within 100 meters of the gym.
*   Check-ins must be validated within 20 minutes of creation.
*   (Potential) Check-in validation and gym registration might be restricted to administrators.

## Non-Functional Requirements

*   User passwords must be encrypted.
*   Application data must be persisted in a PostgreSQL database.
*   API responses returning lists must be paginated (e.g., 20 items per page).
*   User identification relies on JWT signed with RS256.

## Technologies Used

*   **Language**: TypeScript
*   **Runtime**: Node.js
*   **Web Framework**: Fastify
*   **ORM**: Prisma
*   **Database**: PostgreSQL
*   **Testing**: Vitest
*   **Dependency Injection**: TSyringe
*   **Validation**: Zod
*   **Linting/Formatting**: ESLint, Prettier
*   **Build Tool**: esbuild / tsup / Vite
*   **Containerization**: Docker

## Benefits of this Approach

*   **Maintainability**: Clear separation of concerns and adherence to SOLID makes the code easier to understand, modify, and debug.
*   **Testability**: DI and the use of interfaces/repositories allow for comprehensive unit and integration testing.
*   **Scalability**: The modular design allows features to be added or changed with minimal impact on other parts of the system.
*   **Robustness**: Explicit error handling and strong typing contribute to a more reliable application.
*   **Flexibility**: Low coupling means components (like the database or web framework) can be swapped out more easily if needed.

This project demonstrates a commitment to writing high-quality, professional backend code using modern best practices.
