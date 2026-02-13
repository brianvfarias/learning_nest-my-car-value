import { Module } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  providers: [ReportsService],
  controllers: [ReportsController],
  imports: [PrismaModule],
})
export class ReportsModule {}
