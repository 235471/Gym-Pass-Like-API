import { container } from 'tsyringe'
import { CheckInMetricsController } from '../../http/check-ins/controllers/check-in-metrics'

export function makeCheckInMetricsController() {
  return container.resolve(CheckInMetricsController)
}
