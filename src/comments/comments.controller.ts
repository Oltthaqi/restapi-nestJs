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
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { UserRole } from 'src/auth/enums/user-role.enum';
import { Roles } from 'src/auth/Decorators/roles.decorator';
import { Request as ExpressRequest } from 'express';

import { ApiBearerAuth, ApiBody, ApiConsumes, ApiQuery } from '@nestjs/swagger';
import { User } from 'src/users/entities/user.entity';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { join } from 'path';

@ApiBearerAuth('access-token')
@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post(':postId')
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

        comment: {
          type: 'string',
          description: 'Comment text',
        },
      },
    },
  })
  async create(
    @Param('postId') postId: number,
    @Body() createCommentDto: CreateCommentDto,
    @Req() req: ExpressRequest,
    @UploadedFiles() files?: Express.Multer.File[],
  ) {
    const user = req.user as User;
    const filepaths = files?.map((file) => `uploads/${file.filename}`) || [];

    return await this.commentsService.create(
      createCommentDto,
      user.id,
      +postId,
      filepaths,
    );
  }

  @Get('admin/getAll')
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  findAll(@Query('page') page: number, @Query('limit') limit: number) {
    return this.commentsService.findAll(page, limit);
  }

  @Get('admin/:id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  findOne(@Param('id') id: string) {
    return this.commentsService.findOne(+id);
  }

  @Patch('admin:id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
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
        updateCommentDto: {
          type: 'object',
          properties: {
            comment: {
              type: 'string',
            },
          },
        },
      },
    },
  })
  update(
    @Param('id') id: string,
    @Body()
    body: { removeFilesId?: string; updateCommentDto: UpdateCommentDto },
    @UploadedFiles() files?: Express.Multer.File[],
  ) {
    const { removeFilesId, updateCommentDto } = body;
    const newFiles = files?.map((file) => `uploads/${file.filename}`) || [];

    let parsedRemoveFiles: number[] = [];
    if (removeFilesId) {
      if (typeof removeFilesId === 'string') {
        parsedRemoveFiles = removeFilesId
          .split(',')
          .map((id) => Number(id.trim()))
          .filter((id) => !isNaN(id));
      } else {
        console.error('Unexpected type for removeFiles:', typeof removeFilesId);
      }
    }
    return this.commentsService.update(
      +id,
      updateCommentDto,
      newFiles,
      parsedRemoveFiles,
    );
  }

  @Delete('admin:id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.commentsService.remove(+id);
  }

  @Get(':postId')
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.USER)
  getCommentsPerPost(
    @Param('postId') postId: number,
    @Query('page') page: number,
    @Query('limit') limit: number,
  ) {
    return this.commentsService.getCommentsPerPost(postId, page, limit);
  }

  @Patch('User-comment/:commentId')
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
        updateCommentDto: {
          type: 'object',
          properties: {
            comment: {
              type: 'string',
            },
          },
        },
      },
    },
  })
  updatePerUser(
    @Param('commentId') id: string,
    @Req() req: ExpressRequest,
    @Body()
    body: { removeFilesId?: string; updateCommentDto: UpdateCommentDto },
    @UploadedFiles() files?: Express.Multer.File[],
  ) {
    const { removeFilesId, updateCommentDto } = body;
    const newFiles = files?.map((file) => `uploads/${file.filename}`) || [];
    const user = req.user as User;

    let parsedRemoveFiles: number[] = [];
    if (removeFilesId) {
      if (typeof removeFilesId === 'string') {
        parsedRemoveFiles = removeFilesId
          .split(',')
          .map((id) => Number(id.trim()))
          .filter((id) => !isNaN(id));
      } else {
        console.error('Unexpected type for removeFiles:', typeof removeFilesId);
      }
    }
    return this.commentsService.updateCommentUser(
      +id,
      user.id,
      updateCommentDto,
      newFiles,
      parsedRemoveFiles,
    );
  }

  @Delete('User/:id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.USER)
  deleteCommentUser(@Param('id') id: string, @Req() req: ExpressRequest) {
    const user = req.user as User;
    return this.commentsService.deleteUsersComment(+id, user.id);
  }

  @Get('Comments-User/:UserId')
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.USER)
  getUsersComments(
    @Req() req: ExpressRequest,
    @Query('page') page: number,
    @Query('limit') limit: number,
  ) {
    const user = req.user as User;

    return this.commentsService.getCommentsPerUser(user.id, page, limit);
  }
  @Get('replies-comment/:commentId')
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.USER)
  getCommentReply(
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Param('commentId') commentId: number,
  ) {
    return this.commentsService.getCommentReply(page, limit, commentId);
  }

  @Post('reply/:postId/:commentId')
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

        comment: {
          type: 'string',
          description: 'Comment text',
        },
      },
    },
  })
  createReply(
    @Param('postId') postId: number,
    @Body() createCommentDto: CreateCommentDto,
    @Req() req: ExpressRequest,
    @Param('commentId') commentId: number,
    @UploadedFiles() files?: Express.Multer.File[],
  ) {
    console.log(postId, commentId);

    const user = req.user as User;
    const filepaths = files?.map((file) => `uploads/${file.filename}`) || [];
    return this.commentsService.createReply(
      +postId,
      createCommentDto,
      user.id,
      commentId,
      filepaths,
    );
  }
  @Delete('reply/admin/:id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  deleteReplyAdmin(id: number) {
    return this.commentsService.remove(+id);
  }

  @Delete('reply/:id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.USER)
  deleteReplyUser(id: number, @Req() req: ExpressRequest) {
    const user = req.user as User;
    return this.commentsService.deleteReplyUser(id, user.id);
  }

  @Delete('comment-post/:id:postId')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.USER)
  deleteCommentPost(
    @Param('id') id: number,
    @Param('postId') postId: number,
    @Req() req: ExpressRequest,
  ) {
    const user = req.user as User;
    return this.commentsService.deletecommentPost(id, postId, user.id);
  }
}
