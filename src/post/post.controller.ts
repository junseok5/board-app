import { 
  Controller, 
  Post, 
  Body, 
  Request, 
  UseGuards, 
  Get, 
  Param, 
  Delete, 
  Patch, 
  ParseIntPipe 
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PostService } from './post.service';
import { CreatePostDto } from './dto/create-post.dto';
import { PostIdDto } from './dto/post-id.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('posts')
@ApiBearerAuth('access-token')
@Controller('posts')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async createPost(@Body() createPostDto: CreatePostDto, @Request() req: any) {
    const userId = req.user.userId;
    return this.postService.createPost(createPostDto, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async getPosts(@Request() req: any) {
    const userId = req.user.userId;
    return this.postService.getPosts(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':postId')
  async getPostById(
    @Param('postId', ParseIntPipe) postId: number, // ParseIntPipe 추가
    @Request() req: any,
  ) {
    const userId = req.user.userId;
    return this.postService.getPostById({ postId }, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':postId')
  async deletePost(
    @Param('postId', ParseIntPipe) postId: number, // ParseIntPipe 추가
    @Request() req: any,
  ) {
    const userId = req.user.userId;
    return this.postService.deletePost({ postId }, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':postId')
  async updatePost(
    @Param('postId', ParseIntPipe) postId: number, // ParseIntPipe 추가
    @Body() updatePostDto: UpdatePostDto,
    @Request() req: any,
  ) {
    const userId = req.user.userId;
    return this.postService.updatePost({ postId }, userId, updatePostDto);
  }
}
