import { Injectable, Logger } from '@nestjs/common';

export interface ChatResponse {
  intent: string;
  confidence: number;
  response: string;
  suggestions?: string[];
  metadata?: Record<string, any>;
}

@Injectable()
export class ChatbotService {
  private readonly logger = new Logger(ChatbotService.name);

  private readonly storeHours = {
    weekday: '07:00 - 22:00',
    saturday: '08:00 - 21:00',
    sunday: '08:00 - 18:00',
    holidays: '09:00 - 15:00',
  };

  private readonly storeLocations = [
    { name: 'Matriz Centro', address: 'Rua XV de Novembro, 150 - Centro', phone: '(41) 3333-1000' },
    { name: 'Filial Batel', address: 'Av. Batel, 890 - Batel', phone: '(41) 3333-2000' },
    { name: 'Filial Água Verde', address: 'Rua Comendador Araújo, 500 - Água Verde', phone: '(41) 3333-3000' },
  ];

  private readonly productKnowledge: Record<string, { name: string; section: string; price: number; stock: string }> = {
    'arroz': { name: 'Arroz 5kg', section: 'Corredor 3 - Alimentos', price: 24.90, stock: 'Em estoque' },
    'feijão': { name: 'Feijão 1kg', section: 'Corredor 3 - Alimentos', price: 8.90, stock: 'Em estoque' },
    'leite': { name: 'Leite Integral 1L', section: 'Corredor 5 - Laticínios', price: 4.50, stock: 'Alto estoque' },
    'café': { name: 'Café Torrado 500g', section: 'Corredor 3 - Alimentos', price: 15.90, stock: 'Em estoque' },
    'carne': { name: 'Carne Bovina kg', section: 'Açougue', price: 39.90, stock: 'Fresco diário' },
    'frango': { name: 'Frango Resfriado kg', section: 'Açougue', price: 15.90, stock: 'Fresco diário' },
    'óleo': { name: 'Óleo de Soja 900ml', section: 'Corredor 3 - Alimentos', price: 6.50, stock: 'Em estoque' },
    'sabão': { name: 'Sabão em Pó 1kg', section: 'Corredor 7 - Limpeza', price: 11.90, stock: 'Em estoque' },
    'cerveja': { name: 'Cerveja Lata 350ml', section: 'Corredor 6 - Bebidas', price: 3.90, stock: 'Alto estoque' },
    'pão': { name: 'Pão Francês un', section: 'Padaria', price: 0.80, stock: 'Produção contínua' },
  };

  async processMessage(message: string, sessionId: string): Promise<ChatResponse> {
    const lower = message.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    const intents: { pattern: RegExp; handler: () => ChatResponse }[] = [
      { pattern: /(onde|localizar|encontrar|corredor|secao|seção|prateleira)/, handler: () => this.handleProductSearch(lower) },
      { pattern: /(quanto|preco|preço|valor|custa|valor)/, handler: () => this.handlePriceQuery(lower) },
      { pattern: /(estoque|tem\s|disponivel|disponível|falta|acabou)/, handler: () => this.handleStockQuery(lower) },
      { pattern: /(pedido|compra|entrega|status|rastreio|chegou)/, handler: () => this.handleOrderStatus() },
      { pattern: /(horario|horário|abre|fecha|funciona|aberto)/, handler: () => this.handleStoreHours() },
      { pattern: /(endereco|endereço|local|filial|matriz|unidade|telefone)/, handler: () => this.handleStoreLocations() },
      { pattern: /(ola|olá|oi|bom dia|boa tarde|boa noite|hey|saudações)/, handler: () => this.handleGreeting() },
      { pattern: /(obrigado|valeu|brigado|agradecido|thanks)/, handler: () => this.handleThanks() },
    ];

    let bestScore = 0;
    let bestResponse: ChatResponse | null = null;

    for (const intent of intents) {
      const matches = lower.match(intent.pattern);
      if (matches) {
        const score = matches[0].length / Math.max(1, lower.length);
        if (score > bestScore) {
          bestScore = score;
          bestResponse = intent.handler();
        }
      }
    }

    if (bestResponse) {
      bestResponse.confidence = parseFloat(Math.min(1, bestScore * 2 + 0.3).toFixed(4));
      return bestResponse;
    }

    return {
      intent: 'unknown',
      confidence: 0.2,
      response: 'Desculpe, não entendi sua pergunta. Você pode perguntar sobre: produtos, preços, estoque, pedidos, horários ou localização das lojas.',
      suggestions: [
        'Qual o preço do arroz?',
        'Onde encontro café?',
        'Tem leite em estoque?',
        'Qual o horário de funcionamento?',
      ],
    };
  }

  private handleProductSearch(lower: string): ChatResponse {
    for (const [key, product] of Object.entries(this.productKnowledge)) {
      if (lower.includes(key)) {
        return {
          intent: 'product_search',
          confidence: 0.9,
          response: `${product.name} está no ${product.section}. Preço: R$ ${product.price.toFixed(2)}. ${product.stock}.`,
          metadata: { product: product.name, section: product.section, price: product.price },
        };
      }
    }
    return {
      intent: 'product_search',
      confidence: 0.6,
      response: 'Não encontrei este produto específico. Você pode buscar por: arroz, feijão, leite, café, carne, frango, óleo, sabão, cerveja ou pão.',
      suggestions: ['Onde encontro café?', 'Onde fica o açougue?'],
    };
  }

  private handlePriceQuery(lower: string): ChatResponse {
    for (const [key, product] of Object.entries(this.productKnowledge)) {
      if (lower.includes(key)) {
        return {
          intent: 'price_query',
          confidence: 0.9,
          response: `${product.name} custa R$ ${product.price.toFixed(2)}.`,
          metadata: { product: product.name, price: product.price },
        };
      }
    }
    return {
      intent: 'price_query',
      confidence: 0.5,
      response: 'Para qual produto você quer saber o preço? Temos arroz (R$24,90), feijão (R$8,90), leite (R$4,50), café (R$15,90) e muitos outros.',
      suggestions: ['Quanto custa o arroz?', 'Preço do café'],
    };
  }

  private handleStockQuery(lower: string): ChatResponse {
    for (const [key, product] of Object.entries(this.productKnowledge)) {
      if (lower.includes(key)) {
        return {
          intent: 'stock_query',
          confidence: 0.9,
          response: `${product.name}: ${product.stock}. Localizado no ${product.section}.`,
          metadata: { product: product.name, stock: product.stock, section: product.section },
        };
      }
    }
    return {
      intent: 'stock_query',
      confidence: 0.5,
      response: 'A maioria dos nossos produtos está em estoque. Para verificar um item específico, me diga qual produto você procura.',
      suggestions: ['Tem leite?', 'Arroz está disponível?'],
    };
  }

  private handleOrderStatus(): ChatResponse {
    return {
      intent: 'order_status',
      confidence: 0.85,
      response: 'Para consultar o status do seu pedido, preciso do número do pedido. Você pode informá-lo ou acessar nossa central de atendimento pelo telefone (41) 3333-1000.',
      suggestions: ['Meu pedido chegou?', 'Status da entrega'],
      metadata: { status: 'need_order_id' },
    };
  }

  private handleStoreHours(): ChatResponse {
    return {
      intent: 'store_hours',
      confidence: 0.95,
      response: `Nossos horários de funcionamento:\n• Segunda a Sexta: ${this.storeHours.weekday}\n• Sábado: ${this.storeHours.saturday}\n• Domingo: ${this.storeHours.sunday}\n• Feriados: ${this.storeHours.holidays}`,
      metadata: this.storeHours,
    };
  }

  private handleStoreLocations(): ChatResponse {
    const locs = this.storeLocations.map(l => `• ${l.name}: ${l.address} - Tel: ${l.phone}`).join('\n');
    return {
      intent: 'store_locations',
      confidence: 0.95,
      response: `Temos as seguintes lojas:\n${locs}\n\nTodas abertas no mesmo horário.`,
      metadata: { locations: this.storeLocations },
    };
  }

  private handleGreeting(): ChatResponse {
    const hour = new Date().getHours();
    let greeting: string;
    if (hour < 12) greeting = 'Bom dia!';
    else if (hour < 18) greeting = 'Boa tarde!';
    else greeting = 'Boa noite!';

    return {
      intent: 'greeting',
      confidence: 1.0,
      response: `${greeting} Como posso ajudar? Pergunte sobre:\n• Produtos e localização\n• Preços\n• Estoque\n• Pedidos\n• Horários e lojas`,
      suggestions: [
        'Onde encontro arroz?',
        'Qual o horário de funcionamento?',
        'Quanto custa o café?',
      ],
    };
  }

  private handleThanks(): ChatResponse {
    return {
      intent: 'thanks',
      confidence: 0.95,
      response: 'Por nada! Estou aqui para ajudar. Se precisar de mais alguma informação, é só perguntar.',
      suggestions: ['Qual o preço do feijão?', 'Endereço das lojas'],
    };
  }
}
