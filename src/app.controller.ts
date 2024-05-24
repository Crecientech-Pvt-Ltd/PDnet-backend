import { Controller, Get } from '@nestjs/common';
import { AppService } from '@/app.service';
import { Neo4jService } from '@/neo4j/neo4j.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly neo4jService: Neo4jService,
  ) {}

  @Get('count-nodes')
  async getCount(): Promise<any> {
    const session = this.neo4jService.getSession();
    const res = await session.run(`MATCH (n) RETURN count(n) AS count`);
    return `There are ${res.records[0].get('count')} nodes in the database`;
  }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}