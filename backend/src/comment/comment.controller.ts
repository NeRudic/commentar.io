import { Body, Controller, Get, Param, ParseIntPipe, Post, Query } from "@nestjs/common";
import { CommentService } from "./comment.service";
import { CreateCommentDto } from "./dto/create-comment.dto";
import { CommentQueryDto } from "./dto/comment-query.dto";

@Controller("comments")
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Post()
  async create(@Body() dto: CreateCommentDto) {
    return this.commentService.create(dto);
  }

  @Get()
  async findRoots(@Query() query: CommentQueryDto) {
    return this.commentService.findRoots(query.page!);
  }

  @Get(":id/replies")
  async findReplies(@Param("id", ParseIntPipe) id: number) {
    return this.commentService.findReplies(id);
  }
}
