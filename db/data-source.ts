import { Category } from 'src/categoires/entities/categoire.entity';
import { Comment } from 'src/comments/entities/comment.entity';
import { Friendship } from 'src/friendship/entities/friendship.entity';
import { Image } from 'src/image/image.entity';
import { Like } from 'src/like/entities/like.entity';
import { Post } from 'src/posts/entities/post.entity';

import { User } from 'src/users/entities/user.entity';
import { Verification } from 'src/verification/entities/verification.entity';
import { DataSource, DataSourceOptions } from 'typeorm';

export const dataSourceOptions: DataSourceOptions = {
  type: 'sqlite',
  database: 'db.sqlite',
  entities: [
    User,
    Verification,
    Comment,
    Post,
    Like,
    Image,
    Category,
    Friendship,
  ],
  synchronize: false,
  logging: true,
  migrations: ['dist/db/migrations/*.js'],
};
const dataSource = new DataSource(dataSourceOptions);

export default dataSource;
