import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  ParseBoolPipe,
  ParseFloatPipe,
  Query,
} from '@nestjs/common';
import { AlgorithmService } from '@/algorithm/algorithm.service';

@Controller('algorithm')
export class AlgorithmController {
  constructor(private readonly algoService: AlgorithmService) {}

  @Get('louvain')
  async louvain(
    @Query('graphName') graphName: string,
    @Query('resolution', new ParseFloatPipe({ optional: true })) resolution = 1,
    @Query('weighted', new ParseBoolPipe({ optional: true })) weighted = true,
  ) {
    const result = await this.algoService.louvain(
      graphName,
      resolution,
      weighted,
    );
    if (!result)
      throw new HttpException('Graph not found', HttpStatus.NOT_FOUND);
    return result;
  }
}
