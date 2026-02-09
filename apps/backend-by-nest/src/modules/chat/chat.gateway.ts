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

@WebSocketGateway()
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

  constructor(private readonly chatService: ChatService) {}

  handleConnection(client: Socket) {
    console.log(`连接：${client.id}`);
  }

  handleDisconnect(client: Socket) {
    for (const username in this.users) {
      if (this.users[username] === client.id) {
        delete this.users[username];
        console.log(`${username} 断开连接`);
        break;
      }
    }
  }

  @SubscribeMessage('login')
  login(@ConnectedSocket() client: Socket, @MessageBody() username: string) {
    this.users[username] = client.id;
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
