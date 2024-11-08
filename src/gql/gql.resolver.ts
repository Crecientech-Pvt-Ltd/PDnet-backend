import { Resolver, Query, Args, Info } from '@nestjs/graphql';
import {
  Gene,
  GeneBase,
  GeneInput,
  GeneInteractionOutput,
  InteractionInput,
} from './gql.schema';
import { Logger } from '@nestjs/common';
import { DiseaseNames } from '@/decorators';
import { GqlService } from './gql.service';
import type { GraphQLResolveInfo } from 'graphql';

@Resolver('gql')
export class GqlResolver {
  constructor(private readonly gqlService: GqlService) {}

  private logger = new Logger(GqlResolver.name);

  @Query(() => String)
  async sayHello(): Promise<string> {
    return 'Hello World!';
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
    @Info() info: GraphQLResolveInfo,
    @DiseaseNames({ depth: 1, fieldName: 'genes' })
    diseaseNamesInfo: [Array<string>, boolean],
  ): Promise<GeneInteractionOutput> {
    const graphName =
      input.graphName ??
      this.gqlService.computeHash(
        JSON.stringify({
          ...info.variableValues,
          geneIDs: input.geneIDs.sort(),
        }),
      );
    const result = await this.gqlService.getGeneInteractions(
      input,
      order,
      graphName,
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
