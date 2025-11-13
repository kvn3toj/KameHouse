import { Module } from '@nestjs/common';
import { RoomTemplateController } from './room-template.controller';
import { RoomTemplateService } from './room-template.service';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [RoomTemplateController],
  providers: [RoomTemplateService, PrismaService],
  exports: [RoomTemplateService],
})
export class RoomTemplateModule {}
