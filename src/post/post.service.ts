import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePostDto } from './dto/create-post.dto';
import { PostIdDto } from './dto/post-id.dto';
import { UpdatePostDto } from './dto/update-post.dto';

@Injectable()
export class PostService {
  constructor(private readonly prisma: PrismaService) {}

  // 게시글 생성
  async createPost(createPostDto: CreatePostDto, userId: number) {
    const { title, content } = createPostDto;

    const post = await this.prisma.post.create({
      data: {
        title,
        content,
        authorId: userId,
      },
    });

    return { message: 'Post created successfully', post };
  }

  // 특정 유저의 게시글 리스트 조회
  async getPosts(userId: number) {
    return this.prisma.post.findMany({
      where: { authorId: userId },
      include: {
        author: true, // 작성자 정보 포함
      },
    });
  }

  // 단일 게시글 조회
  async getPostById(postIdDto: PostIdDto, userId: number) {
    const { postId } = postIdDto;

    const post = await this.prisma.post.findUnique({
      where: { id: postId },
      include: {
        author: true,
      },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    if (post.authorId !== userId) {
      throw new UnauthorizedException(
        'You are not authorized to view this post',
      );
    }

    return post;
  }

  // 게시글 삭제
  async deletePost(postIdDto: PostIdDto, userId: number) {
    const { postId } = postIdDto;

    const post = await this.prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    if (post.authorId !== userId) {
      throw new UnauthorizedException(
        'You are not authorized to delete this post',
      );
    }

    await this.prisma.post.delete({
      where: { id: postId },
    });

    return { message: 'Post deleted successfully' };
  }

  // 게시글 수정
  async updatePost(
    postIdDto: PostIdDto,
    userId: number,
    updatePostDto: UpdatePostDto,
  ) {
    const { postId } = postIdDto;

    const post = await this.prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    if (post.authorId !== userId) {
      throw new UnauthorizedException(
        'You are not authorized to update this post',
      );
    }

    const updatedPost = await this.prisma.post.update({
      where: { id: postId },
      data: updatePostDto,
    });

    return { message: 'Post updated successfully', updatedPost };
  }
}
