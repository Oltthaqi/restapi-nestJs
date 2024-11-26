import { Module } from '@nestjs/common';
import { CategoiresService } from './categoires.service';
import { CategoiresController } from './categoires.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from './entities/categoire.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Category])],
  controllers: [CategoiresController],
  providers: [CategoiresService],
  exports: [CategoiresService],
})
export class CategoiresModule {}
