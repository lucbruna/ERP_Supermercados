import { Injectable, Logger } from '@nestjs/common';
import { RecommendationStrategy } from './recommendation.dto';

export interface RecommendationItem {
  productId: string;
  productName: string;
  reason: string;
  score: number;
  strategy: string;
}

@Injectable()
export class RecommendationService {
  private readonly logger = new Logger(RecommendationService.name);

  private readonly productCatalog: Record<string, { name: string; category: string; price: number; cost: number; margin: number }> = {
    'p1': { name: 'Arroz 5kg', category: 'ALIMENTOS', price: 24.90, cost: 18.00, margin: 0.28 },
    'p2': { name: 'Feijão 1kg', category: 'ALIMENTOS', price: 8.90, cost: 6.50, margin: 0.27 },
    'p3': { name: 'Óleo de Soja 900ml', category: 'ALIMENTOS', price: 6.50, cost: 4.80, margin: 0.26 },
    'p4': { name: 'Leite Integral 1L', category: 'BEBIDAS', price: 4.50, cost: 3.20, margin: 0.29 },
    'p5': { name: 'Café Torrado 500g', category: 'BEBIDAS', price: 15.90, cost: 11.00, margin: 0.31 },
    'p6': { name: 'Açúcar Refinado 5kg', category: 'ALIMENTOS', price: 12.90, cost: 9.50, margin: 0.26 },
    'p7': { name: 'Sabão em Pó 1kg', category: 'LIMPEZA', price: 11.90, cost: 8.00, margin: 0.33 },
    'p8': { name: 'Detergente Líquido 500ml', category: 'LIMPEZA', price: 3.50, cost: 2.20, margin: 0.37 },
    'p9': { name: 'Papel Higiênico 12un', category: 'HIGIENE', price: 22.90, cost: 16.00, margin: 0.30 },
    'p10': { name: 'Shampoo 350ml', category: 'HIGIENE', price: 18.90, cost: 12.50, margin: 0.34 },
    'p11': { name: 'Cerveja Lata 350ml', category: 'BEBIDAS', price: 3.90, cost: 2.50, margin: 0.36 },
    'p12': { name: 'Carne Bovina kg', category: 'ACOUGUE', price: 39.90, cost: 32.00, margin: 0.20 },
    'p13': { name: 'Frango Resfriado kg', category: 'ACOUGUE', price: 15.90, cost: 11.50, margin: 0.28 },
    'p14': { name: 'Tomate kg', category: 'HORTIFRUTI', price: 6.90, cost: 4.00, margin: 0.42 },
    'p15': { name: 'Banana kg', category: 'HORTIFRUTI', price: 4.90, cost: 3.00, margin: 0.39 },
  };

  private readonly associationRules: Record<string, string[]> = {
    'p1': ['p2', 'p6', 'p3'],
    'p2': ['p1', 'p6', 'p3'],
    'p3': ['p1', 'p2'],
    'p4': ['p5', 'p11'],
    'p5': ['p4', 'p6'],
    'p6': ['p1', 'p2', 'p5'],
    'p7': ['p8', 'p9'],
    'p8': ['p7', 'p9'],
    'p9': ['p7', 'p8'],
    'p10': ['p9'],
    'p11': ['p12', 'p13'],
    'p12': ['p11', 'p13', 'p14'],
    'p13': ['p11', 'p12', 'p14'],
    'p14': ['p12', 'p13', 'p15'],
    'p15': ['p14', 'p4'],
  };

  private readonly seasonalProducts: Record<number, string[]> = {
    0: ['p5', 'p6', 'p14'],
    1: ['p14', 'p15'],
    2: ['p14', 'p15'],
    3: ['p1', 'p2', 'p3'],
    4: ['p1', 'p2', 'p3'],
    5: ['p11', 'p12', 'p13'],
    6: ['p11', 'p12', 'p13'],
    7: ['p11', 'p12', 'p13'],
    8: ['p4', 'p5', 'p6'],
    9: ['p4', 'p5', 'p6'],
    10: ['p1', 'p2', 'p6'],
    11: ['p1', 'p2', 'p5', 'p12', 'p13'],
  };

  async getRecommendations(productId: string, limit = 5): Promise<RecommendationItem[]> {
    const all: RecommendationItem[] = [
      ...this.crossSell(productId, 10),
      ...this.upSell(productId, 10),
      ...this.seasonalForProduct(productId, 5),
    ];

    const seen = new Set<string>();
    return all
      .filter(item => { if (seen.has(item.productId)) return false; seen.add(item.productId); return true; })
      .slice(0, limit);
  }

  async getCrossSell(productId: string, limit = 5): Promise<RecommendationItem[]> {
    return this.crossSell(productId, limit);
  }

  async getCustomerRecommendations(
    customerId: string,
    limit = 5,
    strategy?: RecommendationStrategy,
  ): Promise<RecommendationItem[]> {
    const segment = this.getCustomerSegment(customerId);

    if (strategy) {
      return this.executeStrategy(strategy, customerId, segment, limit);
    }

    const all: RecommendationItem[] = [
      ...this.executeStrategy(RecommendationStrategy.CROSS_SELL, customerId, segment, 5),
      ...this.executeStrategy(RecommendationStrategy.UP_SELL, customerId, segment, 5),
      ...this.executeStrategy(RecommendationStrategy.SEASONAL, customerId, segment, 5),
      ...this.executeStrategy(RecommendationStrategy.PERSONA_BASED, customerId, segment, 5),
    ];

    const seen = new Set<string>();
    return all
      .filter(item => { if (seen.has(item.productId)) return false; seen.add(item.productId); return true; })
      .slice(0, limit);
  }

  private crossSell(productId: string, limit: number): RecommendationItem[] {
    const related = this.associationRules[productId] || [];
    const product = this.productCatalog[productId];
    return related.slice(0, limit).map((pid, idx) => ({
      productId: pid,
      productName: this.productCatalog[pid]?.name || `Product ${pid}`,
      reason: `Frequently bought together with ${product?.name || 'this product'}`,
      score: parseFloat((1 - idx * 0.15).toFixed(2)),
      strategy: 'cross_sell',
    }));
  }

  private upSell(productId: string, limit: number): RecommendationItem[] {
    const product = this.productCatalog[productId];
    if (!product) return [];

    return Object.entries(this.productCatalog)
      .filter(([pid, p]) => p.category === product.category && p.price > product.price && pid !== productId)
      .sort(([, a], [, b]) => (b.price - a.price))
      .slice(0, limit)
      .map(([pid, p]) => ({
        productId: pid,
        productName: p.name,
        reason: `Higher margin alternative in ${product.category}`,
        score: parseFloat((p.margin).toFixed(2)),
        strategy: 'up_sell',
      }));
  }

  private replenishment(limit: number): RecommendationItem[] {
    return Object.entries(this.productCatalog)
      .sort(() => Math.random() - 0.5)
      .slice(0, limit)
      .map(([pid, p]) => ({
        productId: pid,
        productName: p.name,
        reason: `Low stock alert - consider replenishment`,
        score: 0.8,
        strategy: 'replenishment',
      }));
  }

  private seasonalForProduct(productId: string, limit: number): RecommendationItem[] {
    const month = new Date().getMonth();
    const seasonal = this.seasonalProducts[month] || [];
    return seasonal
      .filter(pid => pid !== productId)
      .slice(0, limit)
      .map(pid => ({
        productId: pid,
        productName: this.productCatalog[pid]?.name || `Product ${pid}`,
        reason: `Seasonal recommendation for this time of year`,
        score: 0.85,
        strategy: 'seasonal',
      }));
  }

  private seasonal(limit: number): RecommendationItem[] {
    const month = new Date().getMonth();
    const seasonal = this.seasonalProducts[month] || [];
    return seasonal.slice(0, limit).map(pid => ({
      productId: pid,
      productName: this.productCatalog[pid]?.name || `Product ${pid}`,
      reason: `Seasonal product for this month`,
      score: 0.9,
      strategy: 'seasonal',
    }));
  }

  private personaBased(segment: string, limit: number): RecommendationItem[] {
    const preferences: Record<string, string[]> = {
      individual: ['p1', 'p2', 'p4', 'p5', 'p8'],
      family: ['p1', 'p2', 'p6', 'p7', 'p9', 'p15'],
      premium: ['p12', 'p13', 'p10', 'p5'],
      corporate: ['p5', 'p11', 'p12', 'p13'],
    };
    const prefs = preferences[segment] || preferences.individual;
    return prefs.slice(0, limit).map(pid => ({
      productId: pid,
      productName: this.productCatalog[pid]?.name || `Product ${pid}`,
      reason: `Recommended for ${segment} customer profile`,
      score: 0.82,
      strategy: 'persona_based',
    }));
  }

  private getCustomerSegment(customerId: string): string {
    const segments = ['individual', 'family', 'premium', 'corporate'];
    const hash = customerId.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
    return segments[hash % segments.length];
  }

  private executeStrategy(
    strategy: RecommendationStrategy,
    _customerId: string,
    segment: string,
    limit: number,
  ): RecommendationItem[] {
    switch (strategy) {
      case RecommendationStrategy.CROSS_SELL:
        return this.crossSell('p1', limit);
      case RecommendationStrategy.UP_SELL:
        return this.upSell('p1', limit);
      case RecommendationStrategy.REPLENISHMENT:
        return this.replenishment(limit);
      case RecommendationStrategy.SEASONAL:
        return this.seasonal(limit);
      case RecommendationStrategy.PERSONA_BASED:
        return this.personaBased(segment, limit);
      default:
        return [];
    }
  }
}
