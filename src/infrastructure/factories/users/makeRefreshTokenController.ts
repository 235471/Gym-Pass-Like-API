import { container } from 'tsyringe';
import { RefreshTokenController } from '@/infrastructure/http/users/controllers/refresh-token-controller';

export function makeRefreshTokenController() {
  return container.resolve(RefreshTokenController);
}
