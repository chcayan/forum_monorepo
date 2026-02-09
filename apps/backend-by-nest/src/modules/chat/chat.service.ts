import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Chat } from './entities/chat.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Chat)
    private readonly chatRepository: Repository<Chat>,
  ) {}

  async saveMessage(
    from: string,
    to: string,
    message: string,
    isShare: '0' | '1',
  ) {
    const msg = this.chatRepository.create({
      sender: from,
      receiver: to,
      content: message,
      isRead: 0,
      isShare,
    });

    await this.chatRepository.save(msg);
  }

  async findChatHistory(userId: string, followId: string) {
    return this.chatRepository
      .createQueryBuilder('m')
      .where(
        '(m.sender = :userId AND m.receiver = :followId) ' +
          'OR (m.sender = :followId AND m.receiver = :userId)',
        {
          userId,
          followId,
        },
      )
      .orderBy('m.created_at', 'ASC')
      .getRawMany();
  }

  async findChatUnRead(userId: string) {
    return this.chatRepository
      .createQueryBuilder('m')
      .select('m.sender', 'sender')
      .addSelect('COUNT(*)', 'count')
      .where('m.receiver = :userId', { userId })
      .andWhere('m.is_read = FALSE')
      .groupBy('m.sender')
      .getRawMany();
  }

  async markAsRead(userId: string, followId: string) {
    await this.chatRepository
      .createQueryBuilder()
      .update(Chat)
      .set({ isRead: 1 })
      .where('sender = :followId', { followId })
      .andWhere('receiver = :userId', { userId })
      .andWhere('is_read = false')
      .execute();
  }

  async getAiChatResult(prompt: string) {
    const url = 'https://open.bigmodel.cn/api/paas/v4/chat/completions';
    const apiKey = process.env.API_KEY;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'glm-4.5-flash',
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        thinking: {
          type: 'disabled',
        },
        temperature: 0.7,
        max_tokens: 50,
        stream: false,
      }),
    });

    if (!response.ok) {
      throw new InternalServerErrorException('AI API Error');
    }

    const data: { choices: object[] } = (await response.json()) as {
      choices: object[];
    };

    return data.choices[0];
  }
}
