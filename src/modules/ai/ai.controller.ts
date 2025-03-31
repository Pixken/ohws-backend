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
      
      stream.data.on('data', (chunk: Buffer) => {
        const lines = chunk.toString().split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') {
              response.write('data: [DONE]\n\n');
              return;
            }
            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices[0].delta.content;
              if (content) {
                // 将换行符转换为特殊标记
                const encodedContent = content.replace(/\n/g, '\\n');
                response.write(`data: ${encodedContent}\n\n`);
              }
            } catch (e) {
              console.error('Error parsing chunk:', e);
            }
          }
        }
      });

      stream.data.on('end', () => {
        response.end();
      });
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
}
