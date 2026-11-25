import { TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { vi } from 'vitest';
import { ConfirmationDialog } from './confirmation-dialog';

describe('ConfirmationDialog', () => {
  function criarComponente(data: { title?: string; message?: string }) {
    TestBed.configureTestingModule({
      imports: [ConfirmationDialog],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: data },
        { provide: MatDialogRef, useValue: { close: vi.fn() } },
      ],
    });
    const fixture = TestBed.createComponent(ConfirmationDialog);
    fixture.detectChanges();
    return fixture;
  }

  it('deve criar o componente', () => {
    const fixture = criarComponente({ title: 'Título', message: 'Mensagem' });
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('deve renderizar o título e a mensagem recebidos em data', () => {
    const fixture = criarComponente({
      title: 'Exclusão de Colaborador',
      message: 'Tem certeza que deseja deletar este colaborador?',
    });
    const el = fixture.nativeElement as HTMLElement;

    expect(el.querySelector('h2')?.textContent?.trim()).toBe('Exclusão de Colaborador');
    expect(el.querySelector('p')?.textContent?.trim()).toBe(
      'Tem certeza que deseja deletar este colaborador?'
    );
  });

  it('não deve renderizar o título quando não informado', () => {
    const fixture = criarComponente({ message: 'Apenas mensagem' });
    expect(fixture.nativeElement.querySelector('h2')).toBeNull();
  });

  it('não deve renderizar a mensagem quando não informada', () => {
    const fixture = criarComponente({ title: 'Apenas título' });
    expect(fixture.nativeElement.querySelector('p')).toBeNull();
  });

  it('deve exibir os botões "Confirmar" e "Cancelar"', () => {
    const fixture = criarComponente({ title: 'T', message: 'M' });
    const textos = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll('button')
    ).map((b) => b.textContent?.trim());

    expect(textos).toContain('Confirmar');
    expect(textos).toContain('Cancelar');
  });
});
