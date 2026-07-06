import { Body, Controller, Post } from '@nestjs/common';
import { OrchestratorService } from './orchestrator.service';
import { CreateCommentWithUserDTO } from './dto/create-comment-with-user.dto';

@Controller('comment-and-user')
export class OrchestratorController {
  constructor(private readonly orchestrator: OrchestratorService) {}

  @Post()
  async create(@Body() dto: CreateCommentWithUserDTO) {
    return this.orchestrator.createCommentWithUser(dto);
  }
}
