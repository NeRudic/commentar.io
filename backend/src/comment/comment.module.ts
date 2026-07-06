import { Module } from '@nestjs/common';
import { CommentController } from './comment.controller';
import { CommentService } from './comment.service';
import { DBModule } from '../db/db.module';

@Module({
  controllers: [CommentController],
  providers: [CommentService],
  imports: [DBModule],
})
export class CommentModule {}
