import { PrismaClient, WorkflowCategoria, EstadoTipo } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding workflow definitions...');

  await seedAprovacaoPedidoCompra();
  await seedProcessoAdmissao();
  await seedAprovacaoCredito();
  await seedSolicitacaoFerias();

  console.log('Seeding completed.');
}

async function seedAprovacaoPedidoCompra() {
  const existing = await prisma.workflow.findFirst({
    where: { nome: 'Aprovação de Pedido de Compra' },
  });
  if (existing) {
    console.log('Workflow "Aprovação de Pedido de Compra" already exists, skipping.');
    return;
  }

  const workflow = await prisma.workflow.create({
    data: {
      nome: 'Aprovação de Pedido de Compra',
      descricao: 'Fluxo de aprovação de pedidos de compra',
      categoria: WorkflowCategoria.COMPRAS,
      ativo: true,
      versao: 1,
    },
  });

  const solicitado = await prisma.workflowEstado.create({
    data: { workflowId: workflow.id, nome: 'Solicitado', tipo: EstadoTipo.INICIAL, ordem: 0 },
  });
  const aprovado = await prisma.workflowEstado.create({
    data: { workflowId: workflow.id, nome: 'Aprovado', tipo: EstadoTipo.APROVACAO, ordem: 1 },
  });
  const rejeitado = await prisma.workflowEstado.create({
    data: { workflowId: workflow.id, nome: 'Rejeitado', tipo: EstadoTipo.REJEICAO, ordem: 2 },
  });
  const finalizado = await prisma.workflowEstado.create({
    data: { workflowId: workflow.id, nome: 'Finalizado', tipo: EstadoTipo.FINAL, ordem: 3 },
  });

  await prisma.workflowTransicao.create({
    data: {
      workflowId: workflow.id,
      estadoOrigemId: solicitado.id,
      estadoDestinoId: aprovado.id,
      nome: 'Aprovar',
      condicaoJson: { campo: 'valorTotal', operador: 'lessThanOrEqual', valor: 50000 },
      acaoJson: [
        { tipo: 'NOTIFICACAO', config: { mensagem: 'Pedido aprovado', destino: 'solicitante' } },
        { tipo: 'ATUALIZACAO_CAMPO', config: { campo: 'status', valor: 'APROVADO' } },
      ],
    },
  });
  await prisma.workflowTransicao.create({
    data: {
      workflowId: workflow.id,
      estadoOrigemId: solicitado.id,
      estadoDestinoId: rejeitado.id,
      nome: 'Rejeitar',
      acaoJson: [
        { tipo: 'NOTIFICACAO', config: { mensagem: 'Pedido rejeitado', destino: 'solicitante' } },
        { tipo: 'ATUALIZACAO_CAMPO', config: { campo: 'status', valor: 'REJEITADO' } },
      ],
    },
  });
  await prisma.workflowTransicao.create({
    data: {
      workflowId: workflow.id,
      estadoOrigemId: aprovado.id,
      estadoDestinoId: finalizado.id,
      nome: 'Finalizar',
      acaoJson: [
        { tipo: 'NOTIFICACAO', config: { mensagem: 'Compra finalizada', destino: 'solicitante' } },
        { tipo: 'ATUALIZACAO_CAMPO', config: { campo: 'status', valor: 'FINALIZADO' } },
      ],
    },
  });
  await prisma.workflowTransicao.create({
    data: {
      workflowId: workflow.id,
      estadoOrigemId: rejeitado.id,
      estadoDestinoId: finalizado.id,
      nome: 'Arquivar',
    },
  });

  console.log('Created: Aprovação de Pedido de Compra');
}

async function seedProcessoAdmissao() {
  const existing = await prisma.workflow.findFirst({
    where: { nome: 'Processo de Admissão' },
  });
  if (existing) {
    console.log('Workflow "Processo de Admissão" already exists, skipping.');
    return;
  }

  const workflow = await prisma.workflow.create({
    data: {
      nome: 'Processo de Admissão',
      descricao: 'Fluxo completo de admissão de colaboradores',
      categoria: WorkflowCategoria.RH,
      ativo: true,
      versao: 1,
    },
  });

  const triagem = await prisma.workflowEstado.create({
    data: { workflowId: workflow.id, nome: 'Triagem', tipo: EstadoTipo.INICIAL, ordem: 0 },
  });
  const entrevista = await prisma.workflowEstado.create({
    data: { workflowId: workflow.id, nome: 'Entrevista', tipo: EstadoTipo.INTERMEDIARIO, ordem: 1 },
  });
  const documentos = await prisma.workflowEstado.create({
    data: { workflowId: workflow.id, nome: 'Documentos', tipo: EstadoTipo.INTERMEDIARIO, ordem: 2 },
  });
  const exame = await prisma.workflowEstado.create({
    data: { workflowId: workflow.id, nome: 'Exame', tipo: EstadoTipo.INTERMEDIARIO, ordem: 3 },
  });
  const contrato = await prisma.workflowEstado.create({
    data: { workflowId: workflow.id, nome: 'Contrato', tipo: EstadoTipo.INTERMEDIARIO, ordem: 4 },
  });
  const finalizado = await prisma.workflowEstado.create({
    data: { workflowId: workflow.id, nome: 'Finalizado', tipo: EstadoTipo.FINAL, ordem: 5 },
  });

  await prisma.workflowTransicao.create({
    data: { workflowId: workflow.id, estadoOrigemId: triagem.id, estadoDestinoId: entrevista.id, nome: 'Agendar Entrevista' },
  });
  await prisma.workflowTransicao.create({
    data: { workflowId: workflow.id, estadoOrigemId: entrevista.id, estadoDestinoId: documentos.id, nome: 'Solicitar Documentos' },
  });
  await prisma.workflowTransicao.create({
    data: { workflowId: workflow.id, estadoOrigemId: documentos.id, estadoDestinoId: exame.id, nome: 'Agendar Exame' },
  });
  await prisma.workflowTransicao.create({
    data: { workflowId: workflow.id, estadoOrigemId: exame.id, estadoDestinoId: contrato.id, nome: 'Preparar Contrato' },
  });
  await prisma.workflowTransicao.create({
    data: { workflowId: workflow.id, estadoOrigemId: contrato.id, estadoDestinoId: finalizado.id, nome: 'Finalizar Admissão' },
  });

  console.log('Created: Processo de Admissão');
}

async function seedAprovacaoCredito() {
  const existing = await prisma.workflow.findFirst({
    where: { nome: 'Aprovação de Crédito' },
  });
  if (existing) {
    console.log('Workflow "Aprovação de Crédito" already exists, skipping.');
    return;
  }

  const workflow = await prisma.workflow.create({
    data: {
      nome: 'Aprovação de Crédito',
      descricao: 'Fluxo de análise e aprovação de crédito',
      categoria: WorkflowCategoria.FINANCEIRO,
      ativo: true,
      versao: 1,
    },
  });

  const solicitado = await prisma.workflowEstado.create({
    data: { workflowId: workflow.id, nome: 'Solicitado', tipo: EstadoTipo.INICIAL, ordem: 0 },
  });
  const analise = await prisma.workflowEstado.create({
    data: { workflowId: workflow.id, nome: 'Análise', tipo: EstadoTipo.INTERMEDIARIO, ordem: 1 },
  });
  const aprovado = await prisma.workflowEstado.create({
    data: { workflowId: workflow.id, nome: 'Aprovado', tipo: EstadoTipo.APROVACAO, ordem: 2 },
  });
  const negado = await prisma.workflowEstado.create({
    data: { workflowId: workflow.id, nome: 'Negado', tipo: EstadoTipo.REJEICAO, ordem: 3 },
  });
  const finalizado = await prisma.workflowEstado.create({
    data: { workflowId: workflow.id, nome: 'Finalizado', tipo: EstadoTipo.FINAL, ordem: 4 },
  });

  await prisma.workflowTransicao.create({
    data: {
      workflowId: workflow.id,
      estadoOrigemId: solicitado.id,
      estadoDestinoId: analise.id,
      nome: 'Iniciar Análise',
    },
  });
  await prisma.workflowTransicao.create({
    data: {
      workflowId: workflow.id,
      estadoOrigemId: analise.id,
      estadoDestinoId: aprovado.id,
      nome: 'Aprovar Crédito',
      condicaoJson: { campo: 'scoreCredito', operador: 'greaterThanOrEqual', valor: 600 },
      acaoJson: [
        { tipo: 'NOTIFICACAO', config: { mensagem: 'Crédito aprovado', destino: 'cliente' } },
        { tipo: 'ATUALIZACAO_CAMPO', config: { campo: 'limiteCredito', valor: 10000 } },
      ],
    },
  });
  await prisma.workflowTransicao.create({
    data: {
      workflowId: workflow.id,
      estadoOrigemId: analise.id,
      estadoDestinoId: negado.id,
      nome: 'Negar Crédito',
      condicaoJson: { campo: 'scoreCredito', operador: 'lessThan', valor: 600 },
    },
  });
  await prisma.workflowTransicao.create({
    data: {
      workflowId: workflow.id,
      estadoOrigemId: aprovado.id,
      estadoDestinoId: finalizado.id,
      nome: 'Finalizar',
    },
  });
  await prisma.workflowTransicao.create({
    data: {
      workflowId: workflow.id,
      estadoOrigemId: negado.id,
      estadoDestinoId: finalizado.id,
      nome: 'Arquivar',
    },
  });

  console.log('Created: Aprovação de Crédito');
}

async function seedSolicitacaoFerias() {
  const existing = await prisma.workflow.findFirst({
    where: { nome: 'Solicitação de Férias' },
  });
  if (existing) {
    console.log('Workflow "Solicitação de Férias" already exists, skipping.');
    return;
  }

  const workflow = await prisma.workflow.create({
    data: {
      nome: 'Solicitação de Férias',
      descricao: 'Fluxo de solicitação e aprovação de férias',
      categoria: WorkflowCategoria.RH,
      ativo: true,
      versao: 1,
    },
  });

  const solicitado = await prisma.workflowEstado.create({
    data: { workflowId: workflow.id, nome: 'Solicitado', tipo: EstadoTipo.INICIAL, ordem: 0 },
  });
  const aprovado = await prisma.workflowEstado.create({
    data: { workflowId: workflow.id, nome: 'Aprovado', tipo: EstadoTipo.APROVACAO, ordem: 1 },
  });
  const ajustado = await prisma.workflowEstado.create({
    data: { workflowId: workflow.id, nome: 'Ajustado', tipo: EstadoTipo.INTERMEDIARIO, ordem: 2 },
  });
  const programado = await prisma.workflowEstado.create({
    data: { workflowId: workflow.id, nome: 'Programado', tipo: EstadoTipo.INTERMEDIARIO, ordem: 3 },
  });
  const finalizado = await prisma.workflowEstado.create({
    data: { workflowId: workflow.id, nome: 'Finalizado', tipo: EstadoTipo.FINAL, ordem: 4 },
  });

  await prisma.workflowTransicao.create({
    data: {
      workflowId: workflow.id,
      estadoOrigemId: solicitado.id,
      estadoDestinoId: aprovado.id,
      nome: 'Aprovar',
      condicaoJson: { campo: 'diasSolicitados', operador: 'lessThanOrEqual', valor: 30 },
    },
  });
  await prisma.workflowTransicao.create({
    data: {
      workflowId: workflow.id,
      estadoOrigemId: solicitado.id,
      estadoDestinoId: ajustado.id,
      nome: 'Solicitar Ajuste',
      condicaoJson: { campo: 'diasSolicitados', operador: 'greaterThan', valor: 30 },
    },
  });
  await prisma.workflowTransicao.create({
    data: {
      workflowId: workflow.id,
      estadoOrigemId: ajustado.id,
      estadoDestinoId: aprovado.id,
      nome: 'Aprovar Ajuste',
    },
  });
  await prisma.workflowTransicao.create({
    data: {
      workflowId: workflow.id,
      estadoOrigemId: aprovado.id,
      estadoDestinoId: programado.id,
      nome: 'Programar Férias',
      acaoJson: [
        { tipo: 'NOTIFICACAO', config: { mensagem: 'Férias programadas', destino: 'colaborador' } },
        { tipo: 'CRIAR_TAREFA', config: { titulo: 'Atualizar escala', usuarioId: 'gestor' } },
      ],
    },
  });
  await prisma.workflowTransicao.create({
    data: {
      workflowId: workflow.id,
      estadoOrigemId: programado.id,
      estadoDestinoId: finalizado.id,
      nome: 'Concluir',
    },
  });

  console.log('Created: Solicitação de Férias');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
