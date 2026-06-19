import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding fiscal service database...');

  const cfops = [
    { codigo: '1101', descricao: 'Compra para industrialização', tipo: 'ENTRADA', aplicacao: 'Industrial' },
    { codigo: '1102', descricao: 'Compra para comercialização', tipo: 'ENTRADA', aplicacao: 'Comercial' },
    { codigo: '1111', descricao: 'Compra para industrialização em operação com mercadoria sujeita ao regime de substituição tributária', tipo: 'ENTRADA', aplicacao: 'Industrial' },
    { codigo: '1407', descricao: 'Compra de mercadoria para comercialização em operação interestadual com benefício fiscal', tipo: 'ENTRADA', aplicacao: 'Comercial' },
    { codigo: '2101', descricao: 'Compra para industrialização em operação interestadual', tipo: 'ENTRADA', aplicacao: 'Industrial Interestadual' },
    { codigo: '2102', descricao: 'Compra para comercialização em operação interestadual', tipo: 'ENTRADA', aplicacao: 'Comercial Interestadual' },
    { codigo: '3101', descricao: 'Compra para industrialização em operação interestadual com ST', tipo: 'ENTRADA', aplicacao: 'Industrial' },
    { codigo: '5101', descricao: 'Venda de produção do estabelecimento', tipo: 'SAIDA', aplicacao: 'Industrial' },
    { codigo: '5102', descricao: 'Venda de mercadoria adquirida ou recebida de terceiros', tipo: 'SAIDA', aplicacao: 'Comercial' },
    { codigo: '5103', descricao: 'Venda de produção do estabelecimento em operação com mercadoria sujeita a ST', tipo: 'SAIDA', aplicacao: 'Industrial' },
    { codigo: '5104', descricao: 'Venda de mercadoria adquirida ou recebida de terceiros em operação com mercadoria sujeita a ST', tipo: 'SAIDA', aplicacao: 'Comercial' },
    { codigo: '5111', descricao: 'Venda de produção do estabelecimento fora do estabelecimento', tipo: 'SAIDA', aplicacao: 'Industrial' },
    { codigo: '5115', descricao: 'Venda de mercadoria do ativo imobilizado', tipo: 'SAIDA', aplicacao: 'Ativo Imobilizado' },
    { codigo: '5401', descricao: 'Venda de produção do estabelecimento em operação interestadual', tipo: 'SAIDA', aplicacao: 'Industrial Interestadual' },
    { codigo: '5402', descricao: 'Venda de mercadoria adquirida ou recebida de terceiros em operação interestadual', tipo: 'SAIDA', aplicacao: 'Comercial Interestadual' },
    { codigo: '5403', descricao: 'Venda de produção do estabelecimento em operação interestadual com ST', tipo: 'SAIDA', aplicacao: 'Industrial' },
    { codigo: '5656', descricao: 'Venda de mercadoria para consumidor final não contribuinte', tipo: 'SAIDA', aplicacao: 'Varejo' },
    { codigo: '5932', descricao: 'Venda de mercadoria para consumidor final não contribuinte em operação interestadual', tipo: 'SAIDA', aplicacao: 'Varejo Interestadual' },
    { codigo: '6101', descricao: 'Venda de produção do estabelecimento para contribuinte', tipo: 'SAIDA', aplicacao: 'Industrial' },
    { codigo: '6102', descricao: 'Venda de mercadoria adquirida para contribuinte', tipo: 'SAIDA', aplicacao: 'Comercial' },
    { codigo: '6107', descricao: 'Venda de produção do estabelecimento para não contribuinte', tipo: 'SAIDA', aplicacao: 'Industrial' },
    { codigo: '6401', descricao: 'Venda de produção do estabelecimento para contribuinte interestadual', tipo: 'SAIDA', aplicacao: 'Interestadual' },
    { codigo: '6403', descricao: 'Venda de produção do estabelecimento para não contribuinte interestadual', tipo: 'SAIDA', aplicacao: 'Interestadual' },
    { codigo: '6923', descricao: 'Remessa de mercadoria para venda fora do estabelecimento', tipo: 'SAIDA', aplicacao: 'Remessa' },
    { codigo: '6924', descricao: 'Remessa de mercadoria para venda fora do estabelecimento interestadual', tipo: 'SAIDA', aplicacao: 'Remessa Interestadual' },
    { codigo: '1401', descricao: 'Compra para industrialização em operação com benefício fiscal', tipo: 'ENTRADA', aplicacao: 'Industrial' },
    { codigo: '1403', descricao: 'Compra para comercialização em operação com benefício fiscal', tipo: 'ENTRADA', aplicacao: 'Comercial' },
    { codigo: '2201', descricao: 'Devolução de venda de produção do estabelecimento', tipo: 'ENTRADA', aplicacao: 'Devolução' },
    { codigo: '2202', descricao: 'Devolução de venda de mercadoria adquirida', tipo: 'ENTRADA', aplicacao: 'Devolução' },
    { codigo: '6201', descricao: 'Devolução de compra para industrialização', tipo: 'SAIDA', aplicacao: 'Devolução' },
    { codigo: '6202', descricao: 'Devolução de compra para comercialização', tipo: 'SAIDA', aplicacao: 'Devolução' },
    { codigo: '1201', descricao: 'Devolução de venda de produção interestadual', tipo: 'ENTRADA', aplicacao: 'Devolução Interestadual' },
    { codigo: '1901', descricao: 'Entrada de mercadoria para industrialização por conta e ordem', tipo: 'ENTRADA', aplicacao: 'Industrial' },
    { codigo: '1902', descricao: 'Entrada de mercadoria para comercialização por conta e ordem', tipo: 'ENTRADA', aplicacao: 'Comercial' },
    { codigo: '5901', descricao: 'Remessa para industrialização por conta e ordem', tipo: 'SAIDA', aplicacao: 'Industrial' },
    { codigo: '5902', descricao: 'Remessa para comercialização por conta e ordem', tipo: 'SAIDA', aplicacao: 'Comercial' },
    { codigo: '6910', descricao: 'Remessa de bem do ativo imobilizado', tipo: 'SAIDA', aplicacao: 'Ativo Imobilizado' },
    { codigo: '6911', descricao: 'Remessa de bem do ativo imobilizado interestadual', tipo: 'SAIDA', aplicacao: 'Ativo Imobilizado Interestadual' },
    { codigo: '1949', descricao: 'Outras entradas de mercadorias', tipo: 'ENTRADA', aplicacao: 'Outros' },
    { codigo: '5949', descricao: 'Outras saídas de mercadorias', tipo: 'SAIDA', aplicacao: 'Outros' },
    { codigo: '1601', descricao: 'Entrada para industrialização por encomenda', tipo: 'ENTRADA', aplicacao: 'Industrial' },
    { codigo: '5601', descricao: 'Remessa para industrialização por encomenda', tipo: 'SAIDA', aplicacao: 'Industrial' },
    { codigo: '1602', descricao: 'Entrada para conserto', tipo: 'ENTRADA', aplicacao: 'Serviço' },
    { codigo: '5602', descricao: 'Remessa para conserto', tipo: 'SAIDA', aplicacao: 'Serviço' },
    { codigo: '1916', descricao: 'Entrada de mercadoria em armazém geral', tipo: 'ENTRADA', aplicacao: 'Armazenagem' },
    { codigo: '5916', descricao: 'Remessa para armazém geral', tipo: 'SAIDA', aplicacao: 'Armazenagem' },
    { codigo: '1202', descricao: 'Devolução de venda de mercadoria adquirida interestadual', tipo: 'ENTRADA', aplicacao: 'Devolução Interestadual' },
    { codigo: '1411', descricao: 'Compra para industrialização em operação interestadual com benefício fiscal', tipo: 'ENTRADA', aplicacao: 'Industrial Interestadual' },
    { codigo: '2411', descricao: 'Compra para comercialização em operação interestadual com benefício fiscal', tipo: 'ENTRADA', aplicacao: 'Comercial Interestadual' },
    { codigo: '5411', descricao: 'Venda de produção do estabelecimento em operação interestadual com benefício fiscal', tipo: 'SAIDA', aplicacao: 'Industrial Interestadual' },
    { codigo: '5412', descricao: 'Venda de mercadoria adquirida em operação interestadual com benefício fiscal', tipo: 'SAIDA', aplicacao: 'Comercial Interestadual' },
    { codigo: '5405', descricao: 'Venda de produção do estabelecimento para consumidor final não contribuinte interestadual', tipo: 'SAIDA', aplicacao: 'Varejo Interestadual' },
  ];

  for (const cfop of cfops) {
    const exists = await prisma.cfop.findUnique({ where: { codigo: cfop.codigo } });
    if (!exists) {
      await prisma.cfop.create({ data: cfop });
      console.log(`CFOP ${cfop.codigo} criado: ${cfop.descricao}`);
    }
  }

  console.log(`Total CFOPs: ${cfops.length}`);
  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
