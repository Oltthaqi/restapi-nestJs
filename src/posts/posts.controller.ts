import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  Query,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/Decorators/roles.decorator';
import { UserRole } from 'src/auth/enums/user-role.enum';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiQuery } from '@nestjs/swagger';
import { Request as ExpressRequest } from 'express';
import { User } from 'src/users/entities/user.entity';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { join } from 'path';

// import { GetPostsPerCategoryDto } from './dto/get-postsbyId.dto';

@ApiBearerAuth('access-token')
@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.USER)
  @UseInterceptors(
    FilesInterceptor('file', 10, {
      storage: diskStorage({
        destination: join(process.cwd(), 'uploads'),
        filename: (req, file, cb) => {
          const name = file.originalname.split('.')[0];
          const fileExtension = file.originalname.split('.')[1];
          const newFileName =
            name.split('.').join('_') + '_' + Date.now() + '.' + fileExtension;

          cb(null, newFileName);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
          return cb(null, false);
        }
        cb(null, true);
      },
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
        categoryId: {
          type: 'array',
          items: {
            type: 'string',
            description: 'List of file paths to remove',
          },
        },
        title: { type: 'string', description: 'Title of the post' },
        content: { type: 'string', description: 'Content of the post' },
      },
    },
  })
  create(
    @Body() body: { title: string; content: string; categoryId: string },
    @Req() req: ExpressRequest,
    @UploadedFiles() files?: Express.Multer.File[],
  ) {
    const title = body.title;
    const content = body.content;
    const categoryId = req.body.categoryId as string;

    const user = req.user as User;
    const filepaths = files?.map((file) => `uploads/${file.filename}`) || [];

    let parsecategoryId: number[] = [];
    if (categoryId) {
      if (typeof categoryId === 'string') {
        parsecategoryId = categoryId
          .split(',')
          .map((id) => Number(id.trim()))
          .filter((id) => !isNaN(id));
      } else {
        console.error('Unexpected type for removeFiles:', typeof categoryId);
      }
    }
    const createPostDto: CreatePostDto = { title, content };
    console.log(createPostDto);

    return this.postsService.create(
      createPostDto,
      user.id,
      parsecategoryId,
      filepaths,
    );
  }
  @Get('admin')
  @ApiQuery({
    name: 'catId',
    required: false,
    isArray: true,
  })
  @ApiQuery({
    name: 'search',
    required: false,
  })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.USER)
  findAll(
    @Req() req: ExpressRequest,
    @Query('search') search: string,
    @Query('catId') catId: string[],
    @Query('page') page: number,
    @Query('limit') limit: number,
  ) {
    const user = req.user as User;
    return this.postsService.findAll(page, limit, catId, search, user.id);
  }
  @Get('admin:id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  findOne(@Param('id') id: string) {
    return this.postsService.findOne(+id);
  }
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch('admin:id')
  @UseInterceptors(
    FilesInterceptor('file', 10, {
      storage: diskStorage({
        destination: join(process.cwd(), 'uploads'),
        filename: (req, file, cb) => {
          const name = file.originalname.split('.')[0];
          const fileExtension = file.originalname.split('.')[1];
          const newFileName =
            name.split('.').join('_') + '_' + Date.now() + '.' + fileExtension;

          cb(null, newFileName);
        },
      }),
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
        removeFilesId: {
          type: 'array',
          items: {
            type: 'string',
            description: 'List of file paths to remove',
          },
        },
        updatePostDto: {
          type: 'object',
          properties: {
            title: { type: 'string', description: 'Updated title of the post' },
            content: {
              type: 'string',
              description: 'Updated content of the post',
            },
          },
        },
        categoryId: {
          type: 'array',
          items: {
            type: 'string',
            description: 'List of file paths to remove',
          },
        },
      },
    },
  })
  update(
    @Param('id') id: string,
    @Body()
    body: {
      removeFilesId?: string;
      updatePostDto: UpdatePostDto;
      categoryId: string;
    },
    @UploadedFiles() files?: Express.Multer.File[],
  ) {
    const { removeFilesId, updatePostDto, categoryId } = body;
    const newFiles = files?.map((file) => `uploads/${file.filename}`) || [];

    let parsecategoryId: number[] = [];
    if (categoryId) {
      if (typeof categoryId === 'string') {
        parsecategoryId = categoryId
          .split(',')
          .map((id) => Number(id.trim()))
          .filter((id) => !isNaN(id));
      }
    }
    // console.log('filesId', removeFilesId);
    let parsedRemoveFiles: number[] = [];
    if (removeFilesId) {
      if (typeof removeFilesId === 'string') {
        parsedRemoveFiles = removeFilesId
          .split(',')
          .map((id) => Number(id.trim()))
          .filter((id) => !isNaN(id));
      }
    }
    return this.postsService.update(
      +id,
      updatePostDto,
      parsecategoryId,
      parsedRemoveFiles,
      newFiles,
    );
  }
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @Delete('admin:id')
  remove(@Param('id') id: string) {
    return this.postsService.remove(+id);
  }
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.USER)
  @Patch(':id')
  @UseInterceptors(
    FilesInterceptor('file', 10, {
      storage: diskStorage({
        destination: join(process.cwd(), 'uploads'),
        filename: (req, file, cb) => {
          const name = file.originalname.split('.')[0];
          const fileExtension = file.originalname.split('.')[1];
          const newFileName =
            name.split('.').join('_') + '_' + Date.now() + '.' + fileExtension;

          cb(null, newFileName);
        },
      }),
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
        removeFilesId: {
          type: 'array',
          items: {
            type: 'string',
            description: 'List of file paths to remove',
          },
        },
        updatePostDto: {
          type: 'object',
          properties: {
            title: { type: 'string', description: 'Updated title of the post' },
            content: {
              type: 'string',
              description: 'Updated content of the post',
            },
          },
        },
      },
    },
  })
  updatePostByUser(
    @Param('id') id: string,
    @Body() body: { removeFilesId?: string; updatePostDto: UpdatePostDto },
    @Req() req: ExpressRequest,
    @UploadedFiles() files?: Express.Multer.File[],
  ) {
    const { removeFilesId, updatePostDto } = body;
    const newFiles = files?.map((file) => `uploads/${file.filename}`) || [];
    const user = req.user as User;

    let parsedRemoveFiles: number[] = [];
    if (removeFilesId) {
      if (typeof removeFilesId === 'string') {
        parsedRemoveFiles = removeFilesId
          .split(',')
          .map((id) => Number(id.trim()))
          .filter((id) => !isNaN(id));
      }
    }
    return this.postsService.updateUserPost(
      +id,
      updatePostDto,
      user.id,
      parsedRemoveFiles,
      newFiles,
    );
  }
  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.USER)
  removePost(@Param('id') id: string, @Req() req: ExpressRequest) {
    const user = req.user as User;
    return this.postsService.removeUserPost(+id, user.id);
  }

  @Get('posts-user/:id')
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.USER)
  getPostsPerUser(
    @Req() req: ExpressRequest,
    @Query('page') page: number,
    @Query('limit') limit: number,
  ) {
    const user = req.user as User;

    return this.postsService.getPostsPerUser(user.id, page, limit);
  }

  @Get('user-feed')
  @ApiQuery({ name: 'field', required: false })
  @ApiQuery({ name: 'type', required: false })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.USER)
  getUserFeed(
    @Req() req: ExpressRequest,
    @Query('field') field: string,
    @Query('type') type: string,
    @Query('page') page: number,
    @Query('limit') limit: number,
  ) {
    const user = req.user as User;
    return this.postsService.getPostsPerUserCat(
      page,
      limit,
      user.id,
      field,
      type,
    );
  }

  // @Get('posts-for-Category')
  // @ApiQuery({
  //   name: 'catId',
  //   required: true,
  //   isArray: true,
  // })
  // @ApiQuery({ name: 'page', required: false, example: 1 })
  // @ApiQuery({ name: 'limit', required: false, example: 10 })
  // @UseGuards(RolesGuard)
  // @Roles(UserRole.ADMIN, UserRole.USER)
  // getPostsPerCategory(
  //   @Query('catId') catId: string[],
  //   @Query('page') page: number,
  //   @Query('limit') limit: number,
  // ) {
  //   const parsedcatId = (Array.isArray(catId) ? catId : [catId])
  //     .map((id) => Number(id.trim()))
  //     .filter((id) => !isNaN(id));
  //   return this.postsService.getPostsByCategory(parsedcatId, page, limit);
  // }
}
