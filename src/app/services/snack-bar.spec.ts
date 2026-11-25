import { TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { vi } from 'vitest';
import { SnackBarService } from './snack-bar';

describe('SnackBarService', () => {
  let service: SnackBarService;
  let matSnackBarMock: { open: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    matSnackBarMock = { open: vi.fn() };

    TestBed.configureTestingModule({
      providers: [{ provide: MatSnackBar, useValue: matSnackBarMock }],
    });
    service = TestBed.inject(SnackBarService);
  });

  it('deve ser criado', () => {
    expect(service).toBeTruthy();
  });

  it('openSnackBar deve abrir o snack bar com a mensagem e o botão "Fechar"', () => {
    service.openSnackBar('Colaborador adicionado com sucesso.');

    expect(matSnackBarMock.open).toHaveBeenCalledTimes(1);
    expect(matSnackBarMock.open).toHaveBeenCalledWith(
      'Colaborador adicionado com sucesso.',
      'Fechar',
      expect.any(Object)
    );
  });

  it('openSnackBar deve usar duração de 3 segundos e posição no topo à direita', () => {
    service.openSnackBar('Qualquer mensagem');

    expect(matSnackBarMock.open).toHaveBeenCalledWith('Qualquer mensagem', 'Fechar', {
      duration: 3000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
    });
  });
});
