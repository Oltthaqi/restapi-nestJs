import { User } from 'src/users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { FriendshipStatus } from '../enum/status.enum';

@Entity()
export class Friendship {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  requesterId: number;
  @Column()
  addresseeId: number;
  @ManyToOne(() => User, (user) => user.sentFriendRequests)
  requester: User;

  @ManyToOne(() => User, (user) => user.receivedFriendRequests)
  addressee: User;

  @Column({ default: 'pending' })
  status: FriendshipStatus;

  @CreateDateColumn()
  createdAt: Date;

  @CreateDateColumn({ nullable: true })
  updatedAt: Date;
}
