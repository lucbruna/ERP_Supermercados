import { SetMetadata } from '@nestjs/common';
import { THROTTLE_KEY } from './rate-limit.guard';

export interface ThrottleOptions {
  limit?: number;
  window?: number;
}

export const Throttle = (options: ThrottleOptions) => SetMetadata(THROTTLE_KEY, options);
