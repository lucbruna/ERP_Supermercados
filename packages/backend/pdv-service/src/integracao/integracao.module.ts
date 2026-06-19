import { Module, Global } from '@nestjs/common';
import { TefService } from './tef.service';
import { SatService } from './sat.service';
import { NfceService } from './nfce.service';
import { ImpressoraService } from './impressora.service';
import { PixService } from './pix.service';

@Global()
@Module({
  providers: [
    TefService,
    SatService,
    NfceService,
    ImpressoraService,
    PixService,
  ],
  exports: [
    TefService,
    SatService,
    NfceService,
    ImpressoraService,
    PixService,
  ],
})
export class IntegracaoModule {}
