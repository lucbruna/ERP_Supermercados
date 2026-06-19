import { Injectable, Logger } from '@nestjs/common';

interface Entrega {
  enderecoId: string;
  endereco: string;
  latitude?: number;
  longitude?: number;
  peso?: number;
  volume?: number;
}

interface RotaOtimizada {
  entregas: Entrega[];
  distanciaKm: number;
  tempoEstimado: number;
  custoFrete: number;
}

@Injectable()
export class RoteirizadorService {
  private readonly logger = new Logger(RoteirizadorService.name);

  async optimizeRoute(
    origemUnidadeId: string,
    entregas: Entrega[],
    veiculo: { capacidadeKg: number; capacidadeM3: number },
  ): Promise<RotaOtimizada> {
    this.logger.log(`Optimizing route from unit ${origemUnidadeId} with ${entregas.length} stops`);

    const ordered = [...entregas];
    const distanciaKm = this.calcularDistanciaTotal(ordered);
    const velocidadeMedia = 40;
    const tempoEstimado = Math.ceil(distanciaKm / velocidadeMedia);
    const custoPorKm = 3.5;
    const custoFrete = parseFloat((distanciaKm * custoPorKm).toFixed(2));
    const pesoTotal = ordered.reduce((sum, e) => sum + (e.peso || 0), 0);
    const volumeTotal = ordered.reduce((sum, e) => sum + (e.volume || 0), 0);

    if (pesoTotal > veiculo.capacidadeKg) {
      this.logger.warn(`Total weight ${pesoTotal}kg exceeds vehicle capacity ${veiculo.capacidadeKg}kg`);
    }
    if (volumeTotal > veiculo.capacidadeM3) {
      this.logger.warn(`Total volume ${volumeTotal}m³ exceeds vehicle capacity ${veiculo.capacidadeM3}m³`);
    }

    return {
      entregas: ordered,
      distanciaKm: parseFloat(distanciaKm.toFixed(2)),
      tempoEstimado,
      custoFrete,
    };
  }

  private calcularDistanciaTotal(entregas: Entrega[]): number {
    if (entregas.length === 0) return 0;
    let total = 0;
    for (let i = 1; i < entregas.length; i++) {
      total += this.distanciaEntrePontos(entregas[i - 1], entregas[i]);
    }
    total += this.distanciaEntrePontos(entregas[entregas.length - 1], entregas[0]);
    return total;
  }

  private distanciaEntrePontos(a: Entrega, b: Entrega): number {
    if (a.latitude && a.longitude && b.latitude && b.longitude) {
      const R = 6371;
      const dLat = this.deg2Rad(b.latitude - a.latitude);
      const dLon = this.deg2Rad(b.longitude - a.longitude);
      const lat1 = this.deg2Rad(a.latitude);
      const lat2 = this.deg2Rad(b.latitude);
      const sinDLat = Math.sin(dLat / 2);
      const sinDLon = Math.sin(dLon / 2);
      const aCalc = sinDLat * sinDLat + sinDLon * sinDLon * Math.cos(lat1) * Math.cos(lat2);
      const c = 2 * Math.atan2(Math.sqrt(aCalc), Math.sqrt(1 - aCalc));
      return R * c;
    }
    return 10 + Math.random() * 20;
  }

  private deg2Rad(deg: number): number {
    return deg * (Math.PI / 180);
  }
}
