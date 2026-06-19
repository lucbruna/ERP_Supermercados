import { Injectable, Logger } from '@nestjs/common';

export interface AnomalyResult {
  anomalies: { index: number; value: number; reason: string; severity: string }[];
  method: string;
  threshold: number;
  stats: Record<string, number>;
}

@Injectable()
export class AnomalyService {
  private readonly logger = new Logger(AnomalyService.name);

  async detect(
    type: string,
    values: number[],
    threshold?: number,
  ): Promise<AnomalyResult> {
    const t = threshold || 2;

    switch (type) {
      case 'zscore':
        return this.zScore(values, t);
      case 'iqr':
        return this.iqr(values);
      case 'moving_average':
        return this.movingAverageDeviation(values, t);
      default:
        return this.zScore(values, t);
    }
  }

  async pricingAnomaly(
    productId: string,
    price: number,
    category: string,
    categoryAveragePrice?: number,
  ): Promise<{ isAnomaly: boolean; reason: string; score: number; stats: Record<string, number> }> {
    const avgPrice = categoryAveragePrice || this.getCategoryAverage(category);

    const deviation = price - avgPrice;
    const relativeDeviation = avgPrice > 0 ? deviation / avgPrice : 0;
    const zScore = avgPrice > 0 ? Math.abs(deviation) / (avgPrice * 0.2 + 1) : 0;

    const threshold = 2.5;
    const isAnomaly = zScore > threshold || Math.abs(relativeDeviation) > 0.5;

    let reason: string;
    if (isAnomaly) {
      if (relativeDeviation > 0) {
        reason = `Price is ${(relativeDeviation * 100).toFixed(1)}% above category average (${category})`;
      } else {
        reason = `Price is ${(Math.abs(relativeDeviation) * 100).toFixed(1)}% below category average (${category})`;
      }
    } else {
      reason = 'Price is within normal range for this category';
    }

    return {
      isAnomaly,
      reason,
      score: parseFloat(Math.min(1, zScore / 5).toFixed(4)),
      stats: {
        currentPrice: price,
        categoryAverage: avgPrice,
        deviation: parseFloat(deviation.toFixed(2)),
        relativeDeviation: parseFloat(relativeDeviation.toFixed(4)),
        zScore: parseFloat(zScore.toFixed(4)),
      },
    };
  }

  private zScore(values: number[], threshold: number): AnomalyResult {
    const n = values.length;
    const mean = values.reduce((a, b) => a + b, 0) / n;
    const variance = values.reduce((sum, v) => sum + (v - mean) ** 2, 0) / n;
    const stdDev = Math.sqrt(variance);

    const anomalies: { index: number; value: number; reason: string; severity: string }[] = [];

    for (let i = 0; i < n; i++) {
      const z = stdDev > 0 ? Math.abs((values[i] - mean) / stdDev) : 0;
      if (z > threshold) {
        anomalies.push({
          index: i,
          value: values[i],
          reason: `Z-score = ${z.toFixed(2)} (threshold: ${threshold})`,
          severity: z > threshold * 1.5 ? 'high' : 'medium',
        });
      }
    }

    return {
      anomalies,
      method: 'zscore',
      threshold,
      stats: {
        mean: parseFloat(mean.toFixed(2)),
        stdDev: parseFloat(stdDev.toFixed(2)),
        totalPoints: n,
        anomalyCount: anomalies.length,
        anomalyRate: parseFloat(((anomalies.length / n) * 100).toFixed(2)),
      },
    };
  }

  private iqr(values: number[]): AnomalyResult {
    const sorted = [...values].sort((a, b) => a - b);
    const n = sorted.length;

    const q1Index = Math.floor(n * 0.25);
    const q3Index = Math.floor(n * 0.75);
    const q1 = sorted[q1Index];
    const q3 = sorted[q3Index];
    const iqr = q3 - q1;

    const lowerBound = q1 - 1.5 * iqr;
    const upperBound = q3 + 1.5 * iqr;

    const anomalies: { index: number; value: number; reason: string; severity: string }[] = [];

    for (let i = 0; i < n; i++) {
      if (values[i] < lowerBound || values[i] > upperBound) {
        const distance = values[i] < lowerBound
          ? (lowerBound - values[i]) / iqr
          : (values[i] - upperBound) / iqr;
        anomalies.push({
          index: i,
          value: values[i],
          reason: `Outside IQR bounds [${lowerBound.toFixed(2)}, ${upperBound.toFixed(2)}]`,
          severity: distance > 2 ? 'high' : 'medium',
        });
      }
    }

    return {
      anomalies,
      method: 'iqr',
      threshold: 1.5,
      stats: {
        q1: parseFloat(q1.toFixed(2)),
        q3: parseFloat(q3.toFixed(2)),
        iqr: parseFloat(iqr.toFixed(2)),
        lowerBound: parseFloat(lowerBound.toFixed(2)),
        upperBound: parseFloat(upperBound.toFixed(2)),
        totalPoints: n,
        anomalyCount: anomalies.length,
        anomalyRate: parseFloat(((anomalies.length / n) * 100).toFixed(2)),
      },
    };
  }

  private movingAverageDeviation(values: number[], threshold: number): AnomalyResult {
    const window = Math.max(3, Math.min(10, Math.floor(values.length / 5)));
    const anomalies: { index: number; value: number; reason: string; severity: string }[] = [];

    for (let i = window; i < values.length; i++) {
      const windowValues = values.slice(i - window, i);
      const avg = windowValues.reduce((a, b) => a + b, 0) / window;
      const deviation = avg > 0 ? Math.abs((values[i] - avg) / avg) : 0;

      if (deviation > threshold * 0.1) {
        anomalies.push({
          index: i,
          value: values[i],
          reason: `Deviation of ${(deviation * 100).toFixed(1)}% from moving average (${avg.toFixed(2)})`,
          severity: deviation > threshold * 0.2 ? 'high' : 'medium',
        });
      }
    }

    return {
      anomalies,
      method: 'moving_average',
      threshold,
      stats: {
        windowSize: window,
        totalPoints: values.length,
        anomalyCount: anomalies.length,
        anomalyRate: parseFloat(((anomalies.length / values.length) * 100).toFixed(2)),
      },
    };
  }

  private getCategoryAverage(category: string): number {
    const averages: Record<string, number> = {
      ALIMENTOS: 15.50,
      BEBIDAS: 8.90,
      LIMPEZA: 12.50,
      HIGIENE: 16.80,
      HORTIFRUTI: 7.90,
      ACOUGUE: 28.50,
      PADARIA: 9.50,
      LATICINIOS: 14.50,
      CONGELADOS: 18.90,
      PET_SHOP: 35.00,
    };
    return averages[category] || 20.00;
  }
}
