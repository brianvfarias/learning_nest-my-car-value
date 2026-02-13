import { Injectable } from '@nestjs/common';
import { Prisma } from 'src/generated/prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ReportsService {
  constructor(private readonly prismaService: PrismaService) {}

  async createReport(data: Prisma.ReportCreateInput) {
    return this.prismaService.report.create({ data });
  }
}
