import { Resolver, Query, Args, Context } from '@nestjs/graphql';
import {
  Gene,
  GeneBase,
  GeneInput,
  GeneInteractionOutput,
  InteractionInput,
} from './gql.schema';
import { HttpException, HttpStatus, Logger } from '@nestjs/common';
import { DiseaseNames } from '@/decorators';
import { GqlService } from './gql.service';
import { RedisService } from '@/redis/redis.service';
import { isUUID } from 'class-validator';
import { ConfigService } from '@nestjs/config';

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
    @Args('input') input: GeneInput,
    @DiseaseNames() diseaseNamesInfo: [Array<string>, boolean],
  ): Promise<Gene[]> {
    const bringTotalData =
      diseaseNamesInfo[0].length > 0 || diseaseNamesInfo[1];
    const genes = await this.gqlService.getGenes(input.geneIDs, bringTotalData);
    return bringTotalData
      ? this.gqlService.filterGenesByDisease(genes, diseaseNamesInfo[0])
      : (genes as GeneBase[]);
  }

  @Query(() => [GeneInteractionOutput])
  async getGeneInteractions(
    @Args('input') input: InteractionInput,
    @Args('order') order: number,
    @DiseaseNames() diseaseNamesInfo: [Array<string>, boolean],
    @Context('req') { headers }: { headers: Record<string, string> },
  ): Promise<GeneInteractionOutput> {
    const header = headers['x-user-id'];
    if (!isUUID(header)) throw new HttpException('Correct user ID not found', HttpStatus.UNAUTHORIZED);
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
      genes: await this.gqlService.filterGenesByDisease(
        result.genes,
        diseaseNamesInfo[0],
      ),
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
