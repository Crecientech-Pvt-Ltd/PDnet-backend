
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
    minScore: number;
}

export class Gene {
    Description?: Nullable<string>;
    Druggability_Score_drugnome_antibody?: Nullable<string>;
    Druggability_Score_drugnome_protac?: Nullable<string>;
    Druggability_Score_drugnome_small_molecule?: Nullable<string>;
    Druggability_Score_drugnome_tchem?: Nullable<string>;
    Druggability_Score_drugnome_tclin?: Nullable<string>;
    Druggability_Score_drugnome_tclin_and_tchem?: Nullable<string>;
    Druggability_Score_drugnome_tclin_and_tier_1?: Nullable<string>;
    Druggability_Score_drugnome_tier_1?: Nullable<string>;
    Druggability_Score_drugnome_tier_1_and_2?: Nullable<string>;
    Druggability_Score_drugnome_tier_1_and_2_and_3a?: Nullable<string>;
    GDA_Score_MantisML_HPO?: Nullable<string>;
    GDA_Score_MantisML_OT?: Nullable<string>;
    GDA_Score_opentargets_animal_model?: Nullable<string>;
    GDA_Score_opentargets_chembl?: Nullable<string>;
    GDA_Score_opentargets_clingen?: Nullable<string>;
    GDA_Score_opentargets_europepmc?: Nullable<string>;
    GDA_Score_opentargets_eva?: Nullable<string>;
    GDA_Score_opentargets_expression_atlas?: Nullable<string>;
    GDA_Score_opentargets_genetic_association?: Nullable<string>;
    GDA_Score_opentargets_genomics_england?: Nullable<string>;
    GDA_Score_opentargets_impc?: Nullable<string>;
    GDA_Score_opentargets_known_drug?: Nullable<string>;
    GDA_Score_opentargets_literature?: Nullable<string>;
    GDA_Score_opentargets_orphanet?: Nullable<string>;
    GDA_Score_opentargets_ot_genetics_portal?: Nullable<string>;
    GDA_Score_opentargets_overall_association_score?: Nullable<string>;
    GDA_Score_opentargets_rna_expression?: Nullable<string>;
    GDA_Score_opentargets_uniprot_literature?: Nullable<string>;
    GDA_Score_opentargets_uniprot_variants?: Nullable<string>;
    GWAS_Beta_ot_genetics_MONDO_0004976_PMID19451621_beta?: Nullable<string>;
    GWAS_Beta_ot_genetics_MONDO_0004976_PMID34873335_beta?: Nullable<string>;
    GWAS_OR_ot_genetics_MONDO_0004976_PMID18084291_odds_ratio?: Nullable<string>;
    GWAS_OR_ot_genetics_MONDO_0004976_PMID20801718_odds_ratio?: Nullable<string>;
    GWAS_OR_ot_genetics_MONDO_0004976_PMID23624525_odds_ratio?: Nullable<string>;
    GWAS_OR_ot_genetics_MONDO_0004976_PMID24256812_odds_ratio?: Nullable<string>;
    GWAS_OR_ot_genetics_MONDO_0004976_PMID24931836_odds_ratio?: Nullable<string>;
    GWAS_OR_ot_genetics_MONDO_0004976_PMID27455348_odds_ratio?: Nullable<string>;
    GWAS_OR_ot_genetics_MONDO_0004976_PMID29566793_odds_ratio?: Nullable<string>;
    GWAS_OR_ot_genetics_MONDO_0004976_PMID32968195_odds_ratio?: Nullable<string>;
    Gene_name?: Nullable<string>;
    ID: string;
    database_Mendelian_GenCC_ALS?: Nullable<string>;
    hgnc_gene_id?: Nullable<string>;
    hgnc_gene_symbol?: Nullable<string>;
    logFC_rnaseq_PMID37080969_c9orf72_fold_change?: Nullable<string>;
    logFC_rnaseq_PMID37080969_fus_fold_change?: Nullable<string>;
    logFC_rnaseq_PMID37080969_sod1_fold_change?: Nullable<string>;
    logFC_rnaseq_PMID37080969_sporadic_fold_change?: Nullable<string>;
    logFC_rnaseq_PMID37080969_tardbp_fold_change?: Nullable<string>;
    old_target_id?: Nullable<string>;
    pathway_AMPK_signaling_pathway?: Nullable<string>;
    pathway_Autodegradation_Of_E3_Ubiquitin_Ligase_COP1_R_HSA_349425?: Nullable<string>;
    pathway_Cellular_response_to_hypoxia?: Nullable<string>;
    pathway_Chaperone_Mediated_Autophagy?: Nullable<string>;
    pathway_Chaperone_Mediated_Autophagy_1?: Nullable<string>;
    pathway_Chaperone_Mediated_Autophagy_R_HSA_9613829?: Nullable<string>;
    pathway_Chaperonin_mediated_Protein_Folding_R_HSA_390466?: Nullable<string>;
    pathway_E3_Ubiquitin_Ligases_Ubiquitinate_Target_Proteins_R_HSA_8866654?: Nullable<string>;
    pathway_Endocytosis?: Nullable<string>;
    pathway_IRE1alpha_Activates_Chaperones_R_HSA_381070?: Nullable<string>;
    pathway_Longevity_regulating_pathway___Homo_sapiens_human?: Nullable<string>;
    pathway_Lysosome_Vesicle_Biogenesis?: Nullable<string>;
    pathway_Lysosome___Homo_sapiens_human?: Nullable<string>;
    pathway_MAPK_signaling_pathway?: Nullable<string>;
    pathway_Macroautophagy?: Nullable<string>;
    pathway_Mitophagy___animal___Homo_sapiens_human?: Nullable<string>;
    pathway_OXO_mediated_transcription_R_HSA_9614085?: Nullable<string>;
    pathway_Oxidative_Stress_Induced_Senescence?: Nullable<string>;
    pathway_Proteasome?: Nullable<string>;
    pathway_Proteasome_Degradation_R_HSA_983168?: Nullable<string>;
    pathway_Protein_Ubiquitination_R_HSA_8852135?: Nullable<string>;
    pathway_Protein_processing_in_endoplasmic_reticulum___Homo_sapiens?: Nullable<string>;
    pathway_Regulation_Of_FZD_By_Ubiquitination_R_HSA_4641263?: Nullable<string>;
    pathway_Ribosome___Homo_sapiens_human?: Nullable<string>;
    pathway_SUMOylation_Of_Ubiquitinylation_Proteins_R_HSA_3232142?: Nullable<string>;
    pathway_Synaptic_vesicle_cycle?: Nullable<string>;
    pathway_Synthesis_Of_Active_Ubiquitin_Roles_Of_E1_And_E2_Enzymes_R_HSA_8866652?: Nullable<string>;
    pathway_Ubiquitin_Mediated_Degradation_Of_Phosphorylated_Cdc25A_R_HSA_69601?: Nullable<string>;
    pathway_Ubiquitin_dependent_Degradation_Of_Cyclin_D_R_HSA_75815?: Nullable<string>;
    pathway_Ubiquitin_mediated_proteolysis?: Nullable<string>;
    pathway_Ubiquitination_And_Proteasome_Degradation_R_HSA_83168?: Nullable<string>;
    pathway_Unfolded_Protein_Response_UPR_R_HSA_381119?: Nullable<string>;
    pathway_Vesicle_mediated_transport?: Nullable<string>;
    pathway_XBP1S_Activates_Chaperone_Genes_R_HSA_381038?: Nullable<string>;
    pathway_p38_MAPK_signaling_pathway_R_HSA_450302?: Nullable<string>;
    pathway_p130Cas_linkage_to_MAPK_signaling_for_integrins?: Nullable<string>;
    universal_ID?: Nullable<string>;
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

type Nullable<T> = T | null;
