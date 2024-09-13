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
import type { Links } from '@/interfaces';
import { DiseaseNames } from '@/decorators';

@Resolver('gql')
export class GqlResolver {
  constructor(private readonly neo4jService: Neo4jService) {}

  private logger = new Logger(GqlResolver.name);

  @Query((returns) => String)
  async sayHello(): Promise<string> {
    return 'Hello World!';
  }

  @Query((returns) => [Gene])
  async getGenes(
    @Args('input') input: GeneInput,
    @DiseaseNames() diseaseNames: string[],
  ): Promise<Gene[]> {
    const session = this.neo4jService.getSession();
    let { geneIDs } = input;
    const query = `
      WITH $geneIDs AS geneIDs
      MATCH (g:Gene)
      WHERE g.ID IN geneIDs OR g.Gene_name IN geneIDs
      RETURN g 
    `;
    const result: QueryResult<any> = await session.run(query, { geneIDs });
    const genes: Gene[] = result.records.map((record) => {
      let gene = record.get('g').properties;
      gene.common = {};
      diseaseNames.forEach((disease) => {
        gene[disease] = {};
      });
      for (const key in gene) {
        diseaseNames.forEach((disease) => {
          if (
            key.startsWith(`${disease}_GWAS_`) ||
            key.startsWith(`${disease}_GDA_`) ||
            key.startsWith(`${disease}_logFC_`) ||
            key.startsWith(`${disease}_database_`)
          ) {
            gene[disease][key.slice(disease.length + 1)] = gene[key];
            delete gene[key];
          }
        });
        if (
          key.startsWith(`pathway_`) ||
          key.startsWith(`Druggability_`) ||
          key.startsWith(`TE_`)
        ) {
          gene.common[key] = gene[key];
          delete gene[key];
        }
      }
      return gene;
    });

    return genes;
  }


  @Query((returns) => [GeneInteractionOutput])
  async getGeneInteractions(
    @Args('input') input: InteractionInput,
    @Args('order') order: number,
    @DiseaseNames({ depth: 1, fieldName: 'genes' }) diseaseNames: string[],
  ): Promise<GeneInteractionOutput> {
    const session = this.neo4jService.getSession();
    let { geneIDs, minScore, interactionType } = input;
    interactionType = interactionType.replace('-', '_');

    let query: string;
    if (order === 0) {
      query = `
        WITH $geneIDs AS geneIDs
        MATCH (g:Gene) WHERE g.ID IN geneIDs
        WITH COLLECT(g) AS genes, geneIDs
        UNWIND genes AS g1
        MATCH (g1:Gene)-[r:${interactionType}]->(g2:Gene)
        WHERE r.score >= $minScore AND g2.ID IN geneIDs
        RETURN COLLECT({gene1: g1.ID, gene2: g2.ID, score: r.score}) AS connections, genes
        `;
    } else if (order === 1) {
      query = `
        WITH $geneIDs AS geneIDs
        MATCH (g1:Gene)-[r:${interactionType}]->(g2:Gene)
        WHERE g1.ID IN geneIDs
        AND r.score >= $minScore
        WITH apoc.coll.toSet(COLLECT(g1) + COLLECT(g2)) AS _genes, COLLECT({gene1: g1.ID, gene2: g2.ID, score: r.score}) AS _connections
        RETURN _genes[0..${process.env.NODES_LIMIT || 5000}] AS genes, _connections[0..${process.env.EDGES_LIMIT || 10000}] AS connections
      `;
    } else {
      query = `
        WITH $geneIDs AS geneIDs
        MATCH (g1:Gene)-[r1:${interactionType}]->(g2:Gene)-[r2:${interactionType}]->(g3:Gene)
        WHERE g1.ID IN geneIDs
        AND r1.score >= $minScore AND r2.score >= $minScore
        WITH apoc.coll.toSet(COLLECT(g1) + COLLECT(g2) + COLLECT(g3)) AS _genes, COLLECT({gene1: g1.ID, gene2: g2.ID, score: r1.score}) + COLLECT({gene1: g2.ID, gene2: g3.ID, score: r2.score}) AS _connections
        RETURN _genes[0..${process.env.NODES_LIMIT || 5000}] AS genes, _connections[0..${process.env.EDGES_LIMIT || 10000}] AS connections
      `;
    }
    const result: QueryResult<any> = await session.run(query, {
      geneIDs,
      minScore,
    });
    const genes: Gene[] = result.records?.[0]?.get('genes')?.map((gene) => {
      gene = gene.properties;
      gene.common = {};
      diseaseNames.forEach((disease) => {
        gene[disease] = {};
      });
      for (const key in gene) {
        diseaseNames.forEach((disease) => {
          if (
            key.startsWith(`${disease}_GWAS`) ||
            key.startsWith(`${disease}_GDA`) ||
            key.startsWith(`${disease}_logFC`) ||
            key.startsWith(`${disease}_database`)
          ) {
            gene[disease][key.slice(disease.length + 1)] = gene[key];
            delete gene[key];
          }
        });
        if (
          key.startsWith(`pathway_`) ||
          key.startsWith(`Druggability_`) ||
          key.startsWith(`TE_`)
        ) {
          gene.common[key] = gene[key];
          delete gene[key];
        }
      }
      return gene;
    }) ?? [];

    const indexMap = genes.reduce((acc, gene, index) => {
      acc[gene.ID] = index;
      return acc;
    }, {});

    const connections: Links[] = result.records?.[0]?.get('connections') ?? [];

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
