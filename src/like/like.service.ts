import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like } from './entities/like.entity';
import { Repository } from 'typeorm';
import { CreateLikeDto } from './dto/create-like.dto';
import { Post } from 'src/posts/entities/post.entity';
import { Comment } from 'src/comments/entities/comment.entity';
import { UniversalType } from './enums/universal-type.enum';

@Injectable()
export class LikeService {
  constructor(
    @InjectRepository(Like) private readonly likeRepo: Repository<Like>,
    @InjectRepository(Post) private readonly postRepo: Repository<Post>,
    @InjectRepository(Comment)
    private readonly commentRepo: Repository<Comment>,
  ) {}
  async likePost(
    createLikeDto: CreateLikeDto,
    univesalId: number,
    userId: number,
  ): Promise<Like> {
    const universalType = UniversalType.POST;
    console.log(univesalId);

    const likeExists = await this.likeRepo.findOne({
      where: { userId, univesalId, universalType },
    });

    if (likeExists) {
      this.decrementposts(univesalId);
      return await this.likeRepo.remove(likeExists);
    }
    const like = await this.likeRepo.create({
      ...createLikeDto,
      userId,
      univesalId,
      universalType,
    });
    this.incrementLikesPosts(univesalId);
    return this.likeRepo.save(like);
  }

  async likeComment(
    createLikeDto: CreateLikeDto,
    univesalId: number,
    userId: number,
  ): Promise<Like> {
    const universalType = UniversalType.COMMENT;
    const likeExists = await this.likeRepo.findOne({
      where: { userId, univesalId, universalType },
    });

    if (likeExists) {
      this.decrementComments(univesalId);
      return await this.likeRepo.remove(likeExists);
    }
    const like = await this.likeRepo.create({
      ...createLikeDto,
      userId,
      univesalId,
      universalType,
    });
    this.incrementLikesComment(univesalId);
    return this.likeRepo.save(like);
  }

  async incrementLikesPosts(univesalId: number) {
    const post = await this.postRepo.findOne({
      where: { id: univesalId },
    });
    post.likes++;
    return await this.postRepo.save(post);
  }

  async incrementLikesComment(id: number) {
    const comment = await this.commentRepo.findOne({ where: { id } });
    comment.likes++;
    await this.commentRepo.save(comment);
  }
  async decrementComments(universalId: number) {
    const comment = await this.commentRepo.findOne({
      where: { id: universalId },
    });
    comment.likes--;
    this.commentRepo.save(comment);
  }

  async decrementposts(universalId: number) {
    const post = await this.postRepo.findOne({
      where: { id: universalId },
    });
    post.likes--;
    this.postRepo.save(post);
  }

  async getLikes(
    id: number,
    universalType: string,
    page: number,
    limit: number,
  ): Promise<{
    page: number;
    totalRecords: number;
    totalPages: number;
    data: Like[];
  }> {
    if (!page || page === 0) {
      page = 1;
    }
    if (!limit || limit === 0) {
      limit = 10;
    }
    const skip = (+page - 1) * +limit;

    const [data, totalRecords] = await this.likeRepo.findAndCount({
      where: { univesalId: id, universalType },
      skip,
      take: limit,
    });
    const totalPages = Math.ceil(totalRecords / limit);

    return {
      page,
      totalRecords,
      totalPages,
      data,
    };
  }
}
