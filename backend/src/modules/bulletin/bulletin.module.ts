import { Module } from '@nestjs/common';
import { BulletinController } from './bulletin.controller';
import { BulletinService } from './bulletin.service';
import { PrismaService } from '../../prisma.service';

@Module({
  imports: [],
  controllers: [BulletinController],
  providers: [BulletinService, PrismaService],
  exports: [BulletinService],
})
export class BulletinModule {}
