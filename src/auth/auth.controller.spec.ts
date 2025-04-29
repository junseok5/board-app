import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import {
  ConflictException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            signup: jest.fn(),
            login: jest.fn(),
          },
        },
      ],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  describe('signup', () => {
    it('should sign up a user and return an access token', async () => {
      const mockSignupDto: SignupDto = {
        email: 'test@example.com',
        password: 'password123',
      };
      const mockResponse = { access_token: 'mocked-jwt-token' };

      jest.spyOn(authService, 'signup').mockResolvedValueOnce(mockResponse);

      const result = await authController.signup(mockSignupDto);

      expect(result).toEqual(mockResponse);
      expect(authService.signup).toHaveBeenCalledWith(mockSignupDto);
    });

    it('should throw ConflictException if email already exists', async () => {
      const mockSignupDto: SignupDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      jest
        .spyOn(authService, 'signup')
        .mockRejectedValueOnce(new ConflictException('Email already exists.'));

      await expect(authController.signup(mockSignupDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('login', () => {
    it('should log in a user and return an access token', async () => {
      const mockLoginDto: LoginDto = {
        email: 'test@example.com',
        password: 'password123',
      };
      const mockResponse = { access_token: 'mocked-jwt-token' };

      jest.spyOn(authService, 'login').mockResolvedValueOnce(mockResponse);

      const result = await authController.login(mockLoginDto);

      expect(result).toEqual(mockResponse);
      expect(authService.login).toHaveBeenCalledWith(mockLoginDto);
    });

    it('should throw NotFoundException if user does not exist', async () => {
      const mockLoginDto: LoginDto = {
        email: 'nonexistent@example.com',
        password: 'password123',
      };

      jest
        .spyOn(authService, 'login')
        .mockRejectedValueOnce(new NotFoundException('User not found.'));

      await expect(authController.login(mockLoginDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw UnauthorizedException if password is incorrect', async () => {
      const mockLoginDto: LoginDto = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      jest
        .spyOn(authService, 'login')
        .mockRejectedValueOnce(
          new UnauthorizedException('Invalid credentials.'),
        );

      await expect(authController.login(mockLoginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
