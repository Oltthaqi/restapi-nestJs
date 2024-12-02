import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { Brackets, Repository } from 'typeorm';
import { Post } from './entities/post.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Image } from 'src/image/image.entity';
import { UniversalType } from 'src/like/enums/universal-type.enum';
import { existsSync, unlinkSync } from 'fs';
import { join } from 'path';
import { Category } from 'src/categoires/entities/categoire.entity';
import { Like } from 'src/like/entities/like.entity';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post) private readonly postRepository: Repository<Post>,
    @InjectRepository(Image)
    private readonly ImageRepository: Repository<Image>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(Like)
    private readonly likeRepository: Repository<Like>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}
  async create(
    createPostDto: CreatePostDto,
    userId: number,
    categoryIds: number[],
    filepaths?: string[],
  ) {
    const newPost = await this.postRepository.create({
      ...createPostDto,
      createdAt: new Date(),
      likes: 0,
      userId,
    });
    const baseUrl = 'http://localhost:3000';
    const savedPost = await this.postRepository.save(newPost);

    const categories = await this.categoryRepository.findByIds(categoryIds);
    console.log(categories);

    if (categories.length !== categoryIds.length) {
      throw new NotFoundException('One or more categories not found');
    }
    savedPost.categories = categories;

    await this.postRepository.save(savedPost);

    if (filepaths && filepaths.length > 0 && savedPost) {
      const images = await filepaths.map((path) =>
        this.ImageRepository.create({
          filepath: `${baseUrl}/${path}`,
          universalId: savedPost.id,
          universalType: UniversalType.POST,
        }),
      );

      savedPost.image = await this.ImageRepository.save(images);

      return {
        savedPost,
      };
    }
    return await this.postRepository.save(newPost);
  }
  // async findAll(
  //   page: number,
  //   limit: number,
  // ): Promise<{
  //   page: number;
  //   totalRecords: number;
  //   totalPages: number;
  //   data: Post[];
  // }> {
  //   if (!page || page === 0) {
  //     page = 1;
  //   }
  //   if (!limit || limit === 0) {
  //     limit = 10;
  //   }
  //   const skip = (+page - 1) * +limit;
  //   const [data, totalRecords] = await this.postRepository
  //     .createQueryBuilder('post')
  //     .leftJoinAndSelect('post.image', 'image', 'image.universalType = :type', {
  //       type: UniversalType.POST,
  //     })
  //     .leftJoinAndSelect('post.categories', 'category')
  //     .skip(skip)
  //     .take(limit)
  //     .getManyAndCount();
  //   const totalPages = Math.ceil(totalRecords / limit);

  //   return {
  //     page,
  //     totalRecords,
  //     totalPages,
  //     data,
  //   };
  // }
  async findOne(id: number): Promise<Post> {
    return await this.postRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.image', 'image', 'image.universalType = :type', {
        type: UniversalType.POST,
      })
      .leftJoinAndSelect('post.categories', 'category')
      .where('post.id = :id', { id })
      .getOne();
  }
  async update(
    id: number,
    updatePostDto: UpdatePostDto,
    categoryId: number[],
    removeFiles?: number[],
    newFiles?: string[],
  ): Promise<Post> {
    const post = await this.postRepository.findOne({
      where: { id },
      relations: ['categories'],
    });
    if (!post) {
      throw new NotFoundException(`Post not found`);
    }

    const existingCategoryIds = post.categories.map((category) => category.id);
    const combinedCategoryIds = Array.from(
      new Set([...existingCategoryIds, ...categoryId]),
    );

    if (categoryId) {
      const categories =
        await this.categoryRepository.findByIds(combinedCategoryIds);

      post.categories = [...(post.categories || []), ...categories];
    }

    if (removeFiles) {
      console.log(removeFiles, 'files', typeof removeFiles);
      for (const id of removeFiles) {
        const filePath = await this.ImageRepository.findOne({
          where: { id },
        });
        if (!filePath) {
          throw new NotFoundException('Image not found!');
        }
        console.log(filePath);

        await this.removeFileFromStorage(filePath.filepath);

        await this.ImageRepository.delete({
          id,
          universalType: UniversalType.POST,
          universalId: filePath.universalId,
        });
      }
    }
    const baseUrl = 'http://localhost:3000/';
    if (newFiles && newFiles.length > 0) {
      const images = newFiles.map((path) =>
        this.ImageRepository.create({
          filepath: baseUrl + path,
          universalId: id,
          universalType: UniversalType.POST,
        }),
      );
      await this.ImageRepository.save(images);
    }

    Object.assign(post, updatePostDto);
    await this.postRepository.save(post);
    const updatedPost = await this.postRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.image', 'image', 'image.universalType = :type', {
        type: UniversalType.POST,
      })
      .leftJoinAndSelect('post.categories', 'categories')
      .where('post.id = :id', { id })
      .getOne();

    if (!updatedPost) {
      throw new NotFoundException(`Post not found after update`);
    }

    return updatedPost;
  }
  private async removeFileFromStorage(filePath: string) {
    const fullPath = join(process.cwd(), 'uploads', filePath);

    if (existsSync(fullPath)) {
      unlinkSync(fullPath);
    }
  }
  async remove(id: number) {
    const post = await this.postRepository.findOneOrFail({ where: { id } });
    return this.postRepository.remove(post);
  }
  async updateUserPost(
    id: number,
    updatePostDto: UpdatePostDto,
    userId: number,
    removeFiles?: number[],
    newFiles?: string[],
  ) {
    const post = await this.postRepository.findOne({
      where: { id },
    });
    if (!post) {
      throw new NotFoundException('Post not found ');
    }
    if (post.userId !== userId) {
      throw new UnauthorizedException('you cant edit this post!');
    }
    if (removeFiles) {
      for (const id of removeFiles) {
        const filePath = await this.ImageRepository.findOne({
          where: { id },
        });
        if (!filePath) {
          throw new NotFoundException('Image not found!');
        }
        console.log(filePath);

        await this.removeFileFromStorage(filePath.filepath);

        await this.ImageRepository.delete({
          id,
          universalType: UniversalType.POST,
          universalId: filePath.universalId,
        });
      }

      const baseUrl = 'http://localhost:3000/';
      if (newFiles && newFiles.length > 0) {
        const images = newFiles.map((path) =>
          this.ImageRepository.create({
            filepath: baseUrl + path,
            universalId: id,
            universalType: UniversalType.POST,
          }),
        );
        await this.ImageRepository.save(images);
      }
    }

    Object.assign(post, updatePostDto);
    await this.postRepository.save(post);
    const updatedPost = await this.postRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.image', 'image', 'image.universalType = :type', {
        type: UniversalType.POST,
      })
      .where('post.id = :id', { id })
      .getOne();

    if (!updatedPost) {
      throw new NotFoundException(`Post not found after update`);
    }

    return updatedPost;
  }
  async removeUserPost(id: number, userId: number) {
    const post = await this.postRepository.findOne({
      where: { id },
    });
    if (post.userId !== userId) {
      throw new UnauthorizedException('you can delete this post');
    }
    if (!post) {
      throw new NotFoundException('Post not found ');
    }

    return await this.postRepository.remove(post);
  }
  async getPostsPerUser(
    userId: number,
    page: number,
    limit: number,
  ): Promise<{
    page: number;
    totalRecords: number;
    totalPages: number;
    data: Post[];
  }> {
    if (!page || page === 0) {
      page = 1;
    }
    if (!limit || limit === 0) {
      limit = 10;
    }
    const skip = (+page - 1) * +limit;
    const [data, totalRecords] = await this.postRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.image', 'image', 'image.universalType = :type', {
        type: UniversalType.POST,
      })
      .leftJoinAndSelect('post.categories', 'category')
      .where('post.userId = :userId', { userId })
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
  async findAll(
    page: number,
    limit: number,
    catIds: string[],
    title: string,
    userId: number,
  ): Promise<{
    page: number;
    totalRecords: number;
    totalPages: number;
    data: Post[];
  }> {
    let parsedcatId = [];
    if (catIds && catIds.length > 0) {
      parsedcatId = (Array.isArray(catIds) ? catIds : [catIds])
        .map((id) => Number(id.trim()))
        .filter((id) => !isNaN(id));
    }

    if (!page || page < 1) page = 1;
    if (!limit || limit < 1) limit = 10;

    const skip = (page - 1) * limit;

    const query = this.postRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.image', 'image', 'image.universalType = :type', {
        type: UniversalType.POST,
      })
      .leftJoinAndSelect('post.categories', 'category')
      .leftJoinAndSelect('post.user', 'user')
      .leftJoin(
        'user_blocks',
        'user_blocks',
        '(user_blocks.userId = :currentUserId AND user_blocks.blockedId = user.id) OR (user_blocks.blockedId = :currentUserId AND user_blocks.userId = user.id)',
        { currentUserId: userId },
      )
      .where(
        new Brackets((qb) => {
          qb.where('user_blocks.userId IS NULL').andWhere(
            'user_blocks.blockedId IS NULL',
          );
        }),
      )
      .skip(skip)
      .take(limit);

    if (title) {
      const user = await this.userRepository
        .createQueryBuilder('user')
        .where('user.username LIKE :title', { title: `%${title}%` })
        .getOne();
      query.where(
        new Brackets((qb) => {
          qb.where('post.title LIKE :title', { title: `%${title}%` });
          if (user) {
            qb.orWhere('post.userId = :userId', { userId: user.id });
          }
        }),
      );
    }

    if (parsedcatId.length > 0) {
      query.andWhere(
        'post.id IN (SELECT postId FROM postscategories WHERE categoryId IN (:...catIds))',
        { catIds: parsedcatId },
      );
    }

    const [data, totalRecords] = await query.getManyAndCount();

    const totalPages = Math.ceil(totalRecords / limit);

    return {
      page,
      totalRecords,
      totalPages,
      data,
    };
  }
  async getCatIds(postIds: number[]): Promise<Post[]> {
    const categoryIds = await this.postRepository
      .createQueryBuilder('post')
      .leftJoin('post.categories', 'category')
      .select('DISTINCT category.id', 'id')
      .where('post.id IN (:...postIds)', { postIds })
      .getRawMany();

    return categoryIds;
  }
  async postIdsFromCst(catIds: number[]): Promise<Post[]> {
    const postIdsFromCategories = await this.postRepository
      .createQueryBuilder('post')
      .select('post.id', 'id')
      .leftJoin('post.categories', 'category')
      .where('category.id IN (:...catIds)', { catIds })
      .getRawMany();

    return postIdsFromCategories;
  }
  async getPostsPerUserCat(
    page: number,
    limit: number,
    userId: number,
    field?: string,
    type?: string,
  ): Promise<{
    page: number;
    totalRecords: number;
    totalPages: number;
    data: Post[];
  }> {
    if (!page || page < 1) page = 1;
    if (!limit || limit < 1) limit = 10;

    const skip = (page - 1) * limit;

    const likes = await this.likeRepository.find({ where: { userId } });
    const postLikes = likes.filter((like) => like.universalType === 'Post');
    const postIds = postLikes.map((like) => like.univesalId);
    if (postIds.length === 0) {
      const [data, totalRecords] = await this.postRepository
        .createQueryBuilder('post')
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
    const categoryIds = await this.getCatIds(postIds);
    const catIds = categoryIds.map((category) => category.id);
    const postIdsFromCategories = await this.postIdsFromCst(catIds);

    const finalPostIds = postIdsFromCategories.map((post) => post.id);

    const query = await this.postRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.categories', 'categories')
      .leftJoinAndSelect('post.image', 'image')
      .leftJoinAndSelect('post.user', 'user')
      .leftJoin(
        'user_blocks',
        'user_blocks',
        '(user_blocks.userId = :currentUserId AND user_blocks.blockedId = user.id) OR (user_blocks.blockedId = :currentUserId AND user_blocks.userId = user.id)',
        { currentUserId: userId },
      )
      .where('post.id IN (:...ids)', { ids: finalPostIds })
      .andWhere('user_blocks.userId IS NULL AND user_blocks.blockedId IS NULL')
      .skip(skip)
      .take(limit);

    if (field) {
      if (field.includes('autor')) {
        field = 'username';
        query.leftJoinAndSelect('post.userId', 'user');
      } else {
        field = 'post.' + field;
      }
      if (type) {
        query.orderBy(field, type.toUpperCase() as 'ASC' | 'DESC');
      } else {
        query.orderBy(field, 'DESC');
      }
    }

    const [data, totalRecords] = await query.getManyAndCount();
    const totalPages = Math.ceil(totalRecords / limit);
    return {
      page,
      totalRecords,
      totalPages,
      data,
    };
  }
}
