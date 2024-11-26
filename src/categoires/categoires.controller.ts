import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { CategoiresService } from './categoires.service';
import { CreateCategoireDto } from './dto/create-categoire.dto';
import { UpdateCategoireDto } from './dto/update-categoire.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/Decorators/roles.decorator';
import { UserRole } from 'src/auth/enums/user-role.enum';
@UseGuards(RolesGuard)
@ApiBearerAuth('access-token')
@Controller('categoires')
export class CategoiresController {
  constructor(private readonly categoiresService: CategoiresService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  create(@Body() createCategoireDto: CreateCategoireDto) {
    return this.categoiresService.create(createCategoireDto);
  }

  @Get()
  @Roles(UserRole.ADMIN)
  findAll() {
    return this.categoiresService.findAll();
  }

  @Get(':id')
  @Roles(UserRole.ADMIN)
  findOne(@Param('id') id: string) {
    return this.categoiresService.findOne(+id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  update(
    @Param('id') id: string,
    @Body() updateCategoireDto: UpdateCategoireDto,
  ) {
    return this.categoiresService.update(+id, updateCategoireDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.categoiresService.remove(+id);
  }
}
