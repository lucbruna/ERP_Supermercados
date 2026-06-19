import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { LoggingInterceptor } from '@crm/logging';
import { PrismaModule } from './common/prisma.module';
import { PrevisoesModule } from './previsoes/previsoes.module';
import { RecomendacoesModule } from './recomendacoes/recomendacoes.module';
import { FraudeModule } from './fraude/fraude.module';
import { ComportamentoModule } from './comportamento/comportamento.module';
import { ForecastModule } from './forecast/forecast.module';
import { RecommendationModule } from './recommendation/recommendation.module';
import { NlpModule } from './nlp/nlp.module';
import { AnomalyModule } from './anomaly/anomaly.module';
import { PricingModule } from './pricing/pricing.module';
import { ChatbotModule } from './chatbot/chatbot.module';
import { AnaliseFinanceiraModule } from './analise-financeira/analise-financeira.module';
import { RelatoriosInteligentesModule } from './relatorios-inteligentes/relatorios-inteligentes.module';
import { AssistenteExecutivoModule } from './assistente-executivo/assistente-executivo.module';

@Module({
  imports: [
    PrismaModule,
    PrevisoesModule,
    RecomendacoesModule,
    FraudeModule,
    ComportamentoModule,
    ForecastModule,
    RecommendationModule,
    NlpModule,
    AnomalyModule,
    PricingModule,
    ChatbotModule,
    AnaliseFinanceiraModule,
    RelatoriosInteligentesModule,
    AssistenteExecutivoModule,
  ],
  providers: [
    { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
  ],
})
export class AppModule {}
