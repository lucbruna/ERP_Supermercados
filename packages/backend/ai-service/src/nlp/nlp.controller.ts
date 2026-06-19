import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { NlpService } from './nlp.service';
import { SentimentDto, ClassifyDto, KeywordsDto, CategorizeProductDto } from './nlp.dto';

@ApiTags('nlp')
@Controller('nlp')
export class NlpController {
  constructor(private readonly service: NlpService) {}

  @Post('sentiment')
  @ApiOperation({ summary: 'Analyze sentiment of text (positive/negative/neutral + score)' })
  sentiment(@Body() dto: SentimentDto) {
    return this.service.sentiment(dto.text);
  }

  @Post('classify')
  @ApiOperation({ summary: 'Classify intent of text (complaint, question, order, feedback)' })
  classify(@Body() dto: ClassifyDto) {
    return this.service.classify(dto.text);
  }

  @Post('keywords')
  @ApiOperation({ summary: 'Extract keywords from text' })
  keywords(@Body() dto: KeywordsDto) {
    return this.service.keywords(dto.text, dto.stopWords);
  }

  @Post('summarize')
  @ApiOperation({ summary: 'Summarize a text passage' })
  summarize(@Body() dto: SentimentDto) {
    return this.service.summarize(dto.text);
  }

  @Post('categorize-product')
  @ApiOperation({ summary: 'Suggest product category based on name/description' })
  categorizeProduct(@Body() dto: CategorizeProductDto) {
    return this.service.categorizeProduct(dto.name, dto.description);
  }
}
