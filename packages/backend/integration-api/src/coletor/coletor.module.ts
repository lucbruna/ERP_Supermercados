import { Module } from '@nestjs/common';
import { ColetorController } from './coletor.controller';
import { ColetorService } from './coletor.service';

@Module({ controllers: [ColetorController], providers: [ColetorService], exports: [ColetorService] })
export class ColetorModule {}
