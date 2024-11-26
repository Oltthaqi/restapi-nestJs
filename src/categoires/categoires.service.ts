import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCategoireDto } from './dto/create-categoire.dto';
import { UpdateCategoireDto } from './dto/update-categoire.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from './entities/categoire.entity';
import { Repository } from 'typeorm';

@Injectable()
export class CategoiresService {
  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
  ) {}
  async create(createCategoireDto: CreateCategoireDto) {
    const categoryExists = await this.categoryRepository.findOne({
      where: { name: createCategoireDto.name },
    });
    if (categoryExists) {
      throw new BadRequestException('category already exists!');
    }
    const category = await this.categoryRepository.create(createCategoireDto);

    return await this.categoryRepository.save(category);
  }

  async findAll() {
    return await this.categoryRepository.find();
  }

  async findOne(id: number) {
    return await this.categoryRepository.findOne({ where: { id } });
  }

  async update(id: number, updateCategoireDto: UpdateCategoireDto) {
    const category = await this.categoryRepository.findOne({ where: { id } });
    if (!category) {
      throw new NotFoundException('Category not found!');
    }

    Object.assign(category, updateCategoireDto);
    return await this.categoryRepository.save(category);
  }

  async remove(id: number) {
    const category = await this.categoryRepository.findOne({ where: { id } });

    if (!category) {
      throw new NotFoundException('Category not found!');
    }
    return await this.categoryRepository.remove(category);
  }
}
