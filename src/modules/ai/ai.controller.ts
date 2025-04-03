import { Controller, Post, Body, Res } from '@nestjs/common';
import { AiService } from './ai.service';
import { Public } from 'src/common/decorator/custom.decorator';
import { Response } from 'express';

@Public()
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) { }

  @Post('chat')
  async chat(@Res() response: Response, @Body() body: { message: string, userId: string, time: string }) {
    try {
      console.log(body, 'body');
      
      const stream = await this.aiService.ask(body.message, body.userId, body.time, true);

      response.setHeader('Content-Type', 'text/event-stream');
      response.setHeader('Cache-Control', 'no-cache');
      response.setHeader('Connection', 'keep-alive');
      console.log(stream, 'stream12908309128310983290');
      
      for await (const chunk of stream.iterator()) {
        response.write(`data: ${JSON.stringify(chunk)}\n\n`);
      }
      
      response.end();
    } catch (error) {
      console.error('Error in chat:', error);
      response.status(500).send('Internal Server Error');
    }



    // return this.aiService.ioo(body.message);
    // return this.aiService.generatePrismaQuery(body.message);
  }

  @Post('generateCash')
  async generateCash(@Body() body: { message: string }) {
    return this.aiService.generateCash(body.message);
  }

  @Post('getIcon')
  async getIcon(@Body() body: { message: string }) {
    return this.aiService.getIcon(body.message);
  }
}
