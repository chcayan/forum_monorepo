import { MsgType } from '@forum-monorepo/types';
import { Injectable } from '@nestjs/common';
import { Subject } from 'rxjs';

@Injectable()
export class SseService {
  private clients = new Map<string, Subject<any>>();

  connect(userId: string) {
    const subject = new Subject();
    this.clients.set(userId, subject);
    return subject.asObservable();
  }

  sendMsgToUser(userId: string, data: MsgType) {
    const client = this.clients.get(userId);
    if (client) {
      client.next({ data });
    }
  }
}
