import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { ConvenioClient } from './convenio-client';
import { InventoryClient } from './inventory-client';
import { CrmClient } from './crm-client';

@Global()
@Module({
  providers: [PrismaService, ConvenioClient, InventoryClient, CrmClient],
  exports: [PrismaService, ConvenioClient, InventoryClient, CrmClient],
})
export class PrismaModule {}
