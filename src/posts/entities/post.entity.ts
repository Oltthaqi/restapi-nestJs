import { Category } from 'src/categoires/entities/categoire.entity';
import { Comment } from 'src/comments/entities/comment.entity';
import { Image } from 'src/image/image.entity';

import { User } from 'src/users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Post {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  title: string;
  @Column()
  content: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column()
  userId: number;

  @Column()
  likes: number;

  @ManyToOne(() => User, (user) => user.comments, { onDelete: 'CASCADE' })
  user: User;

  @OneToMany(() => Comment, (comment) => comment.id, { cascade: true })
  comments: Comment[];

  @OneToMany(() => Image, (image) => image.post, { cascade: true })
  image: Image[];

  @ManyToMany(() => Category, (category) => category.posts)
  @JoinTable({
    name: 'postscategories',
    joinColumn: {
      name: 'postId',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'categoryId',
      referencedColumnName: 'id',
    },
  })
  categories: Category[];
}
