
/*
 * -------------------------------------------------------
 * THIS FILE WAS AUTOMATICALLY GENERATED (DO NOT MODIFY)
 * -------------------------------------------------------
 */

/* tslint:disable */
/* eslint-disable */

export class GeneInput {
    geneIDs: string[];
}

export class InteractionInput {
    geneIDs: string[];
    interactionType: string;
    minScore: number;
}

export class Gene {
    ALS?: Nullable<JSON>;
    Description?: Nullable<string>;
    FTD?: Nullable<JSON>;
    Gene_name?: Nullable<string>;
    ID: string;
    OI?: Nullable<JSON>;
    PSP?: Nullable<JSON>;
    common?: Nullable<JSON>;
    hgnc_gene_id?: Nullable<string>;
    hgnc_gene_symbol?: Nullable<string>;
}

export class GeneIndex {
    ID: string;
    index: number;
}

export class GeneInteraction {
    gene1: GeneIndex;
    gene2: GeneIndex;
    score: number;
}

export class GeneInteractionOutput {
    genes: Gene[];
    links?: Nullable<GeneInteraction[]>;
}

export abstract class IQuery {
    abstract getGeneInteractions(input: InteractionInput, order: number): GeneInteractionOutput | Promise<GeneInteractionOutput>;

    abstract getGenes(input: GeneInput): Gene[] | Promise<Gene[]>;

    abstract sayHello(): Nullable<string> | Promise<Nullable<string>>;
}

export type JSON = any;
type Nullable<T> = T | null;
