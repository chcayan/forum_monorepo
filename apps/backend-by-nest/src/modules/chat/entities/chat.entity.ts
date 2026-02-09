import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('messages')
export class Chat {
  @PrimaryGeneratedColumn()
  msgId!: number;

  @Column()
  sender!: string;

  @Column()
  receiver!: string;

  @Column()
  content!: string;

  @Column()
  createdAt!: Date;

  @Column()
  isRead!: number;

  @Column()
  isShare!: string;
}
