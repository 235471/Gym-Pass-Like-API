import { UserProfileDTO } from "@/application/dtos/user-dto";
import { User } from "@prisma/client";

export class UserPresenter {
  static profileToHTTP(user: User): UserProfileDTO {
    // Exclude passwordHash
    return {
      id: user.id,
      name: user.name,
      email: user.email,
    };
  }
}
