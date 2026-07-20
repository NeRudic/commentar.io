import { IntersectionType } from '@nestjs/mapped-types';
import { UpdateCommentDTO } from '../../comment/dto/update-comment.dto';
import { CaptchaVerifyDTO } from '../../captcha/dto/captcha.verify.dto';

export class UpdateCommentWithUserDTO extends IntersectionType(
  UpdateCommentDTO,
  CaptchaVerifyDTO,
) {}
