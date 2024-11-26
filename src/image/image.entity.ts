import { Comment } from 'src/comments/entities/comment.entity';
import { Post } from 'src/posts/entities/post.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Image {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  filepath: string;

  @Column()
  universalId: number;

  @Column()
  universalType: string;

  @ManyToOne(() => Comment, (comment) => comment.image, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'universalId' })
  comment: Comment;

  @ManyToOne(() => Post, (post) => post.image, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'universalId' })
  post: Post;
}
