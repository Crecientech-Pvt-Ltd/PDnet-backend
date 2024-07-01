import { Test, TestingModule } from '@nestjs/testing';
import { GqlResolver } from './gql.resolver';

describe('GqlResolver', () => {
  let resolver: GqlResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GqlResolver],
    }).compile();

    resolver = module.get<GqlResolver>(GqlResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  describe('sayHello', () => {
    it('should return "Hello World!"', async () => {
      const result = await resolver.sayHello();
      expect(result).toBe('Hello World!');
    });
  });

  describe('getGenes', () => {
    it('should return an array of genes', async () => {
      const input = { geneIDs: ['gene1', 'gene2'] };
      const result = await resolver.getGenes(input);
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('getGeneInteractions', () => {
    it('should return gene interactions with order 1', async () => {
      const input = { geneIDs: ['gene1', 'gene2'], minScore: 0.5 };
      const order = 1;
      const result = await resolver.getGeneInteractions(input, order);
      expect(result).toHaveProperty('genes');
      expect(result).toHaveProperty('links');
      expect(Array.isArray(result.genes)).toBe(true);
      expect(Array.isArray(result.links)).toBe(true);
      result.links.forEach(async (link) => {
        expect(link).toHaveProperty('gene1');
        expect(link).toHaveProperty('gene2');
        expect(link).toHaveProperty('score');
        expect(link.score).toBeGreaterThanOrEqual(input.minScore);
      });
    });

    it('should return gene interactions with order 0', async () => {
      const input = { geneIDs: ['gene1', 'gene2'], minScore: 0.5 };
      const order = 0;
      const result = await resolver.getGeneInteractions(input, order);
      expect(result).toHaveProperty('genes');
      expect(result).toHaveProperty('links');
      expect(Array.isArray(result.genes)).toBe(true);
      expect(result.genes.length).toEqual(input.geneIDs.length);
      expect(Array.isArray(result.links)).toBe(true);
      result.links.forEach(async (link) => {
        expect(link).toHaveProperty('gene1');
        expect(link).toHaveProperty('gene2');
        expect(link).toHaveProperty('score');
        expect(link.score).toBeGreaterThanOrEqual(input.minScore);
      });
    });
  });
});