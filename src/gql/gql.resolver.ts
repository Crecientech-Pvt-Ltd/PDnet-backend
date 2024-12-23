import { Resolver, Query, Args, Context, Info, Int } from '@nestjs/graphql';
import { HttpException, HttpStatus, Logger } from '@nestjs/common';
import { GqlService } from './gql.service';
import { RedisService } from '@/redis/redis.service';
import { isUUID } from 'class-validator';
import { ConfigService } from '@nestjs/config';
import {
  DataRequired,
  Gene,
  GeneInteractionOutput,
  Header,
  InteractionInput,
} from './models';
import type { FieldNode, GraphQLResolveInfo } from 'graphql';

@Resolver('gql')
export class GqlResolver {
  constructor(
    private readonly gqlService: GqlService,
    private readonly redisService: RedisService,
    private readonly configService: ConfigService,
  ) {}

  private logger = new Logger(GqlResolver.name);

  @Query(() => String)
  async getUserID(
    @Context('req') { headers }: { headers: Record<string, string> },
  ): Promise<string> {
    const header = headers['x-user-id'] || crypto.randomUUID();
    await this.redisService.redisClient.set(
      `user:${header}`,
      '',
      'EX',
      this.configService.get<number>('REDIS_USER_EXPIRY', 7200),
    );
    return header;
  }

  @Query(() => [Gene])
  async getGenes(
    @Args('geneIDs', { type: () => [String] }) geneIDs: string[],
    @Args('config', { type: () => [DataRequired], nullable: true })
    config: Array<DataRequired> | undefined,
    @Info() info: GraphQLResolveInfo,
  ): Promise<Gene[]> {
    const bringMeta = info.fieldNodes[0].selectionSet.selections.some(
      (selection: FieldNode) =>
        !['ID', 'common', 'disease'].includes(selection?.name.value),
    );
    const genes = this.gqlService.getGenes(geneIDs, config, bringMeta);
    return config ? this.gqlService.filterGenes(genes, config) : genes;
  }

  @Query(() => Header)
  async getHeaders(
    @Args('disease', { type: () => String, nullable: true }) disease?: string,
  ) {
    return this.gqlService.getHeaders(disease);
  }

  @Query(() => GeneInteractionOutput)
  async getGeneInteractions(
    @Args('input', { type: () => InteractionInput }) input: InteractionInput,
    @Args('order', { type: () => Int }) order: number,
    @Context('req') { headers }: { headers: Record<string, string> },
  ): Promise<GeneInteractionOutput> {
    const header = headers['x-user-id'];
    if (!isUUID(header))
      throw new HttpException(
        'Correct user ID not found',
        HttpStatus.UNAUTHORIZED,
      );
    const graphName =
      input.graphName ??
      this.gqlService.computeHash(
        JSON.stringify({
          ...input,
          geneIDs: input.geneIDs.sort(),
          order,
        }),
      );
    const result = await this.gqlService.getGeneInteractions(
      input,
      order,
      graphName,
      header,
    );
    this.logger.log(
      `Genes: ${result.genes.length}, Links: ${result.links.length}`,
    );
    const indexMap = result.genes.reduce(
      (acc, gene, index) => {
        acc[gene.ID] = index;
        return acc;
      },
      {} as Record<string, number>,
    );
    return {
      genes: result.genes,
      links: result.links.map((link) => ({
        gene1: {
          ID: link.gene1,
          index: indexMap[link.gene1],
        },
        gene2: {
          ID: link.gene2,
          index: indexMap[link.gene2],
        },
        score: link.score,
      })),
      graphName,
    };
  }
}
