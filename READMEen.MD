# API SOLID Project - English README

This document provides an overview of the project structure, architecture, design principles, and technologies used in the API SOLID application. This API appears to be designed for a system similar to GymPass, managing users, gyms, and check-ins.

## Project Structure

The project follows a layered architecture to promote separation of concerns, maintainability, and testability. The main source code resides within the `src/` directory, organized as follows:

```
src/
├── application/  # Application layer: Use cases, DTOs, validation schemas
├── domains/      # Domain layer: Core business entities and repository interfaces
├── infrastructure/ # Infrastructure layer: External concerns (DB, HTTP, DI, etc.)
├── shared/       # Shared utilities, errors, presenters, test helpers
├── types/        # TypeScript type definitions (e.g., for external libraries)
├── app.ts        # Fastify application setup and route registration
└── server.ts     # Server initialization and startup
```

-   **`prisma/`**: Contains the Prisma schema definition (`schema.prisma`) and database migrations.
-   **Root Directory**: Contains configuration files (`package.json`, `tsconfig.json`, `.eslintrc.json`, `vite.config.ts`, `docker-compose.yml`, etc.) and the main README file.

## Architecture & Design

The application employs a layered architecture, clearly separating different aspects of the system:

1.  **Domain Layer (`src/domains`)**:
    *   Contains the core business logic, entities (implicit, defined by repository interactions), and rules.
    *   Defines interfaces for repositories (`IUserRepository`, `IGymRepository`, `ICheckInRepository`), abstracting data persistence details.
    *   This layer is independent of any specific framework or infrastructure detail.

2.  **Application Layer (`src/application`)**:
    *   Orchestrates the application's use cases (e.g., `register-user`, `create-gym`, `check-in`).
    *   Contains Data Transfer Objects (DTOs) for data exchange between layers and validation schemas (`zod` likely used here).
    *   Depends on the Domain layer (uses repository interfaces) but not directly on the Infrastructure layer.
    *   Handles application-specific logic and coordinates domain entities.

3.  **Infrastructure Layer (`src/infrastructure`)**:
    *   Implements the details needed to run the application.
    *   Contains concrete implementations of repository interfaces (e.g., `prisma-users-repository.ts` using Prisma).
    *   Handles HTTP requests and responses using controllers (`src/infrastructure/http/.../controllers`) and routes (`src/infrastructure/http/.../routes`), likely with the Fastify framework.
    *   Sets up the database connection (`prisma.ts`).
    *   Manages Dependency Injection (`container.ts`), likely using a library like `tsyringe` or similar, to wire dependencies together.
    *   Includes factories (`src/infrastructure/factories`) to simplify the creation of complex objects (like controllers with their dependencies).
    *   Configures external tools like Swagger (`swagger.ts`).

4.  **Shared Layer (`src/shared`)**:
    *   Contains code reusable across different layers.
    *   Includes custom error classes (`src/shared/errors`), error handling middleware (`error-handler.ts`), utility functions (`src/shared/utils`), data presenters (`src/shared/presenters`), and testing utilities (`src/shared/test`).

**Dependency Flow:** Dependencies flow inwards: Infrastructure -> Application -> Domain. This ensures the core domain logic remains isolated from infrastructure changes.

## SOLID Principles & Clean Code

The project structure and patterns suggest adherence to SOLID principles and Clean Code practices:

*   **Single Responsibility Principle (SRP)**: Classes and modules have focused responsibilities (e.g., use cases handle specific tasks, repositories handle data access, controllers handle HTTP interactions).
*   **Open/Closed Principle (OCP)**: The use of repository interfaces and dependency injection allows extending functionality (e.g., adding a different database implementation) without modifying existing use cases.
*   **Liskov Substitution Principle (LSP)**: The presence of in-memory repository implementations (`in-memory-*.ts`) alongside Prisma implementations suggests they conform to the same interfaces, allowing them to be substituted (useful for testing).
*   **Interface Segregation Principle (ISP)**: Repository interfaces are specific to their respective domains (User, Gym, CheckIn), preventing clients from depending on methods they don't use.
*   **Dependency Inversion Principle (DIP)**: High-level modules (Application layer) depend on abstractions (Domain layer interfaces), not on low-level implementations (Infrastructure layer). Dependency Injection is used to manage these dependencies.

**Clean Code Practices:**
*   **Clear Naming Conventions**: Consistent and descriptive names for files, folders, classes, and functions.
*   **Modularity**: Code is organized into distinct layers and modules.
*   **Testing**: Presence of `.spec.ts` and `.e2e-spec.ts` files indicates a focus on unit and end-to-end testing (using Vitest).
*   **Type Safety**: Use of TypeScript enhances code reliability and maintainability.
*   **DTOs**: Used for clear data contracts between layers.
*   **Explicit Error Handling**: Dedicated error classes and handling mechanisms.
*   **Dependency Injection**: Promotes loose coupling and testability.

## Technologies Used

*   **Language**: TypeScript
*   **Runtime**: Node.js
*   **Web Framework**: Fastify (inferred from `fastify-jwt.d.ts`, `app.ts` structure)
*   **ORM**: Prisma
*   **Testing**: Vitest
*   **Linting/Formatting**: ESLint, Prettier (likely, based on standard configurations)
*   **Build Tool**: esbuild / tsup / Vite (inferred from config files)
*   **Containerization**: Docker
*   **Dependency Injection**: tsyringe or similar (inferred from `container.ts` and factories)
*   **Validation**: Zod (inferred from schema files)

This README provides a high-level overview based on the project's structure and common practices. Further details can be found by examining the code within each layer.
