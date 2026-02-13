import { Body, Controller, Post } from '@nestjs/common';
import { ReportsService } from './reports.service';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Post()
  async createReport(@Body() report: { price: number; userId: number }) {
    const { id } = await this.reportsService.createReport({
      price: report.price,
      user: { connect: { id: report.userId } },
    });
    return { reportId: id };
  }
}
