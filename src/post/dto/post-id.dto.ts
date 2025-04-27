import { IsInt, IsPositive } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PostIdDto {
  @ApiProperty({ description: 'The ID of the post', example: 1 })
  @IsInt()
  @IsPositive()
  postId: number;
}
