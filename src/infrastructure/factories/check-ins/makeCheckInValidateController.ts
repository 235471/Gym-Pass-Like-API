import { CheckInValidateController } from '@/infrastructure/http/check-ins/controllers/check-in-validate'
import { container } from 'tsyringe'

export function makeCheckInValidateController() {
  return container.resolve(CheckInValidateController)
}
