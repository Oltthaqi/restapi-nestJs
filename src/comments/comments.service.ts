import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { Comment } from './entities/comment.entity';
import { IsNull, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Post } from 'src/posts/entities/post.entity';
import { Image } from 'src/image/image.entity';
import { UniversalType } from 'src/like/enums/universal-type.enum';
import { join } from 'path';
import { existsSync, unlinkSync } from 'fs';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment) private commentRepository: Repository<Comment>,
    @InjectRepository(Post) private postRepository: Repository<Post>,
    @InjectRepository(Image) private imageRepository: Repository<Image>,
  ) {}

  async create(
    createCommentDto: CreateCommentDto,
    userId: number,
    postId: number,
    filepaths: string[],
  ) {
    if (!createCommentDto.comment) {
      throw new BadRequestException('Comments cant be null');
    }
    if (!userId) {
      throw new BadRequestException('user is missing');
    }

    if (!postId) {
      throw new BadRequestException('Post is deleted');
    }

    const newComment = await this.commentRepository.create({
      ...createCommentDto,
      userId,
      postId,
    });
    const baseUrl = 'http://localhost:3000';

    const savedComment = await this.commentRepository.save(newComment);

    if (filepaths && filepaths.length > 0) {
      const images = filepaths.map((path) =>
        this.imageRepository.create({
          filepath: `${baseUrl}/${path}`,
          universalId: savedComment.id,
          universalType: UniversalType.COMMENT,
        }),
      );
      newComment.image = await this.imageRepository.save(images);
    }

    return newComment;
  }

  async findAll(
    page: number,
    limit: number,
  ): Promise<{
    page: number;
    totalRecords: number;
    totalPages: number;
    data: Comment[];
  }> {
    if (!page || page === 0) {
      page = 1;
    }
    if (!limit || limit === 0) {
      limit = 10;
    }

    const skip = (page - 1) * limit;

    const [data, totalRecords] = await this.commentRepository
      .createQueryBuilder('comment')
      .leftJoinAndSelect(
        'comment.image',
        'image',
        'image.universalType = :type',
        {
          type: UniversalType.COMMENT,
        },
      )
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    if (data.length > 0 && data[0].image) {
      console.log('Images for the first comment:', data[0].image);
    } else {
      console.log('No comments or no images found.');
    }

    const totalPages = Math.ceil(totalRecords / limit);

    return {
      page,
      totalRecords,
      totalPages,
      data,
    };
  }

  findOne(id: number) {
    return this.commentRepository
      .createQueryBuilder('comment')
      .leftJoinAndSelect(
        'comment.image',
        'image',
        'image.universalType = :type',
        {
          type: UniversalType.COMMENT,
        },
      )
      .where('comment.id = :id ', { id })
      .getOne();
  }

  async update(
    id: number,
    updateCommentDto: UpdateCommentDto,
    newFiles?: string[],
    removeFiles?: number[],
  ) {
    const comment = await this.commentRepository.findOne({ where: { id } });
    if (!comment) {
      throw new NotFoundException('Comment dosnt exist!');
    }
    if (removeFiles) {
      console.log(removeFiles);

      for (const id of removeFiles) {
        const filePath = await this.imageRepository.findOne({
          where: { id },
        });
        console.log(filePath);

        if (!filePath) {
          throw new NotFoundException('Image not found!');
        }
        await this.removeFileFromStorage(filePath.filepath);

        await this.imageRepository.delete({
          id,
          universalType: UniversalType.COMMENT,
          universalId: filePath.universalId,
        });
      }
    }
    const baseUrl = 'http://localhost:3000/';
    if (newFiles && newFiles.length > 0) {
      const images = newFiles.map((path) =>
        this.imageRepository.create({
          filepath: baseUrl + path,
          universalId: id,
          universalType: UniversalType.COMMENT,
        }),
      );
      await this.imageRepository.save(images);
    }
    Object.assign(comment, updateCommentDto);
    await this.commentRepository.save(comment);
    const updateComment = await this.commentRepository
      .createQueryBuilder('comment')
      .leftJoinAndSelect(
        'comment.image',
        'image',
        'image.universalType = :type',
        {
          type: UniversalType.COMMENT,
        },
      )
      .where('comment.id = :id', { id })
      .getOne();

    if (!updateComment) {
      throw new NotFoundException(`Post not found after update`);
    }

    return updateComment;
  }

  private async removeFileFromStorage(filePath: string) {
    const fullPath = join(process.cwd(), 'uploads', filePath);
    console.log(filePath);

    if (existsSync(fullPath)) {
      unlinkSync(fullPath);
    }
  }

  async remove(id: number) {
    const commentToDelete = await this.commentRepository.findOne({
      where: { id },
    });
    return this.commentRepository.remove(commentToDelete);
  }

  async getCommentsPerPost(
    postId: number,
    page: number,
    limit: number,
  ): Promise<{
    page: number;
    totalRecords: number;
    totalPages: number;
    data: Comment[];
  }> {
    if (!page || page < 1) {
      page = 1;
    }
    if (!limit || limit < 1) {
      limit = 10;
    }

    const skip = (page - 1) * limit;

    const totalRecords = await this.commentRepository.count({
      where: { commentId: IsNull(), postId },
    });

    const data = await this.commentRepository
      .createQueryBuilder('comment')
      .leftJoinAndSelect(
        'comment.image',
        'image',
        'image.universalType = :type',
        {
          type: UniversalType.COMMENT,
        },
      )
      .where('comment.commentId IS NULL')
      .andWhere('comment.postId = :postId', { postId })
      .skip(skip)
      .take(limit)
      .getMany();

    const totalPages = Math.ceil(totalRecords / limit);

    return {
      page,
      totalRecords,
      totalPages,
      data,
    };
  }

  async updateCommentUser(
    id: number,
    userId: number,
    updateCommentDto,
    newFiles?: string[],
    removeFiles?: number[],
  ) {
    const comment = await this.commentRepository.findOne({
      where: { id },
    });
    if (!comment) {
      throw new NotFoundException('comment not found');
    }
    if (comment.userId !== userId) {
      throw new UnauthorizedException('you cant edit this comment!');
    }
    if (removeFiles) {
      console.log(newFiles);

      for (const id of removeFiles) {
        const filePath = await this.imageRepository.findOne({
          where: { id },
        });
        console.log(filePath);

        if (!filePath) {
          throw new NotFoundException('Image not found!');
        }
        await this.removeFileFromStorage(filePath.filepath);

        await this.imageRepository.delete({
          id,
          universalType: UniversalType.COMMENT,
          universalId: filePath.universalId,
        });
      }
    }
    const baseUrl = 'http://localhost:3000/';
    if (newFiles && newFiles.length > 0) {
      const images = newFiles.map((path) =>
        this.imageRepository.create({
          filepath: baseUrl + path,
          universalId: id,
          universalType: UniversalType.COMMENT,
        }),
      );
      await this.imageRepository.save(images);
    }
    Object.assign(comment, updateCommentDto);
    await this.commentRepository.save(comment);
    const updateComment = await this.commentRepository
      .createQueryBuilder('comment')
      .leftJoinAndSelect(
        'comment.image',
        'image',
        'image.universalType = :type',
        {
          type: UniversalType.COMMENT,
        },
      )
      .where('comment.id = :id', { id })
      .getOne();

    if (!updateComment) {
      throw new NotFoundException(`Post not found after update`);
    }

    return updateComment;
  }

  async deleteUsersComment(id: number, userId: number) {
    const comment = await this.commentRepository.findOne({
      where: { id },
    });
    if (!comment) {
      throw new NotFoundException('comment not found');
    }
    if (comment.userId !== userId) {
      throw new UnauthorizedException('you cant delete this comment!');
    }
    return this.commentRepository.remove(comment);
  }

  async getCommentsPerUser(
    userId: number,
    page: number,
    limit: number,
  ): Promise<{
    page: number;
    totalRecords: number;
    totalPages: number;
    data: Comment[];
  }> {
    if (!page || page === 0) {
      page = 1;
    }
    if (!limit || limit === 0) {
      limit = 10;
    }
    const skip = (+page - 1) * +limit;
    const [data, totalRecords] = await this.commentRepository
      .createQueryBuilder('comment')
      .leftJoinAndSelect(
        'comment.image',
        'image',
        'image.universalType = :type',
        {
          type: UniversalType.COMMENT,
        },
      )
      .where('comment.userId = :userId', { userId })
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    const totalPages = Math.ceil(totalRecords / limit);

    return {
      page,
      totalRecords,
      totalPages,
      data,
    };
  }

  async getCommentReply(
    page: number,
    limit: number,
    commentId: number,
  ): Promise<{
    page: number;
    totalRecords: number;
    totalPages: number;
    data: Comment[];
  }> {
    if (!page || page === 0) {
      page = 1;
    }
    if (!limit || limit === 0) {
      limit = 10;
    }
    const skip = (+page - 1) * +limit;

    const [data, totalRecords] = await this.commentRepository
      .createQueryBuilder('comment')
      .leftJoinAndSelect(
        'comment.image',
        'image',
        'image.universalType = :type',
        {
          type: UniversalType.COMMENT,
        },
      )
      .where('comment.commentId = :commentId', { commentId })
      .skip(skip)
      .take(limit)
      .getManyAndCount();
    const totalPages = Math.ceil(totalRecords / limit);
    return {
      page,
      totalRecords,
      totalPages,
      data,
    };
  }

  async createReply(
    postId: number,
    createCommentDto: CreateCommentDto,
    userId: number,
    commentId: number,
    filepaths: string[],
  ) {
    if (!postId) {
      throw new NotFoundException('post not found!');
    }
    if (!commentId) {
      throw new NotFoundException('comment not found!');
    }
    const reply = await this.commentRepository.create({
      ...createCommentDto,
      postId,
      userId,
      commentId,
    });
    const baseUrl = 'http://localhost:3000';
    this.incrementCommentReply(commentId);
    const savedComment = await this.commentRepository.save(reply);

    if (filepaths && filepaths.length > 0) {
      const images = filepaths.map((path) =>
        this.imageRepository.create({
          filepath: `${baseUrl}/${path}`,
          universalId: savedComment.id,
          universalType: UniversalType.COMMENT,
        }),
      );
      reply.image = await this.imageRepository.save(images);
    }
    return reply;
  }

  async incrementCommentReply(id: number) {
    const comment = await this.commentRepository.findOne({ where: { id } });

    comment.repliesCount++;
    await this.commentRepository.save(comment);
  }

  async decrementCommentReply(id: number) {
    const comment = await this.commentRepository.findOne({ where: { id } });

    comment.repliesCount--;
    await this.commentRepository.save(comment);
  }

  async deleteReplyUser(id: number, userId: number): Promise<Comment> {
    const reply = await this.commentRepository.findOne({ where: { id } });

    if (!reply) {
      throw new NotFoundException('reply not found!');
    }
    if (reply.userId !== userId) {
      throw new UnauthorizedException('you cant delete this reply!');
    }
    this.decrementCommentReply(reply.commentId);
    return await this.commentRepository.remove(reply);
  }

  async deletecommentPost(
    id: number,
    postId: number,
    userId: number,
  ): Promise<Comment> {
    const comment = await this.commentRepository.findOne({ where: { id } });

    if (!comment) {
      throw new NotFoundException('comment not found!');
    }
    if (comment.postId !== postId) {
      throw new UnauthorizedException('you cant delete this comment!');
    }
    const post = await this.postRepository.findOne({
      where: { id: postId, userId },
    });
    if (!post) {
      throw new UnauthorizedException('you cant delete this comment!');
    }
    return await this.commentRepository.remove(comment);
  }
}
