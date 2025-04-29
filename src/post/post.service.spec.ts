import { Test, TestingModule } from '@nestjs/testing';
import { PostService } from './post.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { create } from 'domain';

describe('PostService', () => {
  let postService: PostService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostService,
        {
          provide: PrismaService,
          useValue: {
            post: {
              create: jest.fn(),
              findMany: jest.fn(),
              findUnique: jest.fn(),
              delete: jest.fn(),
              update: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    postService = module.get<PostService>(PostService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  describe('createPost', () => {
    it('should create a post and return it', async () => {
      const mockUserId = 1;
      const mockCreatePostDto = { title: 'Test Post', content: 'Test Content' };
      const mockPost = {
        id: 1,
        title: 'Test Post',
        content: 'Test Content',
        authorId: mockUserId,
        createdAt: new Date(),
      };

      jest.spyOn(prismaService.post, 'create').mockResolvedValueOnce(mockPost);

      const result = await postService.createPost(
        mockCreatePostDto,
        mockUserId,
      );

      expect(result).toEqual({
        message: 'Post created successfully',
        post: mockPost,
      });
      expect(prismaService.post.create).toHaveBeenCalledWith({
        data: { ...mockCreatePostDto, authorId: mockUserId },
      });
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
        },
        {
          id: 2,
          title: 'Post 2',
          content: 'Content 2',
          authorId: mockUserId,
          createdAt: new Date(),
        },
      ];

      jest
        .spyOn(prismaService.post, 'findMany')
        .mockResolvedValueOnce(mockPosts);

      const result = await postService.getPosts(mockUserId);

      expect(result).toEqual(mockPosts);
      expect(prismaService.post.findMany).toHaveBeenCalledWith({
        where: { authorId: mockUserId },
        include: { author: true },
      });
    });
  });

  describe('getPostById', () => {
    it('should return a post if it exists and belongs to the user', async () => {
      const mockUserId = 1;
      const mockPostId = 1;
      const mockPost = {
        id: mockPostId,
        title: 'Post 1',
        content: 'Content 1',
        authorId: mockUserId,
        createdAt: new Date(),
      };

      jest
        .spyOn(prismaService.post, 'findUnique')
        .mockResolvedValueOnce(mockPost);

      const result = await postService.getPostById(
        { postId: mockPostId },
        mockUserId,
      );

      expect(result).toEqual(mockPost);
      expect(prismaService.post.findUnique).toHaveBeenCalledWith({
        where: { id: mockPostId },
        include: { author: true },
      });
    });

    it('should throw NotFoundException if the post does not exist', async () => {
      jest.spyOn(prismaService.post, 'findUnique').mockResolvedValueOnce(null);

      await expect(postService.getPostById({ postId: 1 }, 1)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw UnauthorizedException if the post does not belong to the user', async () => {
      const mockPost = {
        id: 1,
        title: 'Post 1',
        content: 'Content 1',
        authorId: 2,
        createdAt: new Date(),
      };

      jest
        .spyOn(prismaService.post, 'findUnique')
        .mockResolvedValueOnce(mockPost);

      await expect(postService.getPostById({ postId: 1 }, 1)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('deletePost', () => {
    it('should delete a post if it exists and belongs to the user', async () => {
      const mockUserId = 1;
      const mockPostId = 1;

      const mockPost = {
        id: mockPostId,
        title: 'Test Post',
        content: 'Test Content',
        authorId: mockUserId,
        createdAt: new Date(),
      };

      jest
        .spyOn(prismaService.post, 'findUnique')
        .mockResolvedValueOnce(mockPost);
      jest.spyOn(prismaService.post, 'delete').mockResolvedValueOnce(mockPost);

      const result = await postService.deletePost(
        { postId: mockPostId },
        mockUserId,
      );

      expect(result).toEqual({ message: 'Post deleted successfully' });
      expect(prismaService.post.delete).toHaveBeenCalledWith({
        where: { id: mockPostId },
      });
    });

    it('should throw NotFoundException if the post does not exist', async () => {
      jest.spyOn(prismaService.post, 'findUnique').mockResolvedValueOnce(null);

      await expect(postService.deletePost({ postId: 1 }, 1)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw UnauthorizedException if the post does not belong to the user', async () => {
      const mockPost = {
        id: 1,
        title: 'Test Post',
        content: 'Test Content',
        authorId: 2,
        createdAt: new Date(),
      };

      jest
        .spyOn(prismaService.post, 'findUnique')
        .mockResolvedValueOnce(mockPost);

      await expect(postService.deletePost({ postId: 1 }, 1)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('updatePost', () => {
    it('should update a post if it exists and belongs to the user', async () => {
      const mockUserId = 1;
      const mockPostId = 1;
      const mockUpdatePostDto = {
        title: 'Updated Title',
        content: 'Updated Content',
      };
      const mockUpdatedPost = {
        id: mockPostId,
        ...mockUpdatePostDto,
        authorId: mockUserId,
        createdAt: new Date(),
      };

      jest.spyOn(prismaService.post, 'findUnique').mockResolvedValueOnce({
        id: mockPostId,
        title: 'Title',
        content: 'Content',
        authorId: mockUserId,
        createdAt: new Date(),
      });
      jest
        .spyOn(prismaService.post, 'update')
        .mockResolvedValueOnce(mockUpdatedPost);

      const result = await postService.updatePost(
        { postId: mockPostId },
        mockUserId,
        mockUpdatePostDto,
      );

      expect(result).toEqual({
        message: 'Post updated successfully',
        updatedPost: mockUpdatedPost,
      });
      expect(prismaService.post.update).toHaveBeenCalledWith({
        where: { id: mockPostId },
        data: mockUpdatePostDto,
      });
    });

    it('should throw NotFoundException if the post does not exist', async () => {
      jest.spyOn(prismaService.post, 'findUnique').mockResolvedValueOnce(null);

      await expect(
        postService.updatePost({ postId: 1 }, 1, {}),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw UnauthorizedException if the post does not belong to the user', async () => {
      const mockPost = {
        id: 1,
        title: 'Title',
        content: 'Content',
        authorId: 2,
        createdAt: new Date(),
      };

      jest
        .spyOn(prismaService.post, 'findUnique')
        .mockResolvedValueOnce(mockPost);

      await expect(
        postService.updatePost({ postId: 1 }, 1, {}),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
