import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dataSourceOptions } from 'db/data-source';
import { AuthModule } from './auth/auth.module';

import { ConfigModule } from '@nestjs/config';
import { MessageModule } from './message/message.module';
import { VerificationModule } from './verification/verification.module';
import { CommentsModule } from './comments/comments.module';
import { PostsModule } from './posts/posts.module';
import { LikeModule } from './like/like.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { CategoiresModule } from './categoires/categoires.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env.example',
    }),
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'),
      serveRoot: '/uploads',
      serveStaticOptions: {
        index: false,
      },
    }),
    TypeOrmModule.forRoot(dataSourceOptions),
    UsersModule,
    AuthModule,
    MessageModule,
    VerificationModule,
    CommentsModule,
    PostsModule,
    LikeModule,
    CategoiresModule,
  ],
})
export class AppModule {}
