import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { TipoColaborador } from '../types/tipo-colaborador';
import { IColaboradorResponse } from '../interfaces/colaborador-response';
import { IPageResponse } from '../interfaces/page-response';
import { IColaboradorRequest } from '../interfaces/colaborador-request';

@Injectable({
  providedIn: 'root',
})
export class ColaboradorService {
  
  private readonly baseUrl = 'http://localhost:8080/api/v1/colaboradores';
  private readonly http = inject(HttpClient);

  listar(
    page: number, size: number, sort: string, direction: string, 
    nomeMatricula: string, tipoColaborador: TipoColaborador | null
  ): Observable<IPageResponse<IColaboradorResponse>> {
    let httpParams = new HttpParams()
      .set('nomeMatricula', nomeMatricula)
    if (tipoColaborador) {
      httpParams = new HttpParams()
        .set('nomeMatricula', nomeMatricula)
        .set('tipoColaborador', tipoColaborador);
    }
    return this.http.get<IPageResponse<IColaboradorResponse>>(`${this.baseUrl}?page=${page}&size=${size}&sort=${sort}&direction=${direction}`, {
      params: httpParams
    });
  }

  obterPorId(id: number): Observable<IColaboradorResponse> {
    return this.http.get<IColaboradorResponse>(`${this.baseUrl}/${id}`);
  }

  criar(data: IColaboradorRequest): Observable<IColaboradorResponse> {
    return this.http.post<IColaboradorResponse>(this.baseUrl, data);
  }

  atualizar(id: number, data: IColaboradorRequest): Observable<IColaboradorResponse> {
    return this.http.put<IColaboradorResponse>(`${this.baseUrl}/${id}`, data);
  }

  deletar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  gerarRelatorioPdf(nome: string): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/${nome}/pdf`, { responseType: 'blob' });
  }

}
