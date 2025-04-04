import { container } from 'tsyringe'
import { CheckInHistoryController } from '../../http/check-ins/controllers/check-in-history'

export function makeCheckInHistoryController() {
  return container.resolve(CheckInHistoryController)
}
