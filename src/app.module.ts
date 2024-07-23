import { Module } from '@nestjs/common';
import { AppController } from '@/app.controller';
import { Neo4jModule } from '@/neo4j/neo4j.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GqlModule } from '@/gql/gql.module';
import { Neo4jScheme } from './interfaces/neo4j-config.interface';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath:
        process.env.NODE_ENV !== 'development' ? '.env.local' : '.env',
    }),
    Neo4jModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        scheme: configService.get<Neo4jScheme>('NEO4J_SCHEME'),
        host: configService.get<string>('NEO4J_HOST'),
        port: configService.get<number>('NEO4J_PORT'),
        username: configService.get<string>('NEO4J_USERNAME'),
        password: configService.get<string>('NEO4J_PASSWORD'),
        database: configService.get<string>('NEO4J_DATABASE'),
      }),
      inject: [ConfigService],
    }),
    GqlModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
