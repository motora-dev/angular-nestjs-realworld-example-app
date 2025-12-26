import { Module } from '@nestjs/common';

import { PrismaAdapter } from './prisma.adapter';

@Module({
  providers: [PrismaAdapter],
  exports: [PrismaAdapter],
})
export class PrismaAdapterModule {}
