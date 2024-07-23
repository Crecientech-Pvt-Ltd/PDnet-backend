import {
  Inject,
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
  VersioningOptions
} from '@nestjs/common';
import type { Driver, Session, SessionMode } from 'neo4j-driver';
import type { Neo4jConfig } from '@/interfaces';
import { NEO4J_CONFIG, NEO4J_DRIVER } from './neo4j.constants';

@Injectable()
export class Neo4jService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(Neo4jService.name);

  constructor(
    @Inject(NEO4J_CONFIG) private readonly config: Neo4jConfig,
    @Inject(NEO4J_DRIVER) private readonly driver: Driver,
  ) {}

  async onModuleInit() {
    try {
      await this.driver.getServerInfo();
      this.logger.log('Connected to Neo4j');
    } catch (error) {
      this.logger.error('Database not connected');
    }
  }

  async onModuleDestroy() {
    await this.driver.close();
  }

  getSession(mode: SessionMode = 'READ'): Session {
    return this.driver.session({
      database: this.config.database,
      defaultAccessMode: mode,
    });
  }
}
