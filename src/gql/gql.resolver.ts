import { Resolver, Query, Args } from '@nestjs/graphql';
import {
  Gene,
  GeneInput,
  GeneInteractionOutput,
  InteractionInput,
} from '@/gql/gql.schema';
import { Neo4jService } from '@/neo4j/neo4j.service';
import { QueryResult } from 'neo4j-driver';
import { Logger } from '@nestjs/common';

@Resolver('gql')
export class GqlResolver {
  constructor(private readonly neo4jService: Neo4jService) {}

  private logger = new Logger(GqlResolver.name);

  @Query(() => String)
  async sayHello(): Promise<string> {
    return 'Hello World!';
  }

  @Query(() => [Gene])
  async getGenes(@Args('input') input: GeneInput): Promise<Gene[]> {
    const session = this.neo4jService.getSession();
    const { geneIDs } = input;
    const query = `
      WITH $geneIDs AS geneIDs
      MATCH (g:Gene)
      WHERE g.ID IN geneIDs OR g.\`Gene name\` IN geneIDs
      RETURN g
    `;
    const result: QueryResult<any> = await session.run(query, { geneIDs });
    const genes = result.records.map((record) => record.get('g').properties);
    return genes;
  }

  @Query(() => [GeneInteractionOutput])
  async getGeneInteractions(
    @Args('input') input: InteractionInput,
  ): Promise<GeneInteractionOutput[]> {
    const session = this.neo4jService.getSession();
    const { geneIDs, minScore } = input;
    const query = `
    WITH $geneIDs AS geneIDs
    MATCH (g:Gene)-[r:GENE_GENE_CONNECTION]->(neighbour:Gene)
    WHERE g.ID IN geneIDs OR g.\`Gene name\` IN geneIDs AND r.score >= $minScore
    RETURN 
      g AS gene,
      COLLECT({ gene: neighbour, score: r.score }) AS neighbour
    `;
    const result: QueryResult<any> = await session.run(query, {
      geneIDs,
      minScore,
    });

    return result.records.map((record) => ({
      gene: record.get('gene').properties,
      neighbour: record.get('neighbour').map((neighbour) => {
        return {
          gene: neighbour.gene.properties,
          score: neighbour.score,
        };
      }),
    }));
  }
}
