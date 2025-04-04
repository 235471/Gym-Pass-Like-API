import { container } from 'tsyringe'
import { CheckInCreateController } from '../../http/check-ins/controllers/check-in-create'

export function makeCheckInCreateController() {
  return container.resolve(CheckInCreateController)
}
