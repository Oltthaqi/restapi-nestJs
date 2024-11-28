import { IsEmail } from 'class-validator';
import { Comment } from 'src/comments/entities/comment.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { accountStatus } from '../enums/account-status.enum';
import { Post } from 'src/posts/entities/post.entity';
import { Like } from 'src/like/entities/like.entity';
import { Friendship } from 'src/friendship/entities/friendship.entity';

@Entity('user')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string;

  @IsEmail()
  @Column({ unique: true })
  email: string;

  @Column()
  password: string;
  @Column()
  role: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ default: accountStatus.INACTIVE })
  accountStatus: accountStatus.ACTIVE | accountStatus.INACTIVE;

  @Column({ nullable: true })
  emailVerifiedAt: Date;

  @Column()
  isVerified: boolean;

  @OneToMany(() => Comment, (comment) => comment.user)
  comments: Comment[];

  @OneToMany(() => Post, (post) => post.user)
  posts: Post[];

  @OneToMany(() => Like, (like) => like.user)
  likes: Like[];

  @OneToMany(() => Friendship, (friendship) => friendship.requester)
  sentFriendRequests: Friendship[];

  @OneToMany(() => Friendship, (friendship) => friendship.addressee)
  receivedFriendRequests: Friendship[];

  @ManyToMany(() => User)
  @JoinTable({
    name: 'user_blocks',
    joinColumn: { name: 'userId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'blockedId', referencedColumnName: 'id' },
  })
  blockedUsers: User[];
}
