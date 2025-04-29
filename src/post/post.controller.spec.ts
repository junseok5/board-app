import { Test, TestingModule } from '@nestjs/testing';
import { PostController } from './post.controller';
import { PostService } from './post.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { create } from 'domain';

describe('PostController', () => {
  let postController: PostController;
  let postService: PostService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PostController],
      providers: [
        {
          provide: PostService,
          useValue: {
            createPost: jest.fn(),
            getPosts: jest.fn(),
            getPostById: jest.fn(),
            deletePost: jest.fn(),
            updatePost: jest.fn(),
          },
        },
      ],
    }).compile();

    postController = module.get<PostController>(PostController);
    postService = module.get<PostService>(PostService);
  });

  describe('createPost', () => {
    it('should create a post and return it', async () => {
      const mockUserId = 1;
      const mockCreatePostDto: CreatePostDto = {
        title: 'Test Post',
        content: 'Test Content',
      };
      const mockPost = {
        id: 1,
        title: 'Test Post',
        content: 'Test Content',
        authorId: mockUserId,
        createdAt: new Date(),
      };

      jest.spyOn(postService, 'createPost').mockResolvedValueOnce({
        message: 'Post created successfully',
        post: mockPost,
      });

      const result = await postController.createPost(mockCreatePostDto, {
        user: { userId: mockUserId },
      });

      expect(result).toEqual({
        message: 'Post created successfully',
        post: mockPost,
      });
      expect(postService.createPost).toHaveBeenCalledWith(
        mockCreatePostDto,
        mockUserId,
      );
    });
  });

  describe('getPosts', () => {
    it('should return a list of posts for the user', async () => {
      const mockUserId = 1;
      const mockPosts = [
        {
          id: 1,
          title: 'Post 1',
          content: 'Content 1',
          authorId: mockUserId,
          createdAt: new Date(),
          author: {
            id: mockUserId,
            createdAt: new Date(),
            email: 'user1@example.com',
            password: 'hashedPassword',
          },
        },
        {
          id: 2,
          title: 'Post 2',
          content: 'Content 2',
          authorId: mockUserId,
          createdAt: new Date(),
          author: {
            id: mockUserId,
            createdAt: new Date(),
            email: 'user1@example.com',
            password: 'hashedPassword',
          },
        },
      ];

      jest.spyOn(postService, 'getPosts').mockResolvedValueOnce(mockPosts);

      const result = await postController.getPosts({
        user: { userId: mockUserId },
      });

      expect(result).toEqual(mockPosts);
      expect(postService.getPosts).toHaveBeenCalledWith(mockUserId);
    });
  });

  describe('getPostById', () => {
    it('should return a single post by ID', async () => {
      const mockUserId = 1;
      const mockPostId = 1;
      const mockPost = {
        id: mockPostId,
        title: 'Post 1',
        content: 'Content 1',
        authorId: mockUserId,
        createdAt: new Date(),
        author: {
          id: mockUserId,
          createdAt: new Date(),
          email: 'user1@example.com',
          password: 'hashedPassword',
        },
      };

      jest.spyOn(postService, 'getPostById').mockResolvedValueOnce(mockPost);

      const result = await postController.getPostById(mockPostId, {
        user: { userId: mockUserId },
      });

      expect(result).toEqual(mockPost);
      expect(postService.getPostById).toHaveBeenCalledWith(
        { postId: mockPostId },
        mockUserId,
      );
    });
  });

  describe('deletePost', () => {
    it('should delete a post and return a success message', async () => {
      const mockUserId = 1;
      const mockPostId = 1;
      const mockResponse = { message: 'Post deleted successfully' };

      jest.spyOn(postService, 'deletePost').mockResolvedValueOnce(mockResponse);

      const result = await postController.deletePost(mockPostId, {
        user: { userId: mockUserId },
      });

      expect(result).toEqual(mockResponse);
      expect(postService.deletePost).toHaveBeenCalledWith(
        { postId: mockPostId },
        mockUserId,
      );
    });
  });

  describe('updatePost', () => {
    it('should update a post and return the updated post', async () => {
      const mockUserId = 1;
      const mockPostId = 1;
      const mockUpdatePostDto: UpdatePostDto = {
        title: 'Updated Title',
        content: 'Updated Content',
      };
      const mockUpdatedPost = {
        id: mockPostId,
        title: 'Updated Title',
        content: 'Updated Content',
        authorId: mockUserId,
        createdAt: new Date(),
      };

      jest.spyOn(postService, 'updatePost').mockResolvedValueOnce({
        message: 'Post updated successfully',
        updatedPost: mockUpdatedPost,
      });

      const result = await postController.updatePost(
        mockPostId,
        mockUpdatePostDto,
        { user: { userId: mockUserId } },
      );

      expect(result).toEqual({
        message: 'Post updated successfully',
        updatedPost: mockUpdatedPost,
      });
      expect(postService.updatePost).toHaveBeenCalledWith(
        { postId: mockPostId },
        mockUserId,
        mockUpdatePostDto,
      );
    });
  });
});
