import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { NEVER, of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { ColaboradorFormDialog } from '../../components/colaborador-form-dialog/colaborador-form-dialog';
import { ConfirmationDialog } from '../../components/confirmation-dialog/confirmation-dialog';
import { IColaboradorResponse } from '../../interfaces/colaborador-response';
import { IPageResponse } from '../../interfaces/page-response';
import { ColaboradorService } from '../../services/colaborador';
import { SnackBarService } from '../../services/snack-bar';
import { Home } from './home';

describe('Home', () => {
  let colaboradorServiceMock: {
    listar: ReturnType<typeof vi.fn>;
    obterPorId: ReturnType<typeof vi.fn>;
    criar: ReturnType<typeof vi.fn>;
    atualizar: ReturnType<typeof vi.fn>;
    deletar: ReturnType<typeof vi.fn>;
    gerarRelatorioPdf: ReturnType<typeof vi.fn>;
  };
  let dialogMock: { open: ReturnType<typeof vi.fn> };
  let snackBarMock: { openSnackBar: ReturnType<typeof vi.fn> };

  const colaborador: IColaboradorResponse = {
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

  const pageResponse: IPageResponse<IColaboradorResponse> = {
    content: [colaborador],
    numberOfElements: 1,
    totalElements: 1,
    number: 0,
    totalPages: 1,
  };

  const dialogComResultado = (resultado: unknown) => ({ afterClosed: () => of(resultado) });

  function criarComponente() {
    const fixture = TestBed.createComponent(Home);
    const component = fixture.componentInstance;
    fixture.detectChanges();
    return { fixture, component };
  }

  beforeEach(() => {
    colaboradorServiceMock = {
      // NEVER evita que o carregamento do ngAfterViewInit altere bindings durante a detecção
      // (o que, com mock síncrono, dispara NG0100). Testes que precisam de dados os recebem
      // depois da criação, via handlePage/handleSearch.
      listar: vi.fn().mockReturnValue(NEVER),
      obterPorId: vi.fn().mockReturnValue(of(colaborador)),
      criar: vi.fn().mockReturnValue(of(colaborador)),
      atualizar: vi.fn().mockReturnValue(of(colaborador)),
      deletar: vi.fn().mockReturnValue(of(undefined)),
      gerarRelatorioPdf: vi.fn().mockReturnValue(of(new Blob(['pdf']))),
    };
    dialogMock = { open: vi.fn() };
    snackBarMock = { openSnackBar: vi.fn() };

    TestBed.configureTestingModule({
      imports: [Home],
      providers: [
        { provide: ColaboradorService, useValue: colaboradorServiceMock },
        { provide: MatDialog, useValue: dialogMock },
        { provide: SnackBarService, useValue: snackBarMock },
      ],
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('deve criar o componente', () => {
    const { component } = criarComponente();
    expect(component).toBeTruthy();
  });

  describe('carregamento inicial', () => {
    it('deve buscar colaboradores com os valores padrão ao iniciar', () => {
      criarComponente();

      expect(colaboradorServiceMock.listar).toHaveBeenCalledWith(
        0,
        5,
        'id',
        'asc',
        '',
        null
      );
    });

    it('deve preencher a tabela e o total do paginador com a resposta', () => {
      const { component } = criarComponente();
      colaboradorServiceMock.listar.mockReturnValue(of(pageResponse));

      component.handlePage({ pageIndex: 0, pageSize: 5, length: 1 } as never);

      expect(component.dataSource.data).toEqual([colaborador]);
      expect(component.paginator.length).toBe(1);
    });
  });

  describe('busca e filtros', () => {
    it('handleSearch deve buscar pelo termo digitado e normalizar o searchTerm', () => {
      const { component } = criarComponente();
      const event = { target: { value: '  Fernando ' } } as unknown as Event;

      component.handleSearch(event);

      expect(component.searchTerm).toBe('fernando');
      expect(colaboradorServiceMock.listar).toHaveBeenLastCalledWith(
        0,
        5,
        'id',
        '',
        '  Fernando ',
        null
      );
    });

    it('onFiltroChange deve buscar com o tipo selecionado e o termo atual', () => {
      const { component } = criarComponente();
      component.searchTerm = 'fer';

      component.onFiltroChange({ value: 'COMISSIONADO' });

      expect(component.filtroColaboradorSelecionado).toBe('COMISSIONADO');
      expect(colaboradorServiceMock.listar).toHaveBeenLastCalledWith(
        0,
        5,
        'id',
        '',
        'fer',
        'COMISSIONADO'
      );
    });

    it('onFiltroChange com "Todos" (null) deve buscar sem filtrar por tipo', () => {
      const { component } = criarComponente();

      component.onFiltroChange({ value: null });

      expect(colaboradorServiceMock.listar).toHaveBeenLastCalledWith(
        0,
        5,
        'id',
        '',
        '',
        null
      );
    });
  });

  describe('paginação', () => {
    it('handlePage deve buscar a página e o tamanho informados no evento', () => {
      const { component } = criarComponente();

      component.handlePage({ pageIndex: 2, pageSize: 10, length: 50 } as never);

      expect(colaboradorServiceMock.listar).toHaveBeenLastCalledWith(
        2,
        10,
        'id',
        '',
        '',
        null
      );
    });
  });

  describe('adicionarColaborador', () => {
    it('deve abrir o diálogo de formulário no modo adicionar', () => {
      dialogMock.open.mockReturnValue(dialogComResultado(undefined));
      const { component } = criarComponente();

      component.adicionarColaborador();

      expect(dialogMock.open).toHaveBeenCalledWith(
        ColaboradorFormDialog,
        expect.objectContaining({
          data: expect.objectContaining({ action: 'adicionar', buttonLabel: 'Adicionar' }),
        })
      );
    });

    it('deve criar o colaborador, recarregar a lista e exibir mensagem de sucesso', () => {
      const dadosForm = { nome: 'Novo', matricula: '1', salarioBase: 100, tipoColaborador: 'PADRAO' };
      dialogMock.open.mockReturnValue(dialogComResultado(dadosForm));
      const { component } = criarComponente();

      component.adicionarColaborador();

      expect(colaboradorServiceMock.criar).toHaveBeenCalledWith(dadosForm);
      expect(colaboradorServiceMock.listar).toHaveBeenCalledTimes(2);
      expect(snackBarMock.openSnackBar).toHaveBeenCalledWith(
        'Colaborador adicionado com sucesso.'
      );
    });

    it('não deve criar nada quando o diálogo é cancelado', () => {
      dialogMock.open.mockReturnValue(dialogComResultado(undefined));
      const { component } = criarComponente();

      component.adicionarColaborador();

      expect(colaboradorServiceMock.criar).not.toHaveBeenCalled();
    });

    it('deve exibir mensagem de dados inválidos quando a API retorna 400', () => {
      dialogMock.open.mockReturnValue(dialogComResultado({ nome: 'X' }));
      colaboradorServiceMock.criar.mockReturnValue(
        throwError(() => new HttpErrorResponse({ status: 400 }))
      );
      const { component } = criarComponente();

      component.adicionarColaborador();

      expect(snackBarMock.openSnackBar).toHaveBeenCalledWith(
        'Erro ao adicionar colaborador. Verifique os dados e tente novamente.'
      );
    });

    it('deve exibir mensagem de matrícula existente quando a API retorna 409', () => {
      dialogMock.open.mockReturnValue(dialogComResultado({ nome: 'X' }));
      colaboradorServiceMock.criar.mockReturnValue(
        throwError(() => new HttpErrorResponse({ status: 409 }))
      );
      const { component } = criarComponente();

      component.adicionarColaborador();

      expect(snackBarMock.openSnackBar).toHaveBeenCalledWith(
        'Erro ao adicionar colaborador. Matrícula já existente.'
      );
    });
  });

  describe('atualizarColaborador', () => {
    it('deve buscar o colaborador pelo id e abrir o diálogo no modo atualizar', () => {
      dialogMock.open.mockReturnValue(dialogComResultado(undefined));
      const { component } = criarComponente();

      component.atualizarColaborador(1);

      expect(colaboradorServiceMock.obterPorId).toHaveBeenCalledWith(1);
      expect(dialogMock.open).toHaveBeenCalledWith(
        ColaboradorFormDialog,
        expect.objectContaining({
          data: expect.objectContaining({
            action: 'atualizar',
            buttonLabel: 'Salvar',
            colaborador,
          }),
        })
      );
    });

    it('deve atualizar o colaborador, recarregar a lista e exibir mensagem de sucesso', () => {
      const dadosForm = { nome: 'Editado', matricula: '591724', salarioBase: 200, tipoColaborador: 'PADRAO' };
      dialogMock.open.mockReturnValue(dialogComResultado(dadosForm));
      const { component } = criarComponente();

      component.atualizarColaborador(1);

      expect(colaboradorServiceMock.atualizar).toHaveBeenCalledWith(1, dadosForm);
      expect(colaboradorServiceMock.listar).toHaveBeenCalledTimes(2);
      expect(snackBarMock.openSnackBar).toHaveBeenCalledWith('Colaborador editado com sucesso.');
    });

    it('não deve atualizar quando o diálogo é cancelado', () => {
      dialogMock.open.mockReturnValue(dialogComResultado(undefined));
      const { component } = criarComponente();

      component.atualizarColaborador(1);

      expect(colaboradorServiceMock.atualizar).not.toHaveBeenCalled();
    });

    it('deve exibir mensagem de dados inválidos quando a API retorna 400', () => {
      dialogMock.open.mockReturnValue(dialogComResultado({ nome: 'X' }));
      colaboradorServiceMock.atualizar.mockReturnValue(
        throwError(() => new HttpErrorResponse({ status: 400 }))
      );
      const { component } = criarComponente();

      component.atualizarColaborador(1);

      expect(snackBarMock.openSnackBar).toHaveBeenCalledWith(
        'Erro ao atualizar colaborador. Verifique os dados e tente novamente.'
      );
    });

    it('deve exibir mensagem de matrícula existente quando a API retorna 409', () => {
      dialogMock.open.mockReturnValue(dialogComResultado({ nome: 'X' }));
      colaboradorServiceMock.atualizar.mockReturnValue(
        throwError(() => new HttpErrorResponse({ status: 409 }))
      );
      const { component } = criarComponente();

      component.atualizarColaborador(1);

      expect(snackBarMock.openSnackBar).toHaveBeenCalledWith(
        'Erro ao atualizar colaborador. Matrícula já existente.'
      );
    });
  });

  describe('deletarColaborador', () => {
    it('deve abrir o diálogo de confirmação com título e mensagem', () => {
      dialogMock.open.mockReturnValue(dialogComResultado(false));
      const { component } = criarComponente();

      component.deletarColaborador(1);

      expect(dialogMock.open).toHaveBeenCalledWith(
        ConfirmationDialog,
        expect.objectContaining({
          data: {
            title: 'Exclusão de Colaborador',
            message: 'Tem certeza que deseja deletar este colaborador?',
          },
        })
      );
    });

    it('deve deletar, exibir mensagem de sucesso e recarregar a lista quando confirmado', () => {
      dialogMock.open.mockReturnValue(dialogComResultado(true));
      const { component } = criarComponente();

      component.deletarColaborador(1);

      expect(colaboradorServiceMock.deletar).toHaveBeenCalledWith(1);
      expect(snackBarMock.openSnackBar).toHaveBeenCalledWith(
        'Colaborador excluído com sucesso.'
      );
      expect(colaboradorServiceMock.listar).toHaveBeenCalledTimes(2);
    });

    it('não deve deletar quando a exclusão é cancelada', () => {
      dialogMock.open.mockReturnValue(dialogComResultado(false));
      const { component } = criarComponente();

      component.deletarColaborador(1);

      expect(colaboradorServiceMock.deletar).not.toHaveBeenCalled();
    });

    it('deve exibir mensagem de não encontrado quando a API retorna 404', () => {
      dialogMock.open.mockReturnValue(dialogComResultado(true));
      colaboradorServiceMock.deletar.mockReturnValue(
        throwError(() => new HttpErrorResponse({ status: 404 }))
      );
      const { component } = criarComponente();

      component.deletarColaborador(1);

      expect(snackBarMock.openSnackBar).toHaveBeenCalledWith('Colaborador não encontrado.');
    });
  });

  describe('geração de PDF', () => {
    let anchorsClicados: HTMLAnchorElement[];

    beforeEach(() => {
      anchorsClicados = [];
      window.URL.createObjectURL = vi.fn().mockReturnValue('blob:mock-url');
      window.URL.revokeObjectURL = vi.fn();
      vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (
        this: HTMLAnchorElement
      ) {
        anchorsClicados.push(this);
      });
    });

    it('gerarFolha deve solicitar o relatório "folha" e baixar como folha.pdf', () => {
      const { component } = criarComponente();

      component.gerarFolha();

      expect(colaboradorServiceMock.gerarRelatorioPdf).toHaveBeenCalledWith('folha');
      expect(anchorsClicados).toHaveLength(1);
      expect(anchorsClicados[0].download).toBe('folha.pdf');
      expect(anchorsClicados[0].href).toBe('blob:mock-url');
      expect(window.URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
    });

    it('emitirResumo deve solicitar o relatório "resumo" e baixar como resumo.pdf', () => {
      const { component } = criarComponente();

      component.emitirResumo();

      expect(colaboradorServiceMock.gerarRelatorioPdf).toHaveBeenCalledWith('resumo');
      expect(anchorsClicados[0].download).toBe('resumo.pdf');
    });

    it('deve exibir mensagem de erro e não baixar nada quando a geração falha', () => {
      colaboradorServiceMock.gerarRelatorioPdf.mockReturnValue(
        throwError(() => new HttpErrorResponse({ status: 500 }))
      );
      const { component } = criarComponente();

      component.gerarFolha();

      expect(snackBarMock.openSnackBar).toHaveBeenCalledWith(
        'Erro ao gerar relatório PDF. Tente novamente mais tarde.'
      );
      expect(anchorsClicados).toHaveLength(0);
    });
  });
});
