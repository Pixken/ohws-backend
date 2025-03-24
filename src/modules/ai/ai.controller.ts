import { Controller, Post, Body } from '@nestjs/common';
import { AiService } from './ai.service';
import { Public } from 'src/common/decorator/custom.decorator';

@Public()
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('chat')
  async chat(@Body() body: { message: string, userId: string, time: string }) {
    return this.aiService.ask(body.message, body.userId, body.time);
    // return this.aiService.ioo(body.message);
  }
}
