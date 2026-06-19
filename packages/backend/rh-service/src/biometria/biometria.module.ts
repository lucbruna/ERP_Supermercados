import { Module } from '@nestjs/common';
import { PrismaModule } from '../common/prisma.module';
import { BiometriaController } from './biometria.controller';
import { BiometriaService } from './biometria.service';

@Module({
  imports: [PrismaModule],
  controllers: [BiometriaController],
  providers: [BiometriaService],
  exports: [BiometriaService],
})
export class BiometriaModule {}
