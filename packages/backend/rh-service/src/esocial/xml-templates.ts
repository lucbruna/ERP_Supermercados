import {
  AdmissaoData, AlteracaoData, FeriasData, CondicaoAmbienteData,
  AposentadoriaData, AfastamentoData, ReintegracaoData, RescisaoData,
  DesligamentoTSVData, TpAmb,
} from './esocial.dto';

const tpAmb = (process.env.ESOCIAL_TP_AMB as TpAmb) || TpAmb.HOMOLOGACAO;

export function buildS2200XML(dados: AdmissaoData): string {
  const end = dados.endereco;
  return `<?xml version="1.0" encoding="UTF-8"?>
<eSocial xmlns="http://www.esocial.gov.br/schema/evt/evtAdmissao/v_S_01_02_00">
  <evtAdmissao>
    <ideEvento>
      <indRetif>1</indRetif>
      <tpAmb>${tpAmb}</tpAmb>
      <procEmi>1</procEmi>
      <verProc>CRM_SUPERMERCADO_1.0</verProc>
    </ideEvento>
    <ideEmpregador>
      <tpInsc>1</tpInsc>
      <nrInsc>${dados.cnpj}</nrInsc>
    </ideEmpregador>
    <trabalhador>
      <cpfTrab>${dados.cpf}</cpfTrab>
      <nmTrab>${dados.nome}</nmTrab>
      <sexo>${dados.sexo}</sexo>
      <racaCor>${dados.racaCor}</racaCor>
      <dtNascto>${dados.dataNascimento}</dtNascto>
      <endTrab>
        <cep>${end.cep}</cep>
        <logradouro>${end.logradouro}</logradouro>
        <nr>${end.numero}</nr>
        <complemento>${end.complemento || ''}</complemento>
        <bairro>${end.bairro}</bairro>
        <cidade>${end.cidade}</cidade>
        <uf>${end.uf}</uf>
        <pais>${end.pais || 'Brasil'}</pais>
      </endTrab>
    </trabalhador>
    <dmTrab>
      <matricula>${dados.matricula}</matricula>
      <codCateg>${dados.categoriaTrab}</codCateg>
      <dtAdm>${dados.dataAdmissao}</dtAdm>
      <regTrab>${dados.regTrab}</regTrab>
      <salario>
        <valor>${dados.salario.toFixed(2)}</valor>
      </salario>
      <jornada>
        <dsvJorn>${dados.jornada}</dsvJorn>
      </jornada>
    </dmTrab>
  </evtAdmissao>
</eSocial>`;
}

export function buildS2206XML(dados: AlteracaoData): string {
  const end = dados.endereco;
  return `<?xml version="1.0" encoding="UTF-8"?>
<eSocial xmlns="http://www.esocial.gov.br/schema/evt/evtAltContratual/v_S_01_02_00">
  <evtAltContratual>
    <ideEvento>
      <indRetif>1</indRetif>
      <tpAmb>${tpAmb}</tpAmb>
      <procEmi>1</procEmi>
      <verProc>CRM_SUPERMERCADO_1.0</verProc>
    </ideEvento>
    <ideEmpregador>
      <tpInsc>1</tpInsc>
      <nrInsc>${dados.cnpj}</nrInsc>
    </ideEmpregador>
    <trabalhador>
      <cpfTrab>${dados.cpf}</cpfTrab>
      <nmTrab>${dados.nome}</nmTrab>
    </trabalhador>
    <dmAlteracao>
      <matricula>${dados.matricula}</matricula>
      <dtAlteracao>${dados.dataAlteracao}</dtAlteracao>
      <dadosContractuais>
        ${dados.novoCargo ? `<cargo>${dados.novoCargo}</cargo>` : ''}
        ${dados.novoSalario ? `<salario><valor>${dados.novoSalario.toFixed(2)}</valor></salario>` : ''}
        ${dados.novaJornada ? `<jornada><dsvJorn>${dados.novaJornada}</dsvJorn></jornada>` : ''}
        ${end ? `<endereco><cep>${end.cep}</cep><logradouro>${end.logradouro}</logradouro><nr>${end.numero}</nr><bairro>${end.bairro}</bairro><cidade>${end.cidade}</cidade><uf>${end.uf}</uf></endereco>` : ''}
      </dadosContractuais>
      ${dados.motivo ? `<motivo>${dados.motivo}</motivo>` : ''}
    </dmAlteracao>
  </evtAltContratual>
</eSocial>`;
}

export function buildS2230XML(dados: FeriasData): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<eSocial xmlns="http://www.esocial.gov.br/schema/evt/evtFerias/v_S_01_02_00">
  <evtFerias>
    <ideEvento>
      <indRetif>1</indRetif>
      <tpAmb>${tpAmb}</tpAmb>
      <procEmi>1</procEmi>
      <verProc>CRM_SUPERMERCADO_1.0</verProc>
    </ideEvento>
    <ideEmpregador>
      <tpInsc>1</tpInsc>
      <nrInsc>${dados.cnpj}</nrInsc>
    </ideEmpregador>
    <trabalhador>
      <cpfTrab>${dados.cpf}</cpfTrab>
      <nmTrab>${dados.nome}</nmTrab>
    </trabalhador>
    <dmFerias>
      <matricula>${dados.matricula}</matricula>
      <dtInicio>${dados.dataInicio}</dtInicio>
      <dtFim>${dados.dataFim}</dtFim>
      <diasGozados>${dados.dias}</diasGozados>
      ${dados.diasAbono ? `<diasAbono>${dados.diasAbono}</diasAbono>` : ''}
      ${dados.antecipaParcela ? '<antecipacaoParcela>S</antecipacaoParcela>' : ''}
    </dmFerias>
  </evtFerias>
</eSocial>`;
}

export function buildS2240XML(dados: CondicaoAmbienteData): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<eSocial xmlns="http://www.esocial.gov.br/schema/evt/evtCondAmb/v_S_01_02_00">
  <evtCondAmb>
    <ideEvento>
      <indRetif>1</indRetif>
      <tpAmb>${tpAmb}</tpAmb>
      <procEmi>1</procEmi>
      <verProc>CRM_SUPERMERCADO_1.0</verProc>
    </ideEvento>
    <ideEmpregador>
      <tpInsc>1</tpInsc>
      <nrInsc>${dados.cnpj}</nrInsc>
    </ideEmpregador>
    <trabalhador>
      <cpfTrab>${dados.cpf}</cpfTrab>
      <nmTrab>${dados.nome}</nmTrab>
    </trabalhador>
    <dmCondAmb>
      <matricula>${dados.matricula}</matricula>
      <dtInicio>${dados.dataInicio}</dtInicio>
      ${dados.dataFim ? `<dtFim>${dados.dataFim}</dtFim>` : ''}
      <localTrab>${dados.localTrabalho}</localTrab>
      ${dados.insalubre ? `<insalubridade><codAval>1</codAval></insalubridade>` : ''}
      ${dados.periculoso ? `<periculosidade><codAval>1</codAval></periculosidade>` : ''}
      ${dados.descricaoAmbiente ? `<descAmb>${dados.descricaoAmbiente}</descAmb>` : ''}
    </dmCondAmb>
  </evtCondAmb>
</eSocial>`;
}

export function buildS2241XML(dados: AposentadoriaData): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<eSocial xmlns="http://www.esocial.gov.br/schema/evt/evtAposentadoria/v_S_01_02_00">
  <evtAposentadoria>
    <ideEvento>
      <indRetif>1</indRetif>
      <tpAmb>${tpAmb}</tpAmb>
      <procEmi>1</procEmi>
      <verProc>CRM_SUPERMERCADO_1.0</verProc>
    </ideEvento>
    <ideEmpregador>
      <tpInsc>1</tpInsc>
      <nrInsc>${dados.cnpj}</nrInsc>
    </ideEmpregador>
    <trabalhador>
      <cpfTrab>${dados.cpf}</cpfTrab>
      <nmTrab>${dados.nome}</nmTrab>
    </trabalhador>
    <dmAposentadoria>
      <matricula>${dados.matricula}</matricula>
      <dtInicio>${dados.dataInicio}</dtInicio>
      ${dados.dataFim ? `<dtFim>${dados.dataFim}</dtFim>` : ''}
      <codAposent>${dados.codigoAposentadoria}</codAposent>
      ${dados.fatorRisco ? `<fatorRisco>${dados.fatorRisco}</fatorRisco>` : ''}
      <descAtiv>${dados.descricaoAtividade}</descAtiv>
    </dmAposentadoria>
  </evtAposentadoria>
</eSocial>`;
}

export function buildS2250XML(dados: AfastamentoData): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<eSocial xmlns="http://www.esocial.gov.br/schema/evt/evtAfastamento/v_S_01_02_00">
  <evtAfastamento>
    <ideEvento>
      <indRetif>1</indRetif>
      <tpAmb>${tpAmb}</tpAmb>
      <procEmi>1</procEmi>
      <verProc>CRM_SUPERMERCADO_1.0</verProc>
    </ideEvento>
    <ideEmpregador>
      <tpInsc>1</tpInsc>
      <nrInsc>${dados.cnpj}</nrInsc>
    </ideEmpregador>
    <trabalhador>
      <cpfTrab>${dados.cpf}</cpfTrab>
      <nmTrab>${dados.nome}</nmTrab>
    </trabalhador>
    <dmAfastamento>
      <matricula>${dados.matricula}</matricula>
      <dtInicio>${dados.dataInicio}</dtInicio>
      ${dados.dataPrevistaRetorno ? `<dtPrevRetorno>${dados.dataPrevistaRetorno}</dtPrevRetorno>` : ''}
      <codAfast>${dados.codigoAfastamento}</codAfast>
      <motivo>${dados.motivo}</motivo>
      ${dados.observacao ? `<obs>${dados.observacao}</obs>` : ''}
    </dmAfastamento>
  </evtAfastamento>
</eSocial>`;
}

export function buildS2298XML(dados: ReintegracaoData): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<eSocial xmlns="http://www.esocial.gov.br/schema/evt/evtReintegracao/v_S_01_02_00">
  <evtReintegracao>
    <ideEvento>
      <indRetif>1</indRetif>
      <tpAmb>${tpAmb}</tpAmb>
      <procEmi>1</procEmi>
      <verProc>CRM_SUPERMERCADO_1.0</verProc>
    </ideEvento>
    <ideEmpregador>
      <tpInsc>1</tpInsc>
      <nrInsc>${dados.cnpj}</nrInsc>
    </ideEmpregador>
    <trabalhador>
      <cpfTrab>${dados.cpf}</cpfTrab>
      <nmTrab>${dados.nome}</nmTrab>
    </trabalhador>
    <dmReintegracao>
      <matricula>${dados.matricula}</matricula>
      <dtReintegracao>${dados.dataReintegracao}</dtReintegracao>
      <motivo>${dados.motivo}</motivo>
      <cargo>${dados.cargo}</cargo>
      <salario><valor>${dados.salario.toFixed(2)}</valor></salario>
    </dmReintegracao>
  </evtReintegracao>
</eSocial>`;
}

export function buildS2299XML(dados: RescisaoData): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<eSocial xmlns="http://www.esocial.gov.br/schema/evt/evtDeslig/v_S_01_02_00">
  <evtDeslig>
    <ideEvento>
      <indRetif>1</indRetif>
      <tpAmb>${tpAmb}</tpAmb>
      <procEmi>1</procEmi>
      <verProc>CRM_SUPERMERCADO_1.0</verProc>
    </ideEvento>
    <ideEmpregador>
      <tpInsc>1</tpInsc>
      <nrInsc>${dados.cnpj}</nrInsc>
    </ideEmpregador>
    <trabalhador>
      <cpfTrab>${dados.cpf}</cpfTrab>
      <nmTrab>${dados.nome}</nmTrab>
    </trabalhador>
    <dmDeslig>
      <matricula>${dados.matricula}</matricula>
      <dtDeslig>${dados.dataDesligamento}</dtDeslig>
      <codMotivo>${dados.codigoMotivo}</codMotivo>
      ${dados.avisoPrevio ? `<avisoPrevio><dtAviso>${dados.dataDesligamento}</dtAviso>${dados.diasAvisoPrevio ? `<diasAviso>${dados.diasAvisoPrevio}</diasAviso>` : ''}</avisoPrevio>` : ''}
      <observacao>${dados.motivo}</observacao>
      ${dados.observacao ? `<obs>${dados.observacao}</obs>` : ''}
    </dmDeslig>
  </evtDeslig>
</eSocial>`;
}

export function buildS2399XML(dados: DesligamentoTSVData): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<eSocial xmlns="http://www.esocial.gov.br/schema/evt/evtDesligTSV/v_S_01_02_00">
  <evtDesligTSV>
    <ideEvento>
      <indRetif>1</indRetif>
      <tpAmb>${tpAmb}</tpAmb>
      <procEmi>1</procEmi>
      <verProc>CRM_SUPERMERCADO_1.0</verProc>
    </ideEvento>
    <ideEmpregador>
      <tpInsc>1</tpInsc>
      <nrInsc>${dados.cnpj}</nrInsc>
    </ideEmpregador>
    <trabalhador>
      <cpfTrab>${dados.cpf}</cpfTrab>
      <nmTrab>${dados.nome}</nmTrab>
    </trabalhador>
    <dmDeslig>
      <matricula>${dados.matricula}</matricula>
      <dtDeslig>${dados.dataDesligamento}</dtDeslig>
      <codMotivo>${dados.codigoMotivo}</codMotivo>
    </dmDeslig>
  </evtDesligTSV>
</eSocial>`;
}
