import { Controller, Post, Body, Res } from '@nestjs/common';
import { AiService } from './ai.service';
import { AiV2Service } from './aiv2.service';
import { Public } from 'src/common/decorator/custom.decorator';
import { Response } from 'express';

@Public()
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService, private readonly aiV2Service: AiV2Service) { }

  @Post('chat')
  async chat(@Res() response: Response, @Body() body: { message: string, userId: string, time: string }) {
    try {
      console.log(body, 'body');
      
      const stream = await this.aiService.ask(body.message, body.userId, body.time, true);

      response.setHeader('Content-Type', 'text/event-stream');
      response.setHeader('Cache-Control', 'no-cache');
      response.setHeader('Connection', 'keep-alive');
      console.log(stream, 'stream12908309128310983290');
      
      if (typeof stream === 'string') {
        response.write(`data: ${JSON.stringify({ content: stream })}\n\n`);
        response.end();
        return;
      }
      
      for await (const chunk of stream) {
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

  @Post('chat-v2')
  async chatV2(@Res() response: Response, @Body() body: { message: string, userId: string, time: string }) {
    try {
      const stream = await this.aiV2Service.chat(body.message, body.userId);

      response.setHeader('Content-Type', 'text/event-stream');
      response.setHeader('Cache-Control', 'no-cache');
      response.setHeader('Connection', 'keep-alive');
      console.log(stream, 'stream12908309128310983290');
      
      if (typeof stream === 'string') {
        response.write(`data: ${JSON.stringify({ content: stream })}\n\n`);
        response.end();
        return;
      }
      
      for await (const chunk of stream) {
        response.write(`data: ${JSON.stringify(chunk)}\n\n`);
      }
      
      response.end();
    } catch (error) {
      console.error('Error in chat:', error);
      response.status(500).send('Internal Server Error');
    }
  }
}
