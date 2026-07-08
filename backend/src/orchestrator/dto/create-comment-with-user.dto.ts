import { IntersectionType } from '@nestjs/mapped-types';
import { CreateCommentDTO } from '../../comment/dto/create-comment.dto';
import { CreateUserDTO } from '../../user/dto/create-user.dto';

export class CreateCommentWithUserDTO extends IntersectionType(
  CreateCommentDTO,
  CreateUserDTO,
) {}
