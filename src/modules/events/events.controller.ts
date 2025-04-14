import { Controller, Get, Res, Sse } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import  {Response} from 'express'
import { Observable } from "rxjs";

@Controller()
export class EventsController {
  constructor (private eventEmitter: EventEmitter2) {}

  @Get('sse')
  @Sse()
  sse(@Res() response: Response) {
    // 保持连接不自动关闭
    response.setHeader('Connection', 'keep-alive');
    response.setHeader('Cache-Control', 'no-cache');
    response.setHeader('Content-Type', 'text/event-stream');

    // 返回 Observable 流
    return new Observable<MessageEvent>(subscriber => {
      // 监听自定义事件
      const handler = (data: any) => {
        subscriber.next({ data } as MessageEvent);
      };
      this.eventEmitter.on('sse.event', handler);
      // 清理函数
      return () => {
        this.eventEmitter.off('sse.event', handler);
      };
    });

  }
}