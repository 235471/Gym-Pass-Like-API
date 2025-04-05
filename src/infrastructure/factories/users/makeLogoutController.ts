import { container } from 'tsyringe';
import { LogoutController } from '@/infrastructure/http/users/controllers/logout-controller';

export function makeLogoutController() {
  return container.resolve(LogoutController);
}
