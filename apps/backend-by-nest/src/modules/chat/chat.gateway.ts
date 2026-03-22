import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { ChatService } from './chat.service';
import { MessageDto } from './dto/message.dto';
import { Server, Socket } from 'socket.io';
import { UsePipes, ValidationPipe } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: (origin, callback) => {
      const allowedOrigins = [
        process.env.CORS_ORIGIN,
        process.env.CORS_ORIGIN_1,
        process.env.CORS_ORIGIN_2,
        process.env.CORS_ORIGIN_3,
      ];
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  },
})
@UsePipes(
  new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
  }),
)
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private users: Record<string, string> = {};

  private onLineMap = new Map<string, string[]>();

  constructor(private readonly chatService: ChatService) {}

  handleConnection(client: Socket) {
    console.log(`连接：${client.id}`);
  }

  handleDisconnect(client: Socket) {
    for (const username in this.users) {
      if (this.users[username] === client.id) {
        delete this.users[username];

        for (const [key, arr] of this.onLineMap) {
          this.onLineMap.set(
            key,
            arr.filter((item) => item !== username),
          );
        }

        console.log(`${username} 断开连接`);
        break;
      }
    }

    for (const username in this.users) {
      this.server
        .to(this.users[username]!)
        .emit('receiveOnlineList', this.onLineMap.get(username));
    }
  }

  @SubscribeMessage('login')
  async login(
    @ConnectedSocket() client: Socket,
    @MessageBody() username: string,
  ) {
    this.users[username] = client.id;
    const res = await this.chatService.findUserFriendIds(username);

    const friendArr = res.map((item: { followId: string }) => item.followId);
    const onLineList = Object.keys(this.users);

    const set = new Set(onLineList);
    const onLineUserFriendList = friendArr.filter((item) => set.has(item));
    this.onLineMap.set(username, onLineUserFriendList);

    for (const _u in this.users) {
      if (this.users[_u] === client.id) {
        this.server
          .to(this.users[_u])
          .emit('receiveOnlineList', this.onLineMap.get(_u));
      } else {
        const arr = this.onLineMap.get(_u)!;
        arr.push(username);
        this.onLineMap.set(_u, arr);
        this.server
          .to(this.users[_u]!)
          .emit('receiveOnlineList', this.onLineMap.get(_u));
      }
    }
    console.log(`${username} 登录，绑定到 ${client.id}`);
  }

  @SubscribeMessage('sendMessage')
  async sendMessage(@MessageBody() dto: MessageDto) {
    const { from, to, message, isShare } = dto;

    await this.chatService.saveMessage(from, to, message, isShare);

    const toSocketId = this.users[to];
    if (toSocketId) {
      this.server
        .to(toSocketId)
        .emit('receiveMessage', { from, message, isShare });
    }
  }
}
