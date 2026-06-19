import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  health() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'monitoring-service',
      uptime: process.uptime(),
    };
  }
}
