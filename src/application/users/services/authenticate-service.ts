import { UserDTO } from '../dtos/user-dto'
import { injectable } from 'tsyringe'
import jwt from 'jsonwebtoken'
import { env } from '@/env'

@injectable()
export class AuthenticateService {
  generateToken(user: UserDTO): string {
    // Decode the Base64 private key before using it
    const privateKey = Buffer.from(env.JWT_PRIVATE_KEY, 'base64')

    // Generate JWT
    const accessToken = jwt.sign({}, privateKey, {
      algorithm: 'RS256',
      subject: user.id,
      expiresIn: '7d', // Token expires in 7 days
    })

    return accessToken
  }
}
