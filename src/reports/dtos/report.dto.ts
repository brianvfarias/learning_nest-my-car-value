import { Expose } from 'class-transformer';

export class ReportDto {
  @Expose()
  id: number;
  @Expose()
  price: number;
  @Expose()
  createdAt: Date;
  @Expose()
  updatedAt: Date;
}
