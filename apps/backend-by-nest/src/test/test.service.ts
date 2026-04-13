import { Injectable, OnApplicationShutdown } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class TestService implements OnApplicationShutdown {
  constructor(private readonly dataSource: DataSource) {}

  async onApplicationShutdown() {
    console.log('清理数据库...');

    await this.dataSource.query('SET FOREIGN_KEY_CHECKS = 0');

    for (const entity of this.dataSource.entityMetadatas) {
      const repo = this.dataSource.getRepository(entity.name);
      await repo.clear();
    }

    await this.dataSource.query('SET FOREIGN_KEY_CHECKS = 1');

    console.log('清理完成');
  }
}
