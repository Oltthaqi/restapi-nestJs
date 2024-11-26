import { Image } from 'src/image/image.entity';
import { Post } from 'src/posts/entities/post.entity';
import { User } from 'src/users/entities/user.entity';
import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('comment')
export class Comment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  comment: string;

  @Column()
  userId: number;

  @Column()
  postId: number;

  @Column({ nullable: true })
  commentId: number;

  @Column({ nullable: true })
  likes: number;

  @Column({ nullable: true })
  repliesCount: number;

  @ManyToOne(() => User, (user) => user.comments, { onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => Post, (post) => post.comments, { onDelete: 'CASCADE' })
  post: Post;
  @OneToMany(() => Comment, (reply) => reply.id, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  replies: Comment[];

  @OneToMany(() => Image, (image) => image.comment, { cascade: true })
  image: Image[];
}
