import {
  Inject,
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { Driver, Session, SessionMode } from 'neo4j-driver';
import { Neo4jConfig } from '@/interfaces/neo4j-config.interface';
import { NEO4J_CONFIG, NEO4J_DRIVER } from './neo4j.constants';

@Injectable()
export class Neo4jService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(Neo4jService.name);

  constructor(
    @Inject(NEO4J_CONFIG) private readonly config: Neo4jConfig,
    @Inject(NEO4J_DRIVER) private readonly driver: Driver,
  ) {}

  async onModuleInit() {
    await this.driver.getServerInfo();
    this.logger.log('Connected to Neo4j');
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
