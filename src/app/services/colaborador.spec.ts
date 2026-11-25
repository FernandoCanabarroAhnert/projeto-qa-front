import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { IColaboradorRequest } from '../interfaces/colaborador-request';
import { IColaboradorResponse } from '../interfaces/colaborador-response';
import { IPageResponse } from '../interfaces/page-response';
import { ColaboradorService } from './colaborador';

const BASE_URL = 'http://localhost:8080/api/v1/colaboradores';

describe('ColaboradorService', () => {
  let service: ColaboradorService;
  let httpMock: HttpTestingController;

  const colaboradorResponse: IColaboradorResponse = {
    id: 1,
    matricula: '591724',
    nome: 'Fernando',
    salarioBase: 5000,
    adicionais: 0,
    salarioFinal: 5000,
    tipoColaborador: 'PADRAO',
    valorUnidadeProduzida: 0,
    quantidadeProduzida: 0,
    valorVendas: 0,
    porcentagemComissao: 0,
  };

  const colaboradorRequest: IColaboradorRequest = {
    matricula: '591724',
    nome: 'Fernando',
    salarioBase: 5000,
    tipoColaborador: 'PADRAO',
    valorUnidadeProduzida: 0,
    quantidadeProduzida: 0,
    valorVendas: 0,
    porcentagemComissao: 0,
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ColaboradorService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('deve ser criado', () => {
    expect(service).toBeTruthy();
  });

  describe('listar', () => {
    const pageResponse: IPageResponse<IColaboradorResponse> = {
      content: [colaboradorResponse],
      numberOfElements: 1,
      totalElements: 1,
      number: 0,
      totalPages: 1,
    };

    it('deve fazer GET com paginação e ordenação na URL', () => {
      let resultado: IPageResponse<IColaboradorResponse> | undefined;
      service.listar(0, 5, 'nome', 'asc', '', null).subscribe((r) => (resultado = r));

      const req = httpMock.expectOne(
        (r) => r.url === `${BASE_URL}?page=0&size=5&sort=nome&direction=asc`
      );
      expect(req.request.method).toBe('GET');
      req.flush(pageResponse);

      expect(resultado).toEqual(pageResponse);
    });

    it('deve enviar nomeMatricula como parâmetro mesmo quando vazio', () => {
      service.listar(0, 5, 'id', 'asc', '', null).subscribe();

      const req = httpMock.expectOne((r) => r.url.startsWith(BASE_URL));
      expect(req.request.params.has('nomeMatricula')).toBe(true);
      expect(req.request.params.get('nomeMatricula')).toBe('');
      req.flush(pageResponse);
    });

    it('não deve enviar tipoColaborador quando o filtro é nulo', () => {
      service.listar(0, 5, 'id', 'asc', 'Fer', null).subscribe();

      const req = httpMock.expectOne((r) => r.url.startsWith(BASE_URL));
      expect(req.request.params.get('nomeMatricula')).toBe('Fer');
      expect(req.request.params.has('tipoColaborador')).toBe(false);
      req.flush(pageResponse);
    });

    it('deve enviar tipoColaborador quando o filtro é informado', () => {
      service.listar(0, 5, 'id', 'asc', 'Fer', 'PRODUCAO').subscribe();

      const req = httpMock.expectOne((r) => r.url.startsWith(BASE_URL));
      expect(req.request.params.get('nomeMatricula')).toBe('Fer');
      expect(req.request.params.get('tipoColaborador')).toBe('PRODUCAO');
      req.flush(pageResponse);
    });
  });

  it('obterPorId deve fazer GET no endpoint do colaborador', () => {
    let resultado: IColaboradorResponse | undefined;
    service.obterPorId(1).subscribe((r) => (resultado = r));

    const req = httpMock.expectOne(`${BASE_URL}/1`);
    expect(req.request.method).toBe('GET');
    req.flush(colaboradorResponse);

    expect(resultado).toEqual(colaboradorResponse);
  });

  it('criar deve fazer POST com os dados do colaborador', () => {
    let resultado: IColaboradorResponse | undefined;
    service.criar(colaboradorRequest).subscribe((r) => (resultado = r));

    const req = httpMock.expectOne(BASE_URL);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(colaboradorRequest);
    req.flush(colaboradorResponse);

    expect(resultado).toEqual(colaboradorResponse);
  });

  it('atualizar deve fazer PUT no endpoint do colaborador com os dados', () => {
    let resultado: IColaboradorResponse | undefined;
    service.atualizar(1, colaboradorRequest).subscribe((r) => (resultado = r));

    const req = httpMock.expectOne(`${BASE_URL}/1`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(colaboradorRequest);
    req.flush(colaboradorResponse);

    expect(resultado).toEqual(colaboradorResponse);
  });

  it('deletar deve fazer DELETE no endpoint do colaborador', () => {
    let concluido = false;
    service.deletar(1).subscribe({ complete: () => (concluido = true) });

    const req = httpMock.expectOne(`${BASE_URL}/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);

    expect(concluido).toBe(true);
  });

  describe('gerarRelatorioPdf', () => {
    it('deve fazer GET no endpoint de PDF esperando um Blob', () => {
      let resultado: Blob | undefined;
      service.gerarRelatorioPdf('folha').subscribe((r) => (resultado = r));

      const req = httpMock.expectOne(`${BASE_URL}/folha/pdf`);
      expect(req.request.method).toBe('GET');
      expect(req.request.responseType).toBe('blob');

      const blob = new Blob(['conteudo'], { type: 'application/pdf' });
      req.flush(blob);

      expect(resultado).toBe(blob);
    });
  });

  it('deve propagar o erro HTTP para quem assina', () => {
    let statusRecebido: number | undefined;
    service.obterPorId(99).subscribe({
      error: (err) => (statusRecebido = err.status),
    });

    httpMock
      .expectOne(`${BASE_URL}/99`)
      .flush('Não encontrado', { status: 404, statusText: 'Not Found' });

    expect(statusRecebido).toBe(404);
  });
});
