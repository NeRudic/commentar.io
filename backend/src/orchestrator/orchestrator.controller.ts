import {
  Body,
  Controller,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { OrchestratorService } from './orchestrator.service';
import { CreateCommentWithUserDTO } from './dto/create-comment-with-user.dto';
import { UpdateCommentWithUserDTO } from './dto/update-comment-with-user.dto';

@Controller('comment-and-user')
export class OrchestratorController {
  constructor(private readonly orchestrator: OrchestratorService) {}

  @Post()
  async create(@Body() dto: CreateCommentWithUserDTO) {
    return this.orchestrator.createCommentWithUser(dto);
  }

  @Patch(':comment_id')
  async update(
    @Param('comment_id', ParseIntPipe) comment_id: number,
    @Body() dto: UpdateCommentWithUserDTO,
  ) {
    return this.orchestrator.updateCommentWithUser(comment_id, dto);
  }
}
