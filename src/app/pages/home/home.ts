import { AfterViewInit, Component, inject, ViewChild } from '@angular/core';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSort, MatSortModule, Sort } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { CurrencyPipe } from '@angular/common';
import { ColaboradorService } from '../../services/colaborador';
import { TipoColaborador } from '../../types/tipo-colaborador';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { take } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { ColaboradorFormDialog } from '../../components/colaborador-form-dialog/colaborador-form-dialog';
import { ConfirmationDialog } from '../../components/confirmation-dialog/confirmation-dialog';
import { IColaboradorResponse } from '../../interfaces/colaborador-response';
import { HttpErrorResponse } from '@angular/common/http';
import { SnackBarService } from '../../services/snack-bar';
import { MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-home',
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    CurrencyPipe,
    MatSelectModule,
    MatIconModule,
    MatButtonModule,
    MatSnackBarModule
  ],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements AfterViewInit {

  colunas: string[] = ['id', 'matricula', 'nome', 'salarioBase', 'adicionais', 'salarioFinal', 'tipoColaborador', 'acoes'];
  filtroColaboradores: { value: TipoColaborador | null, viewValue: string }[] = [
    { value: null, viewValue: 'Todos' },
    { value: 'PADRAO', viewValue: 'Padrão' },
    { value: 'COMISSIONADO', viewValue: 'Comissionado' },
    { value: 'PRODUCAO', viewValue: 'Produção' }
  ]


  searchTerm: string = '';
  filtroColaboradorSelecionado: TipoColaborador | null = null;
  dataSource!: MatTableDataSource<IColaboradorResponse>;

  @ViewChild(MatPaginator)
  paginator!: MatPaginator;
  @ViewChild(MatSort)
  sort!: MatSort;

  private readonly colaboradorService = inject(ColaboradorService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBarService = inject(SnackBarService);

  ngAfterViewInit() {
    this.buscarColaboradores();
    this.listenToSortChanges();
  }

  handleSearch(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.searchTerm = filterValue.trim().toLowerCase();
    this.buscarColaboradores(0, this.paginator.pageSize, this.sort.active, this.sort.direction, filterValue);
  }

  handlePage(event: PageEvent) {
    this.buscarColaboradores(event.pageIndex, event.pageSize, this.sort.active, this.sort.direction);
  }

  onFiltroChange(event: any) {
    this.filtroColaboradorSelecionado = event.value;
    this.buscarColaboradores(0, this.paginator.pageSize, this.sort.active, this.sort.direction, this.searchTerm);
  }

  adicionarColaborador() {
    const dialogRef = this.dialog.open(ColaboradorFormDialog, {
      width: '450px',
      data: {
        action: 'adicionar',
        title: 'Adicionar Colaborador',
        buttonLabel: 'Adicionar'
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (!result) return;
      this.colaboradorService.criar(result).pipe(take(1)).subscribe({
        next: () => {
          this.buscarColaboradores();
          this.snackBarService.openSnackBar('Colaborador adicionado com sucesso.');
        },
        error: (err: HttpErrorResponse) => {
          const BAD_REQUEST_ERROR = 400;
          const CONFLICT_ERROR = 409;
          if (err.status === BAD_REQUEST_ERROR) {
            this.snackBarService.openSnackBar('Erro ao adicionar colaborador. Verifique os dados e tente novamente.');
          }
          if (err.status === CONFLICT_ERROR) {
            this.snackBarService.openSnackBar('Erro ao adicionar colaborador. Matrícula já existente.');
          }
        }
      })
    })
  }

  atualizarColaborador(id: number) {
    this.colaboradorService.obterPorId(id).pipe(take(1)).subscribe(colaborador => {
      const dialogRef = this.dialog.open(ColaboradorFormDialog, {
        width: '450px',
        data: {
          action: 'atualizar',
          title: 'Atualizar Colaborador',
          buttonLabel: 'Salvar',
          colaborador
        }
      });
      dialogRef.afterClosed().subscribe(result => {
        if (!result) return;
        this.colaboradorService.atualizar(id, result).pipe(take(1)).subscribe({
          next: () => {
            this.buscarColaboradores();
            this.snackBarService.openSnackBar('Colaborador editado com sucesso.');
          },
          error: (err: HttpErrorResponse) => {
            const BAD_REQUEST_ERROR = 400;
            const CONFLICT_ERROR = 409;
            if (err.status === BAD_REQUEST_ERROR) {
              this.snackBarService.openSnackBar('Erro ao atualizar colaborador. Verifique os dados e tente novamente.');
            }
            if (err.status === CONFLICT_ERROR) {
              this.snackBarService.openSnackBar('Erro ao atualizar colaborador. Matrícula já existente.');
            }
          }
        })
      })
    });
  }

  deletarColaborador(id: number) {
    const dialogRef = this.dialog.open(ConfirmationDialog, {
      width: '400px',
      data: {
        title: 'Exclusão de Colaborador',
        message: 'Tem certeza que deseja deletar este colaborador?'
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (!result) return;
      this.colaboradorService.deletar(id).pipe(take(1)).subscribe({
        next: () => {
          this.snackBarService.openSnackBar('Colaborador excluído com sucesso.');
          this.buscarColaboradores();
        },
        error: (err: HttpErrorResponse) => {
          const NOT_FOUND_ERROR = 404;
          if (err.status === NOT_FOUND_ERROR) {
            this.snackBarService.openSnackBar('Colaborador não encontrado.');
          }
        }
      })
    });
  }

  gerarFolha() {
    this.baixarPdf("folha");
  }

  emitirResumo() {
    this.baixarPdf("resumo");
  }

  private baixarPdf(nomeArquivo: string) {
    this.colaboradorService.gerarRelatorioPdf(nomeArquivo).pipe(take(1)).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${nomeArquivo}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: (_: HttpErrorResponse) => {
        this.snackBarService.openSnackBar('Erro ao gerar relatório PDF. Tente novamente mais tarde.');
      }
    });
  }

  private listenToSortChanges() {
    this.sort.sortChange.subscribe((value) => {
      this.buscarColaboradores(this.paginator.pageIndex, this.paginator.pageSize, value.active, value.direction);
    });
  }

  private buscarColaboradores(page: number = 0, size: number = 5, sort: string = 'id', direction: string = 'asc', nomeMatricula: string = '') {
    this.colaboradorService.listar(page, size, sort, direction, nomeMatricula, this.filtroColaboradorSelecionado)
      .pipe(take(1))
      .subscribe(response => {
        this.dataSource = new MatTableDataSource(response.content);
        this.paginator.length = response.totalElements;
      })
  }

}
