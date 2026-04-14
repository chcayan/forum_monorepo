import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class TestService implements OnModuleInit {
  constructor(private readonly dataSource: DataSource) {}

  private readonly logger = new Logger(TestService.name);

  async onModuleInit() {
    await this.clearDatabase();
  }

  async clearDatabase() {
    this.logger.log('清理数据库...');

    await this.dataSource.query('SET FOREIGN_KEY_CHECKS = 0');

    for (const entity of this.dataSource.entityMetadatas) {
      const repo = this.dataSource.getRepository(entity.name);
      await repo.clear();
    }

    await this.dataSource.query('SET FOREIGN_KEY_CHECKS = 1');

    this.logger.log('清理完成');
  }
}
