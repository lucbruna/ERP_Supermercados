import { Injectable, Logger } from '@nestjs/common';
import { IntentType } from './nlp.dto';

@Injectable()
export class NlpService {
  private readonly logger = new Logger(NlpService.name);

  private sentimentLexicon: Record<string, number> = {
    good: 1, great: 2, excellent: 3, amazing: 3, wonderful: 3,
    fantastic: 3, happy: 2, love: 3, perfect: 3, beautiful: 2,
    satisfied: 1, helpful: 1, nice: 1, pleased: 1, awesome: 3,
    bad: -1, terrible: -3, awful: -3, horrible: -3, poor: -2,
    disappointed: -2, angry: -3, frustrated: -3, hate: -3, ugly: -2,
    worst: -3, sad: -2, broken: -2, defective: -2, slow: -1,
    expensive: -1, rude: -2, complaint: -2, problem: -1, issue: -1,
    ok: 0, fine: 0, average: 0, decent: 0, regular: 0,
  };

  private intensifiers = ['very', 'extremely', 'incredibly', 'highly', 'really', 'absolutely', 'totally'];
  private negations = ['not', "isn't", "don't", "doesn't", "didn't", "wasn't", "weren't", "never", "no", "neither", "nor", "nothing"];

  private readonly productCategories = [
    { name: 'ALIMENTOS', keywords: ['arroz', 'feijão', 'óleo', 'açúcar', 'farinha', 'macarrão', 'alimento', 'comida', 'grão', 'enlatado', 'tempero', 'sal', 'café', 'chá'] },
    { name: 'BEBIDAS', keywords: ['bebida', 'refrigerante', 'suco', 'água', 'cerveja', 'vinho', 'leite', 'iogurte', 'energético', 'isotônico', 'drink'] },
    { name: 'LIMPEZA', keywords: ['sabão', 'detergente', 'limpador', 'desinfetante', 'cloro', 'amaciante', 'limpeza', 'multiuso', 'lustra-móveis', 'saponáceo'] },
    { name: 'HIGIENE', keywords: ['shampoo', 'condicionador', 'sabonete', 'pasta', 'desodorante', 'higiene', 'papel', 'higiênico', 'fralda', 'absorvente', 'preservativo'] },
    { name: 'HORTIFRUTI', keywords: ['fruta', 'verdura', 'legume', 'verde', 'hortaliça', 'batata', 'tomate', 'cebola', 'alface', 'cenoura', 'banana', 'maçã', 'laranja'] },
    { name: 'ACOUGUE', keywords: ['carne', 'frango', 'boi', 'porco', 'peixe', 'linguiça', 'salsicha', 'hambúrguer', 'açougue', 'bovina', 'suína'] },
    { name: 'PADARIA', keywords: ['pão', 'bolo', 'biscoito', 'torrada', 'pastel', 'salgado', 'doce', 'padaria', 'confeitaria'] },
    { name: 'LATICINIOS', keywords: ['queijo', 'manteiga', 'creme', 'requeijão', 'ricota', 'iogurte', 'coalhada', 'laticínio'] },
    { name: 'CONGELADOS', keywords: ['congelado', 'pizza', 'lasanha', 'sorvete', 'polpa', 'nugget', 'batata-frita'] },
    { name: 'PET_SHOP', keywords: ['ração', 'pet', 'cachorro', 'gato', 'animal', 'veterinário', 'petshop'] },
  ];

  async sentiment(text: string): Promise<{ sentiment: string; score: number; details: any }> {
    const words = text.toLowerCase().split(/\s+/);
    let score = 0;
    let wordCount = 0;
    const matchedWords: string[] = [];
    let negationActive = false;

    for (let i = 0; i < words.length; i++) {
      const word = words[i].replace(/[^a-zà-ú]/g, '');

      if (this.negations.includes(word)) {
        negationActive = true;
        continue;
      }

      if (this.intensifiers.includes(word)) {
        negationActive = false;
        continue;
      }

      if (this.sentimentLexicon[word] !== undefined) {
        let wordScore = this.sentimentLexicon[word];
        if (negationActive) {
          wordScore = -wordScore;
          negationActive = false;
        }
        if (i > 0 && this.intensifiers.includes(words[i - 1])) {
          wordScore *= 1.5;
        }
        score += wordScore;
        wordCount++;
        matchedWords.push(word);
      } else {
        negationActive = false;
      }
    }

    const avgScore = wordCount > 0 ? score / wordCount : 0;
    const normalizedScore = Math.max(-1, Math.min(1, avgScore));

    let sentiment: string;
    if (normalizedScore > 0.3) sentiment = 'positive';
    else if (normalizedScore < -0.3) sentiment = 'negative';
    else sentiment = 'neutral';

    return {
      sentiment,
      score: parseFloat(normalizedScore.toFixed(4)),
      details: {
        wordCount,
        matchedWords,
        rawScore: score,
      },
    };
  }

  async classify(text: string): Promise<{ intent: string; confidence: number }> {
    const lower = text.toLowerCase();

    const patterns: { regex: RegExp; intent: IntentType }[] = [
      { regex: /(quero|gostaria|comprar|pedir|comprei|compra|encomendar)/, intent: IntentType.ORDER },
      { regex: /(reclama|cancelar|devolver|trocar|problema|defeito|quebrou|não funcion|péssim)/, intent: IntentType.COMPLAINT },
      { regex: /(bom|ótimo|adorei|gostei|excelente|maravilha|recomendo)/, intent: IntentType.FEEDBACK },
      { regex: /(onde|como|quando|quanto|qual|por que|porque|preço|valor|horário|funciona)/, intent: IntentType.QUESTION },
    ];

    let bestScore = 0;
    let bestIntent = IntentType.OTHER;

    for (const pattern of patterns) {
      const matches = lower.match(pattern.regex);
      if (matches) {
        const score = matches.length / Math.max(1, lower.split(/\s+/).length);
        if (score > bestScore) {
          bestScore = score;
          bestIntent = pattern.intent;
        }
      }
    }

    return {
      intent: bestIntent,
      confidence: parseFloat(Math.min(1, bestScore * 3 + 0.3).toFixed(4)),
    };
  }

  async keywords(text: string, stopWords?: string[]): Promise<{ keywords: string[]; scores: Record<string, number> }> {
    const defaultStopWords = ['de', 'da', 'do', 'em', 'para', 'com', 'um', 'uma', 'os', 'as', 'que', 'é', 'tem',
      'o', 'a', 'e', 'não', 'se', 'por', 'mais', 'como', 'ao', 'dos', 'das', 'na', 'no', 'mas', 'foi', 'também',
      'está', 'pode', 'ser', 'são', 'ou', 'muito', 'já', 'até', 'ele', 'ela', 'the', 'a', 'an', 'in', 'to', 'of',
      'for', 'with', 'on', 'at', 'from', 'by', 'is', 'it', 'and', 'or', 'not', 'this', 'that', 'i', 'you', 'we'];

    const stopSet = new Set([...defaultStopWords, ...(stopWords || [])]);
    const lower = text.toLowerCase().replace(/[^a-zà-ú\s]/g, '');
    const words = lower.split(/\s+/).filter(w => w.length > 2 && !stopSet.has(w));

    const freq: Record<string, number> = {};
    for (const word of words) {
      freq[word] = (freq[word] || 0) + 1;
    }

    const maxFreq = Math.max(...Object.values(freq), 1);
    const scores: Record<string, number> = {};
    for (const [word, count] of Object.entries(freq)) {
      scores[word] = parseFloat((count / maxFreq).toFixed(4));
    }

    const sorted = Object.entries(scores)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 15)
      .map(([word]) => word);

    return { keywords: sorted, scores };
  }

  async summarize(text: string): Promise<{ summary: string; originalLength: number }> {
    const sentences = text.match(/[^.!?\n]+[.!?\n]*/g) || [text];
    if (sentences.length <= 3) {
      return { summary: text.trim(), originalLength: text.length };
    }

    const wordFreq: Record<string, number> = {};
    const allWords = text.toLowerCase().replace(/[^a-zà-ú\s]/g, '').split(/\s+/);
    for (const w of allWords) {
      if (w.length > 2) wordFreq[w] = (wordFreq[w] || 0) + 1;
    }
    const maxFreq = Math.max(...Object.values(wordFreq), 1);

    const scored = sentences.map((sentence, idx) => {
      const words = sentence.toLowerCase().replace(/[^a-zà-ú\s]/g, '').split(/\s+/).filter(w => w.length > 2);
      const score = words.reduce((sum, w) => sum + (wordFreq[w] || 0) / maxFreq, 0) / Math.max(1, words.length);
      return { sentence: sentence.trim(), score: idx === 0 ? score * 1.2 : score, idx };
    });

    const topSentences = scored
      .sort((a, b) => b.score - a.score)
      .slice(0, Math.max(2, Math.ceil(sentences.length / 3)))
      .sort((a, b) => a.idx - b.idx)
      .map(s => s.sentence);

    return {
      summary: topSentences.join(' '),
      originalLength: text.length,
    };
  }

  async categorizeProduct(name: string, description?: string): Promise<{
    category: string;
    confidence: number;
    alternatives: { category: string; score: number }[];
  }> {
    const combined = `${name} ${description || ''}`.toLowerCase();
    const scores: { category: string; score: number }[] = [];

    for (const cat of this.productCategories) {
      let score = 0;
      for (const kw of cat.keywords) {
        if (combined.includes(kw)) {
          score += 1;
        }
        if (name.toLowerCase().includes(kw)) {
          score += 2;
        }
      }
      score = score / Math.max(1, cat.keywords.length);
      if (score > 0) {
        scores.push({ category: cat.name, score: parseFloat(score.toFixed(4)) });
      }
    }

    scores.sort((a, b) => b.score - a.score);

    if (scores.length === 0) {
      scores.push({ category: 'OUTROS', score: 0.1 });
    }

    const maxScore = scores.length > 0 ? Math.max(...scores.map(s => s.score), 0.01) : 1;

    return {
      category: scores[0]?.category || 'OUTROS',
      confidence: parseFloat(Math.min(1, scores[0]?.score / maxScore || 0.3).toFixed(4)),
      alternatives: scores.slice(0, 3).map(s => ({
        category: s.category,
        score: parseFloat((s.score / maxScore).toFixed(4)),
      })),
    };
  }
}
