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
  ): Promise<GeneInteractionOutput> {
    const session = this.neo4jService.getSession();
    const { geneIDs, minScore } = input;
    const query = `
    WITH $geneIDs AS geneIDs, $minScore AS minScore
    MATCH (g1:Gene)-[r:GENE_GENE_CONNECTION]->(g2:Gene)
    WHERE (g1.ID IN geneIDs OR g1.Gene_name IN geneIDs)
      AND r.score >= minScore
    WITH DISTINCT g1, g2, r
    WITH apoc.coll.union(COLLECT(g1), COLLECT(g2)) AS genes, COLLECT({gene1: g1, gene2: g2, score: r.score}) AS connections
    RETURN {
      genes: genes,
      links: [conn IN connections | {
        gene1: {ID: conn.gene1.ID, index: apoc.coll.indexOf(genes, conn.gene1)},
        gene2: {ID: conn.gene2.ID, index: apoc.coll.indexOf(genes, conn.gene2)},
        score: conn.score
      }]
    } AS result
    `;
    const result: QueryResult<any> = await session.run(query, {
      geneIDs,
      minScore,
    });
    return {
      genes: result.records[0].get('result').genes.map((gene) => gene.properties),
      links: result.records[0].get('result').links.map((link) => ({
        gene1: {
          ID: link.gene1.ID,
          index: link.gene1.index.low,
        },
        gene2: {
          ID: link.gene2.ID,
          index: link.gene2.index.low,
        },
        score: link.score,
      })),
    };
  }
}
