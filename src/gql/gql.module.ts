import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { GqlResolver } from './gql.resolver';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver } from '@nestjs/apollo';
import { join } from 'path';
import { MorganMiddleware } from '@/morgan/morgan.middleware';

@Module({
  imports: [
    GraphQLModule.forRootAsync({
      driver: ApolloDriver,
      useFactory: async () => ({
        sortSchema: true,
        path: '/graphql',
        typePaths: ['./**/*.graphql'],
        playground: true,
        definitions: {
          path: join(process.cwd(), 'src/gql/gql.schema.ts'),
          outputAs: 'class' as const,
          enumsAsTypes: true,
        },
      }),
    }),
  ],
  providers: [GqlResolver],
})
export class GqlModule implements NestModule{
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(MorganMiddleware).forRoutes('/graphql');
  }
}
