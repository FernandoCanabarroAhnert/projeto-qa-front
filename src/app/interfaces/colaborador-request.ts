import { TipoColaborador } from "../types/tipo-colaborador";

export interface IColaboradorRequest {
    matricula: string,
    nome: string,
    salarioBase: number,
    tipoColaborador: TipoColaborador,
    valorUnidadeProduzida: number,
    quantidadeProduzida: number,
    valorVendas: number
    porcentagemComissao: number
}