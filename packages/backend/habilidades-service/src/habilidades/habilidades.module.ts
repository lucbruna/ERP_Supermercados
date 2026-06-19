import { Module } from '@nestjs/common';
import { HabilidadesController } from './habilidades.controller';
import { HabilidadesService } from './habilidades.service';

@Module({
  controllers: [HabilidadesController],
  providers: [HabilidadesService],
  exports: [HabilidadesService],
})
export class HabilidadesModule {}
