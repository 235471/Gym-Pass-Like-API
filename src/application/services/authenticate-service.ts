import { UserProfileDTO } from '../dtos/user-dto' // Import UserProfileDTO instead of UserDTO
import { injectable } from 'tsyringe'
import jwt from 'jsonwebtoken'
import { env } from '@/env'

@injectable()
export class AuthenticateService {
  generateToken(user: UserProfileDTO): string {
    const privateKey = Buffer.from(env.JWT_PRIVATE_KEY, 'base64')

    const accessToken = jwt.sign({}, privateKey, {
      algorithm: 'RS256',
      subject: user.id,
      expiresIn: '30m',
    })

    return accessToken
  }
}
