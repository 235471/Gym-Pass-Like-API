import { UserDTO } from '@/application/users/dtos/user-dto'

export class UserPresenter {
  static toHTTP(user: UserDTO) {
    return {
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    }
  }
}
