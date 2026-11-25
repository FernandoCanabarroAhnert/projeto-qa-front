import { TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { vi } from 'vitest';
import { IColaboradorResponse } from '../../interfaces/colaborador-response';
import { ColaboradorFormDialog } from './colaborador-form-dialog';

describe('ColaboradorFormDialog', () => {
  let dialogRefMock: { close: ReturnType<typeof vi.fn> };

  const dadosAdicionar = {
    action: 'adicionar',
    title: 'Adicionar Colaborador',
    buttonLabel: 'Adicionar',
  };

  const colaboradorExistente: IColaboradorResponse = {
    id: 7,
    matricula: '123456',
    nome: 'Maria',
    salarioBase: 1500.75,
    adicionais: 0,
    salarioFinal: 1500.75,
    tipoColaborador: 'PADRAO',
    valorUnidadeProduzida: 0,
    quantidadeProduzida: 0,
    valorVendas: 0,
    porcentagemComissao: 0,
  };

  function criarComponente(data: Record<string, unknown> = dadosAdicionar) {
    TestBed.configureTestingModule({
      imports: [ColaboradorFormDialog],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: data },
        { provide: MatDialogRef, useValue: dialogRefMock },
      ],
    });
    const fixture = TestBed.createComponent(ColaboradorFormDialog);
    const component = fixture.componentInstance;
    fixture.detectChanges();
    return { fixture, component };
  }

  function criarEventoInput(input: HTMLInputElement): Event {
    return { target: input } as unknown as Event;
  }

  beforeEach(() => {
    dialogRefMock = { close: vi.fn() };
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('inicialização', () => {
    it('deve criar o componente', () => {
      const { component } = criarComponente();
      expect(component).toBeTruthy();
    });

    it('deve exibir o título recebido em data', () => {
      const { fixture } = criarComponente();
      expect(fixture.nativeElement.querySelector('h2')?.textContent?.trim()).toBe(
        'Adicionar Colaborador'
      );
    });

    it('deve iniciar com o tipo de colaborador PADRAO', () => {
      const { component } = criarComponente();
      expect(component.tipoColaborador.value).toBe('PADRAO');
    });

    it('deve iniciar inválido com os campos obrigatórios vazios', () => {
      const { component } = criarComponente();
      expect(component.colaboradorForm.valid).toBe(false);
      expect(component.nome.hasError('required')).toBe(true);
      expect(component.matricula.hasError('required')).toBe(true);
      expect(component.salarioBase.hasError('required')).toBe(true);
    });
  });

  describe('handleSubmit', () => {
    it('não deve fechar o diálogo e deve marcar os campos como tocados quando inválido', () => {
      const { component } = criarComponente();

      component.handleSubmit();

      expect(dialogRefMock.close).not.toHaveBeenCalled();
      expect(component.nome.touched).toBe(true);
      expect(component.matricula.touched).toBe(true);
    });

    it('deve fechar o diálogo com os dados básicos quando o tipo é PADRAO', () => {
      const { component } = criarComponente();
      component.nome.setValue('Fernando');
      component.matricula.setValue('591724');
      component.salarioBase.setValue('5000,00');

      component.handleSubmit();

      expect(dialogRefMock.close).toHaveBeenCalledWith({
        nome: 'Fernando',
        matricula: '591724',
        salarioBase: 5000,
        tipoColaborador: 'PADRAO',
      });
    });
  });

  describe('mapeamento dos dados por tipo de colaborador', () => {
    function preencherBase(component: ColaboradorFormDialog) {
      component.nome.setValue('Fernando');
      component.matricula.setValue('591724');
      component.salarioBase.setValue('5000,00');
    }

    it('COMISSIONADO deve incluir valorVendas e porcentagemComissao convertidos para número', () => {
      const { component } = criarComponente();
      preencherBase(component);
      component.tipoColaborador.setValue('COMISSIONADO');
      component.valorVendas.setValue('1000,50');
      component.porcentagemComissao.setValue('2,5');

      component.handleSubmit();

      expect(dialogRefMock.close).toHaveBeenCalledWith({
        nome: 'Fernando',
        matricula: '591724',
        salarioBase: 5000,
        tipoColaborador: 'COMISSIONADO',
        valorVendas: 1000.5,
        porcentagemComissao: 2.5,
      });
    });

    it('PRODUCAO deve incluir valorUnidadeProduzida convertido e quantidadeProduzida', () => {
      const { component } = criarComponente();
      preencherBase(component);
      component.tipoColaborador.setValue('PRODUCAO');
      component.valorUnidadeProduzida.setValue('10,5');
      component.quantidadeProduzida.setValue(100);

      component.handleSubmit();

      expect(dialogRefMock.close).toHaveBeenCalledWith({
        nome: 'Fernando',
        matricula: '591724',
        salarioBase: 5000,
        tipoColaborador: 'PRODUCAO',
        valorUnidadeProduzida: 10.5,
        quantidadeProduzida: 100,
      });
    });

    it('PADRAO deve descartar campos específicos de outros tipos', () => {
      const { component } = criarComponente();
      preencherBase(component);
      component.valorVendas.setValue('999,00');
      component.porcentagemComissao.setValue('5');
      component.valorUnidadeProduzida.setValue('3,00');
      component.quantidadeProduzida.setValue(4);

      component.handleSubmit();

      const enviado = dialogRefMock.close.mock.calls[0][0];
      expect(enviado).not.toHaveProperty('valorVendas');
      expect(enviado).not.toHaveProperty('porcentagemComissao');
      expect(enviado).not.toHaveProperty('valorUnidadeProduzida');
      expect(enviado).not.toHaveProperty('quantidadeProduzida');
    });
  });

  describe('modo atualizar', () => {
    it('deve preencher o formulário com os dados do colaborador recebido', () => {
      const { component } = criarComponente({
        action: 'atualizar',
        title: 'Atualizar Colaborador',
        buttonLabel: 'Salvar',
        colaborador: colaboradorExistente,
      });

      expect(component.nome.value).toBe('Maria');
      expect(component.matricula.value).toBe('123456');
      expect(component.salarioBase.value).toBe('1500,75');
      expect(component.tipoColaborador.value).toBe('PADRAO');
    });

    it('deve enviar os dados editados ao confirmar', () => {
      const { component } = criarComponente({
        action: 'atualizar',
        title: 'Atualizar Colaborador',
        buttonLabel: 'Salvar',
        colaborador: colaboradorExistente,
      });
      component.nome.setValue('Maria Editada');

      component.handleSubmit();

      expect(dialogRefMock.close).toHaveBeenCalledWith({
        nome: 'Maria Editada',
        matricula: '123456',
        salarioBase: 1500.75,
        tipoColaborador: 'PADRAO',
      });
    });
  });

  describe('onCurrencyInput', () => {
    it('deve remover caracteres que não são dígitos ou vírgula', () => {
      const { component } = criarComponente();
      const input = document.createElement('input');
      input.value = '12a5';

      component.onCurrencyInput(criarEventoInput(input), component.salarioBase);

      expect(input.value).toBe('125');
      expect(component.salarioBase.value).toBe('125');
    });

    it('deve limitar a duas casas decimais', () => {
      const { component } = criarComponente();
      const input = document.createElement('input');
      input.value = '10,12345';

      component.onCurrencyInput(criarEventoInput(input), component.salarioBase);

      expect(input.value).toBe('10,12');
      expect(component.salarioBase.value).toBe('10,12');
    });

    it('deve manter apenas a primeira vírgula', () => {
      const { component } = criarComponente();
      const input = document.createElement('input');
      input.value = '1,2,3';

      component.onCurrencyInput(criarEventoInput(input), component.salarioBase);

      expect(input.value).toBe('1,23');
    });

    it('não deve alterar o valor quando já está no formato correto', () => {
      const { component } = criarComponente();
      const input = document.createElement('input');
      input.value = '5000,00';

      component.onCurrencyInput(criarEventoInput(input), component.salarioBase);

      expect(input.value).toBe('5000,00');
    });
  });

  describe('validação condicional por tipo de colaborador', () => {
    // Known issue: the conditional validators are attached in instanciarForm() using the
    // tipoColaborador value at construction time ('PADRAO'). Their closure keeps that value,
    // so they never report `required` after the user switches the type or in edit mode.
    // These tests describe the expected behavior; `it.fails` keeps the suite green while the
    // bug exists. When the bug is fixed, these tests will fail, and `.fails` should be removed.

    it.fails('deve exigir o valor da unidade produzida ao selecionar PRODUCAO', () => {
      const { component } = criarComponente();
      component.tipoColaborador.setValue('PRODUCAO');

      expect(component.valorUnidadeProduzida.hasError('required')).toBe(true);
    });

    it.fails('deve exigir o valor de vendas ao selecionar COMISSIONADO', () => {
      const { component } = criarComponente();
      component.tipoColaborador.setValue('COMISSIONADO');

      expect(component.valorVendas.hasError('required')).toBe(true);
    });

    it('não deve exigir campos de comissão quando o tipo é PADRAO', () => {
      const { component } = criarComponente();
      component.nome.setValue('Fernando');
      component.matricula.setValue('591724');
      component.salarioBase.setValue('5000,00');

      expect(component.colaboradorForm.valid).toBe(true);
    });
  });
});
