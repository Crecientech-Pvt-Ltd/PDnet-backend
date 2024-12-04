import { Field, Float, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class GeneIndex {
  @Field(() => String)
  ID: string;

  @Field(() => Int)
  index: number;
}

@ObjectType()
export class GeneInteraction {
  @Field(() => GeneIndex)
  gene1: GeneIndex;

  @Field(() => GeneIndex)
  gene2: GeneIndex;

  @Field(() => Float)
  score: number;
}
