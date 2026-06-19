import { Injectable, Logger } from '@nestjs/common';
import { PricingStrategy } from './pricing.dto';

export interface PricingResult {
  productId: string;
  strategy: string;
  suggestedPrice: number;
  currentPrice?: number;
  margin: number;
  reasoning: string[];
  metadata: Record<string, any>;
}

@Injectable()
export class PricingService {
  private readonly logger = new Logger(PricingService.name);

  private readonly marketData: Record<string, { category: string; avgPrice: number; competitors: number[] }> = {
    'p1': { category: 'ALIMENTOS', avgPrice: 24.90, competitors: [22.50, 25.90, 23.80] },
    'p2': { category: 'ALIMENTOS', avgPrice: 8.90, competitors: [7.50, 9.20, 8.50] },
    'p3': { category: 'ALIMENTOS', avgPrice: 6.50, competitors: [5.90, 6.90, 6.20] },
    'p4': { category: 'BEBIDAS', avgPrice: 4.50, competitors: [3.90, 4.80, 4.30] },
    'p5': { category: 'BEBIDAS', avgPrice: 15.90, competitors: [14.50, 16.90, 15.50] },
    'p7': { category: 'LIMPEZA', avgPrice: 11.90, competitors: [10.50, 12.90, 11.50] },
    'p12': { category: 'ACOUGUE', avgPrice: 39.90, competitors: [35.90, 42.00, 38.90] },
  };

  async suggest(
    productId: string,
    strategy: PricingStrategy,
    costPrice: number,
    marketPrice?: number,
    desiredMargin?: number,
    demandScore?: number,
  ): Promise<PricingResult> {
    switch (strategy) {
      case PricingStrategy.COST_PLUS:
        return this.costPlus(productId, costPrice, desiredMargin);
      case PricingStrategy.COMPETITIVE:
        return this.competitive(productId, costPrice, marketPrice);
      case PricingStrategy.DYNAMIC:
        return this.dynamic(productId, costPrice, demandScore);
      case PricingStrategy.PROMOTIONAL:
        return this.promotional(productId, costPrice, marketPrice);
      case PricingStrategy.MARKDOWN:
        return this.markdown(productId, costPrice, marketPrice);
      default:
        return this.costPlus(productId, costPrice);
    }
  }

  async optimize(
    productId: string,
    costPrice: number,
    currentPrice: number,
    salesVolume: number,
    competitorPrice?: number,
    elasticity?: number,
  ): Promise<PricingResult & { optimalPrice: number; projectedRevenue: number; projectedProfit: number }> {
    const econElasticity = elasticity || 1.5;
    const compPrice = competitorPrice || (this.marketData[productId]?.avgPrice || currentPrice * 1.1);

    const minPrice = costPrice * 1.15;
    const maxPrice = Math.max(compPrice * 1.3, currentPrice * 1.2);

    let bestPrice = currentPrice;
    let bestRevenue = 0;
    let bestProfit = 0;

    for (let testPrice = minPrice; testPrice <= maxPrice; testPrice += 0.5) {
      const priceChange = (testPrice - currentPrice) / currentPrice;
      const volumeChange = -econElasticity * priceChange;
      const projectedVolume = salesVolume * (1 + volumeChange);
      const revenue = testPrice * projectedVolume;
      const profit = (testPrice - costPrice) * projectedVolume;

      if (revenue > bestRevenue) {
        bestRevenue = revenue;
        bestProfit = profit;
        bestPrice = testPrice;
      }
    }

    return {
      productId,
      strategy: 'optimized',
      suggestedPrice: parseFloat(bestPrice.toFixed(2)),
      currentPrice,
      margin: parseFloat(((bestPrice - costPrice) / bestPrice * 100).toFixed(2)),
      reasoning: [
        `Price optimized to maximize revenue given elasticity of ${econElasticity}`,
        `Competitor price: R$ ${compPrice.toFixed(2)}`,
        `Cost price: R$ ${costPrice.toFixed(2)}`,
      ],
      metadata: {
        elasticity: econElasticity,
        competitorPrice: compPrice,
        minPrice: parseFloat(minPrice.toFixed(2)),
        maxPrice: parseFloat(maxPrice.toFixed(2)),
        currentPrice,
        salesVolume,
      },
      optimalPrice: parseFloat(bestPrice.toFixed(2)),
      projectedRevenue: parseFloat(bestRevenue.toFixed(2)),
      projectedProfit: parseFloat(bestProfit.toFixed(2)),
    };
  }

  private costPlus(productId: string, costPrice: number, desiredMargin?: number): PricingResult {
    const margin = desiredMargin || 0.35;
    const price = costPrice / (1 - margin);

    return {
      productId,
      strategy: 'cost_plus',
      suggestedPrice: parseFloat(price.toFixed(2)),
      margin: parseFloat((margin * 100).toFixed(2)),
      reasoning: [
        `Cost price: R$ ${costPrice.toFixed(2)}`,
        `Target margin: ${(margin * 100).toFixed(0)}%`,
        `Formula: cost / (1 - margin) = ${costPrice.toFixed(2)} / ${(1 - margin).toFixed(2)}`,
      ],
      metadata: { costPrice, targetMargin: margin },
    };
  }

  private competitive(productId: string, costPrice: number, marketPrice?: number): PricingResult {
    const compPrice = marketPrice || (this.marketData[productId]?.avgPrice || costPrice * 1.5);
    const price = compPrice * 0.97;
    const margin = price > 0 ? (price - costPrice) / price : 0;

    return {
      productId,
      strategy: 'competitive',
      suggestedPrice: parseFloat(price.toFixed(2)),
      margin: parseFloat((margin * 100).toFixed(2)),
      reasoning: [
        `Market reference price: R$ ${compPrice.toFixed(2)}`,
        `Set at 97% of market to stay competitive`,
        `Cost price: R$ ${costPrice.toFixed(2)}`,
      ],
      metadata: { marketPrice: compPrice, costPrice },
    };
  }

  private dynamic(productId: string, costPrice: number, demandScore?: number): PricingResult {
    const score = demandScore || 0.5;
    const baseMultiplier = 1.3;
    const demandMultiplier = 1 + (score - 0.5) * 0.4;
    const price = costPrice * baseMultiplier * demandMultiplier;
    const margin = price > 0 ? (price - costPrice) / price : 0;

    return {
      productId,
      strategy: 'dynamic',
      suggestedPrice: parseFloat(price.toFixed(2)),
      margin: parseFloat((margin * 100).toFixed(2)),
      reasoning: [
        `Demand score: ${(score * 100).toFixed(0)}%`,
        `Base markup: ${((baseMultiplier - 1) * 100).toFixed(0)}%`,
        `Demand adjustment: ${((demandMultiplier - 1) * 100).toFixed(0)}%`,
      ],
      metadata: { demandScore: score, baseMultiplier, demandMultiplier, costPrice },
    };
  }

  private promotional(productId: string, costPrice: number, marketPrice?: number): PricingResult {
    const compPrice = marketPrice || costPrice * 1.5;
    const discountRate = 0.15;
    const originalPrice = compPrice;
    const price = originalPrice * (1 - discountRate);
    const margin = price > 0 ? (price - costPrice) / price : 0;

    return {
      productId,
      strategy: 'promotional',
      suggestedPrice: parseFloat(price.toFixed(2)),
      margin: parseFloat((margin * 100).toFixed(2)),
      reasoning: [
        `Original price: R$ ${originalPrice.toFixed(2)}`,
        `Discount: ${(discountRate * 100).toFixed(0)}%`,
        `Cost price: R$ ${costPrice.toFixed(2)}`,
        margin < 0.05 ? 'Warning: Margin is very low after discount' : `Margin: ${(margin * 100).toFixed(1)}%`,
      ],
      metadata: { originalPrice, discountRate, costPrice },
    };
  }

  private markdown(productId: string, costPrice: number, marketPrice?: number): PricingResult {
    const compPrice = marketPrice || costPrice * 1.5;
    const weeksOnShelf = 6;
    const markdownRate = Math.min(0.5, weeksOnShelf * 0.05);
    const originalPrice = compPrice;
    const price = originalPrice * (1 - markdownRate);
    const margin = price > 0 ? (price - costPrice) / price : 0;

    return {
      productId,
      strategy: 'markdown',
      suggestedPrice: parseFloat(price.toFixed(2)),
      margin: parseFloat((margin * 100).toFixed(2)),
      reasoning: [
        `Estimated weeks on shelf: ${weeksOnShelf}`,
        `Markdown: ${(markdownRate * 100).toFixed(0)}%`,
        `Original price: R$ ${originalPrice.toFixed(2)}`,
        margin < 0 ? 'Selling below cost - consider write-off' : `Net margin: ${(margin * 100).toFixed(1)}%`,
      ],
      metadata: { originalPrice, markdownRate, weeksOnShelf, costPrice },
    };
  }
}
