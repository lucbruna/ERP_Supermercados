import { Injectable, Logger } from '@nestjs/common';

export interface DeteccaoAI {
  tipo: string;
  confianca: number;
  boundingBox?: { x: number; y: number; width: number; height: number };
  metadata?: Record<string, any>;
}

export interface AnaliseFrame {
  deteccoes: DeteccaoAI[];
  reconhecimentoFacial?: { nome?: string; confianca: number; desconhecido: boolean };
  leituraPlaca?: { placa: string; confianca: number };
  tempoProcessamento: number;
}

@Injectable()
export class AiDetectionService {
  private readonly logger = new Logger(AiDetectionService.name);

  async analisarFrame(imageBase64: string, cameraConfig?: {
    tipo?: string;
    deteccoes?: string[];
  }): Promise<AnaliseFrame> {
    const inicio = Date.now();

    const deteccoes: DeteccaoAI[] = [];
    const tiposAtivos = cameraConfig?.deteccoes || ['MOVIMENTO_SUSPEITO'];

    for (const tipo of tiposAtivos) {
      const detectado = Math.random() > 0.7;
      if (detectado) {
        deteccoes.push({
          tipo,
          confianca: 0.75 + Math.random() * 0.2,
          boundingBox: {
            x: Math.random() * 800,
            y: Math.random() * 600,
            width: 50 + Math.random() * 200,
            height: 50 + Math.random() * 300,
          },
        });
      }
    }

    const analise: AnaliseFrame = {
      deteccoes,
      tempoProcessamento: Date.now() - inicio,
    };

    if (cameraConfig?.tipo === 'FACIAL' && Math.random() > 0.8) {
      analise.reconhecimentoFacial = {
        nome: Math.random() > 0.5 ? 'Cliente Exemplo' : undefined,
        confianca: 0.8 + Math.random() * 0.15,
        desconhecido: Math.random() > 0.5,
      };
    }

    if (cameraConfig?.tipo === 'PLACA' && Math.random() > 0.7) {
      const letras = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      const numeros = '0123456789';
      analise.leituraPlaca = {
        placa: `${letras[Math.floor(Math.random() * 26)]}${letras[Math.floor(Math.random() * 26)]}${letras[Math.floor(Math.random() * 26)]}${numeros[Math.floor(Math.random() * 10)]}${numeros[Math.floor(Math.random() * 10)]}${numeros[Math.floor(Math.random() * 10)]}${numeros[Math.floor(Math.random() * 10)]}`,
        confianca: 0.7 + Math.random() * 0.25,
      };
    }

    return analise;
  }

  async reconhecerFace(imageBase64: string): Promise<{
    nome?: string;
    confianca: number;
    desconhecido: boolean;
  }> {
    await this.delay(100);
    return {
      nome: Math.random() > 0.4 ? 'Funcionário Exemplo' : undefined,
      confianca: 0.75 + Math.random() * 0.2,
      desconhecido: Math.random() > 0.6,
    };
  }

  async lerPlaca(imageBase64: string): Promise<{
    placa: string;
    confianca: number;
  } | null> {
    await this.delay(80);

    if (Math.random() > 0.3) {
      const letras = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      const numeros = '0123456789';
      return {
        placa: `${letras[Math.floor(Math.random() * 26)]}${letras[Math.floor(Math.random() * 26)]}${letras[Math.floor(Math.random() * 26)]}${numeros[Math.floor(Math.random() * 10)]}${numeros[Math.floor(Math.random() * 10)]}${numeros[Math.floor(Math.random() * 10)]}${numeros[Math.floor(Math.random() * 10)]}`,
        confianca: 0.7 + Math.random() * 0.25,
      };
    }
    return null;
  }

  async detectarMovimento(frameBase64: string, frameAnterior?: string): Promise<{
    detectado: boolean;
    nivel: number;
  }> {
    await this.delay(50);
    return {
      detectado: Math.random() > 0.6,
      nivel: Math.random(),
    };
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
