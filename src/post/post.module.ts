import { Module } from '@nestjs/common';
import { PostService } from './post.service';
import { PostController } from './post.controller';
import { PrismaModule } from '../prisma/prisma.module'; // PrismaModule 임포트

@Module({
  imports: [PrismaModule], // PrismaModule 추가
  providers: [PostService],
  controllers: [PostController],
})
export class PostModule {}
