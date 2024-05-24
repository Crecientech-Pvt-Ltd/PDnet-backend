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

  @Query(() => GeneInteractionOutput)
  async getGeneInteractions(
    @Args('input') input: InteractionInput,
  ): Promise<GeneInteractionOutput> {
    const session = this.neo4jService.getSession();
    const { geneIDs, minScore } = input;
    const query = `
    WITH $geneIDs AS geneIDs
    MATCH (g:Gene)
    WHERE g.ID IN geneIDs OR g.\`Gene name\` IN geneIDs
    WITH COLLECT(g) AS genes,geneIDs
    UNWIND RANGE(0, SIZE(genes)-1) AS i
    WITH genes[i] AS g1, genes,geneIDs, i AS \`index\`
    MATCH (g1:Gene)-[r:GENE_GENE_CONNECTION]->(g2:Gene)
    WHERE (g2.ID IN geneIDs OR g2.\`Gene name\` IN geneIDs) AND r.score >= $minScore
    WITH genes, g1, \`index\`, COLLECT({ interactingGeneID: g2.ID, index: apoc.coll.indexOf(genes, g2), score: r.score }) AS neighbours
    RETURN genes, COLLECT({ geneID: g1.ID, index: \`index\`, neighbours: neighbours }) AS interactions
    `;
    const result: QueryResult<any> = await session.run(query, {
      geneIDs,
      minScore,
    });

    this.logger.log(
      result.records[0]
        .get('interactions')
        .reduce((acc, curr) => acc + curr.neighbours.length, 0),
    );

    return {
      genes: result.records[0].get('genes').map((gene) => gene.properties),
      interactions: result.records[0].get('interactions').map((interaction) => {
        return {
          geneID: interaction.geneID,
          index: interaction.index.low,
          neighbour: interaction.neighbours.map((neighbour) => {
            return {
              geneID: neighbour.interactingGeneID,
              score: neighbour.score,
              index: neighbour.index.low,
            };
          }),
        };
      }),
    };
  }
}

// WITH $geneIDs AS geneIDs, $minScore AS minScore
// MATCH (g:Gene)
// WHERE g.ID IN geneIDs OR g.`Gene name` IN geneIDs
// WITH COLLECT(g) AS genes
// UNWIND RANGE(0, SIZE(genes)-1) AS i
// WITH genes[i] AS g1, i AS index1, genes
// OPTIONAL MATCH (g1)-[r:GENE_GENE_CONNECTION]->(g2:Gene)
// WHERE g2.ID IN geneIDs AND r.score >= minScore
// WITH genes, g1, index1, COLLECT({ interactingGeneID: g2.ID, score: r.score }) AS neighbours
// RETURN genes, COLLECT({ geneID: g1.ID, index: index1, neighbours: neighbours }) AS interactions
