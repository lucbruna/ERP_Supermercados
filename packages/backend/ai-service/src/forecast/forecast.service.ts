import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import * as tf from '@tensorflow/tfjs';
import { ForecastMethod } from './forecast.dto';

export interface ForecastResult {
  productId: string;
  method: string;
  predictions: number[];
  mape: number;
  confidence: number;
  metadata: Record<string, any>;
}

@Injectable()
export class ForecastService {
  private readonly logger = new Logger(ForecastService.name);

  async salesForecast(
    productId: string,
    periods: number,
    method?: ForecastMethod,
    historicalSales?: number[],
  ): Promise<ForecastResult> {
    const data = historicalSales || this.generateMockHistory(90);
    if (data.length < 3) throw new BadRequestException('Need at least 3 data points');

    const selectedMethod = method || ForecastMethod.AUTO;
    if (selectedMethod === ForecastMethod.AUTO) {
      return this.autoSelectBest(productId, periods, data);
    }
    return this.executeMethod(selectedMethod, productId, periods, data);
  }

  async inventoryForecast(
    productId: string,
    currentStock: number,
    leadTimeDays: number,
    safetyStock?: number,
    dailySales?: number,
  ): Promise<ForecastResult> {
    const avgDailySales = dailySales || 50 + Math.random() * 30;
    const safety = safetyStock || avgDailySales * 2;
    const reorderPoint = Math.ceil(avgDailySales * leadTimeDays + safety);
    const daysUntilReorder = Math.max(0, Math.floor((currentStock - reorderPoint) / avgDailySales));

    return {
      productId,
      method: 'inventory',
      predictions: [reorderPoint],
      mape: 0,
      confidence: 0.85,
      metadata: {
        currentStock,
        avgDailySales: parseFloat(avgDailySales.toFixed(2)),
        leadTimeDays,
        safetyStock: safety,
        reorderPoint,
        daysUntilReorder,
        needsReorder: currentStock <= reorderPoint,
      },
    };
  }

  async demandForecast(
    productId: string,
    periods: number,
    method?: ForecastMethod,
    historicalDemand?: number[],
  ): Promise<ForecastResult> {
    return this.salesForecast(productId, periods, method, historicalDemand);
  }

  private async autoSelectBest(
    productId: string,
    periods: number,
    data: number[],
  ): Promise<ForecastResult> {
    const methods = [
      ForecastMethod.SMA,
      ForecastMethod.EXPONENTIAL_SMOOTHING,
      ForecastMethod.LINEAR_REGRESSION,
      ForecastMethod.SEASONAL_DECOMPOSITION,
    ];

    let best: ForecastResult | null = null;
    let bestMape = Infinity;

    for (const m of methods) {
      try {
        const result = await this.executeMethod(m, productId, periods, data, true);
        if (result.mape < bestMape) {
          bestMape = result.mape;
          best = result;
        }
      } catch (e) {
        this.logger.warn(`Method ${m} failed: ${e.message}`);
      }
    }

    if (!best) throw new BadRequestException('All forecast methods failed');
    best.metadata.selectedBy = 'auto (lowest MAE)';
    return best;
  }

  private async executeMethod(
    method: ForecastMethod,
    productId: string,
    periods: number,
    data: number[],
    isEvaluation = false,
  ): Promise<ForecastResult> {
    switch (method) {
      case ForecastMethod.SMA:
        return this.sma(productId, periods, data, isEvaluation);
      case ForecastMethod.EXPONENTIAL_SMOOTHING:
        return this.exponentialSmoothing(productId, periods, data, isEvaluation);
      case ForecastMethod.LINEAR_REGRESSION:
        return this.linearRegression(productId, periods, data, isEvaluation);
      case ForecastMethod.SEASONAL_DECOMPOSITION:
        return this.seasonalDecomposition(productId, periods, data, isEvaluation);
      default:
        throw new BadRequestException(`Unknown method: ${method}`);
    }
  }

  private sma(productId: string, periods: number, data: number[], evaluate: boolean): ForecastResult {
    const window = Math.max(3, Math.min(14, Math.floor(data.length / 4)));
    const predictions: number[] = [];
    const mapeValues: number[] = [];

    for (let i = window; i < data.length; i++) {
      const windowData = data.slice(i - window, i);
      const pred = windowData.reduce((a, b) => a + b, 0) / window;
      if (i < data.length) {
        mapeValues.push(Math.abs((data[i] - pred) / data[i]));
      }
      predictions.push(parseFloat(pred.toFixed(2)));
    }

    for (let p = 0; p < periods; p++) {
      const windowData = predictions.slice(-window);
      const next = windowData.reduce((a, b) => a + b, 0) / window;
      predictions.push(parseFloat(next.toFixed(2)));
    }

    const mape = mapeValues.length > 0
      ? parseFloat((mapeValues.reduce((a, b) => a + b, 0) / mapeValues.length * 100).toFixed(2))
      : 0;

    return {
      productId,
      method: ForecastMethod.SMA,
      predictions: predictions.slice(-periods),
      mape,
      confidence: parseFloat(Math.max(0, Math.min(1, 1 - mape / 100)).toFixed(4)),
      metadata: { windowSize: window, dataPoints: data.length },
    };
  }

  private exponentialSmoothing(productId: string, periods: number, data: number[], evaluate: boolean): ForecastResult {
    const alpha = 0.3;
    const predictions: number[] = [];
    const mapeValues: number[] = [];

    let level = data[0];
    for (let i = 1; i < data.length; i++) {
      level = alpha * data[i - 1] + (1 - alpha) * level;
      if (i < data.length) {
        mapeValues.push(Math.abs((data[i] - level) / data[i]));
      }
      predictions.push(parseFloat(level.toFixed(2)));
    }

    for (let p = 0; p < periods; p++) {
      predictions.push(parseFloat(level.toFixed(2)));
    }

    const mape = mapeValues.length > 0
      ? parseFloat((mapeValues.reduce((a, b) => a + b, 0) / mapeValues.length * 100).toFixed(2))
      : 0;

    return {
      productId,
      method: ForecastMethod.EXPONENTIAL_SMOOTHING,
      predictions: predictions.slice(-periods),
      mape,
      confidence: parseFloat(Math.max(0, Math.min(1, 1 - mape / 100)).toFixed(4)),
      metadata: { alpha, dataPoints: data.length },
    };
  }

  private async linearRegression(productId: string, periods: number, data: number[], evaluate: boolean): Promise<ForecastResult> {
    const n = data.length;
    const x = tf.tensor1d(Array.from({ length: n }, (_, i) => i));
    const y = tf.tensor1d(data);

    const xMean = tf.mean(x).dataSync()[0];
    const yMean = tf.mean(y).dataSync()[0];

    const xDiff = tf.sub(x, tf.scalar(xMean));
    const yDiff = tf.sub(y, tf.scalar(yMean));

    const numerator = tf.sum(tf.mul(xDiff, yDiff)).dataSync()[0];
    const denominator = tf.sum(tf.square(xDiff)).dataSync()[0];

    const slope = denominator !== 0 ? numerator / denominator : 0;
    const intercept = yMean - slope * xMean;

    const predictions: number[] = [];
    const mapeValues: number[] = [];

    for (let i = 0; i < n; i++) {
      const pred = slope * i + intercept;
      if (i < n) {
        mapeValues.push(Math.abs((data[i] - pred) / data[i]));
      }
      predictions.push(parseFloat(pred.toFixed(2)));
    }

    for (let p = 1; p <= periods; p++) {
      const next = slope * (n + p - 1) + intercept;
      predictions.push(parseFloat(next.toFixed(2)));
    }

    const mape = mapeValues.length > 0
      ? parseFloat((mapeValues.reduce((a, b) => a + b, 0) / mapeValues.length * 100).toFixed(2))
      : 0;

    tf.dispose([x, y, xDiff, yDiff]);

    return {
      productId,
      method: ForecastMethod.LINEAR_REGRESSION,
      predictions: predictions.slice(-periods),
      mape,
      confidence: parseFloat(Math.max(0, Math.min(1, 1 - mape / 100)).toFixed(4)),
      metadata: { slope: parseFloat(slope.toFixed(4)), intercept: parseFloat(intercept.toFixed(4)), dataPoints: n },
    };
  }

  private seasonalDecomposition(productId: string, periods: number, data: number[], evaluate: boolean): ForecastResult {
    const seasonLength = 7;
    const predictions: number[] = [];
    const mapeValues: number[] = [];

    const seasonalFactors: number[] = [];
    for (let s = 0; s < seasonLength; s++) {
      const values = [];
      for (let i = s; i < data.length; i += seasonLength) {
        values.push(data[i]);
      }
      seasonalFactors.push(values.length > 0
        ? values.reduce((a, b) => a + b, 0) / values.length
        : 0);
    }

    const overallMean = data.reduce((a, b) => a + b, 0) / data.length;
    const seasonalIndices = seasonalFactors.map(f => overallMean > 0 ? f / overallMean : 1);

    const n = data.length;
    for (let i = 0; i < n; i++) {
      const deseasoned = data[i] / (seasonalIndices[i % seasonLength] || 1);
      predictions.push(parseFloat(deseasoned.toFixed(2)));
    }

    const trend = (data[n - 1] - data[0]) / (n || 1);
    for (let p = 1; p <= periods; p++) {
      const base = data[n - 1] + trend * p;
      const next = base * (seasonalIndices[(n + p - 1) % seasonLength] || 1);
      predictions.push(parseFloat(next.toFixed(2)));
    }

    for (let i = 0; i < n; i++) {
      if (predictions[i] > 0 && data[i] > 0) {
        mapeValues.push(Math.abs((data[i] - predictions[i]) / data[i]));
      }
    }

    const mape = mapeValues.length > 0
      ? parseFloat((mapeValues.reduce((a, b) => a + b, 0) / mapeValues.length * 100).toFixed(2))
      : 0;

    return {
      productId,
      method: ForecastMethod.SEASONAL_DECOMPOSITION,
      predictions: predictions.slice(-periods),
      mape,
      confidence: parseFloat(Math.max(0, Math.min(1, 1 - mape / 100)).toFixed(4)),
      metadata: { seasonLength, seasonalIndices: seasonalIndices.map(v => parseFloat(v.toFixed(4))), trend: parseFloat(trend.toFixed(4)) },
    };
  }

  private generateMockHistory(days: number): number[] {
    const data: number[] = [];
    let base = 100 + Math.random() * 50;
    for (let i = 0; i < days; i++) {
      base += (Math.random() - 0.48) * 10;
      const seasonality = 1 + Math.sin(i / 7 * Math.PI) * 0.15;
      data.push(Math.max(1, parseFloat((base * seasonality).toFixed(2))));
    }
    return data;
  }
}
