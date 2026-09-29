export interface IColaboradorResponse {
    id: number
    matricula: string,
    nome: string,
    salarioBase: number,
    adicionais: number,
    salarioFinal: number,
    tipoColaborador: string,
    valorUnidadeProduzida: number,
    quantidadeProduzida: number,
    valorVendas: number
    porcentagemComissao: number
}