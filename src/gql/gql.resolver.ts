import { Resolver, Query, Args } from '@nestjs/graphql';
import {
  Gene,
  GeneInput,
  GeneInteractionOutput,
  InteractionInput,
} from './gql.schema';
import { Neo4jService } from '@/neo4j/neo4j.service';
import { QueryResult } from 'neo4j-driver';
import { Logger } from '@nestjs/common';
import type { Links } from '@/interfaces/response.interface';

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
      WHERE g.ID IN geneIDs OR g.Gene_name IN geneIDs
      RETURN g
    `;
    const result: QueryResult<any> = await session.run(query, { geneIDs });
    const genes = result.records.map((record) => record.get('g').properties);
    return genes;
  }

  @Query(() => [GeneInteractionOutput])
  async getGeneInteractions(
    @Args('input') input: InteractionInput,
    @Args('order') order: number,
  ): Promise<GeneInteractionOutput> {
    const session = this.neo4jService.getSession();
    const { geneIDs, minScore } = input;
    let query: string;
    if (order === 1) {
      query = `
        WITH $geneIDs AS geneIDs
        MATCH (g1:Gene)-[r:GENE_GENE_CONNECTION]->(g2:Gene)
        WHERE (g1.ID IN geneIDs OR g1.Gene_name IN geneIDs)
        AND r.score >= $minScore
        RETURN apoc.coll.toSet(COLLECT(g1) + COLLECT(g2)) AS genes, COLLECT({gene1: g1.ID, gene2: g2.ID, score: r.score}) AS connections
      `;
    } else {
      query = `
        WITH $geneIDs AS geneIDs
        MATCH (g:Gene) WHERE (g.ID IN geneIDs OR g.Gene_name IN geneIDs)
        WITH COLLECT(g) AS genes, geneIDs
        UNWIND genes AS g1
        MATCH (g1:Gene)-[r:GENE_GENE_CONNECTION]->(g2:Gene)
        WHERE r.score >= $minScore AND (g2.ID IN geneIDs OR g2.Gene_name IN geneIDs)
        RETURN COLLECT({gene1: g1.ID, gene2: g2.ID, score: r.score}) AS connections, genes
        `;
    }
    const result: QueryResult<any> = await session.run(query, {
      geneIDs,
      minScore,
    });
    const genes: Gene[] = result.records[0].get('genes').map((gene) => gene.properties);

    const indexMap = genes.reduce((acc, gene, index) => {
      acc[gene.ID] = index;
      return acc;
    }, {});

    const connections: Links[] = result.records[0].get('connections');

    this.logger.log(
      `Found ${genes.length} genes and ${connections.length} links.`,
    );

    return {
      genes: genes,
      links: connections.map((link) => ({
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
    };
  }
}
