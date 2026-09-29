import { Component, inject, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { TipoColaborador } from '../../types/tipo-colaborador';
import { provideNgxMask } from 'ngx-mask';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-colaborador-form-dialog',
  imports: [
    MatDialogModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    FormsModule,
    ReactiveFormsModule,
    MatSelectModule,
    MatIconModule
  ],
  standalone: true,
  providers: [
    provideNgxMask(),
  ],
  templateUrl: './colaborador-form-dialog.html',
  styleUrl: './colaborador-form-dialog.css',
})
export class ColaboradorFormDialog implements OnInit {

  filtroColaboradores: { value: TipoColaborador | null, viewValue: string }[] = [
    { value: 'PADRAO', viewValue: 'Padrão' },
    { value: 'COMISSIONADO', viewValue: 'Comissionado' },
    { value: 'PRODUCAO', viewValue: 'Produção' }
  ]
  colaboradorForm: FormGroup = {} as FormGroup;

  protected readonly data = inject(MAT_DIALOG_DATA);
  protected readonly dialogRef = inject(MatDialogRef<ColaboradorFormDialog>);

  ngOnInit(): void {
    this.instanciarForm();
    if (this.data.action === 'atualizar' && this.data.colaborador) {
      this.colaboradorForm.patchValue({
        nome: this.data.colaborador.nome,
        matricula: this.data.colaborador.matricula,
        salarioBase: this.data.colaborador.salarioBase.toString().replace('.', ','),
        tipoColaborador: this.data.colaborador.tipoColaborador,
        valorUnidadeProduzida: `${this.data.colaborador.valorUnidadeProduzida}`,
        quantidadeProduzida: this.data.colaborador.quantidadeProduzida,
        valorVendas: `${this.data.colaborador.valorVendas}`,
        porcentagemComissao: `${this.data.colaborador.porcentagemComissao}`,
      });
      this.tipoColaborador.disable();
    }
  }

  get nome(): FormControl {
    return this.colaboradorForm.get('nome') as FormControl;
  }

  get matricula(): FormControl {
    return this.colaboradorForm.get('matricula') as FormControl;
  }

  get salarioBase(): FormControl {
    return this.colaboradorForm.get('salarioBase') as FormControl;
  }

  get tipoColaborador(): FormControl {
    return this.colaboradorForm.get('tipoColaborador') as FormControl;
  }

  get valorUnidadeProduzida(): FormControl {
    return this.colaboradorForm.get('valorUnidadeProduzida') as FormControl;
  }

  get quantidadeProduzida(): FormControl {
    return this.colaboradorForm.get('quantidadeProduzida') as FormControl;
  }

  get valorVendas(): FormControl {
    return this.colaboradorForm.get('valorVendas') as FormControl;
  }

  get porcentagemComissao(): FormControl {
    return this.colaboradorForm.get('porcentagemComissao') as FormControl;
  }

  handleSubmit() {
    if (!this.colaboradorForm.valid) {
      this.colaboradorForm.markAllAsTouched();
      return;
    }
    const data = this.mapearDadosFormulario();
    this.dialogRef.close(data);
  }

  private mapearDadosFormulario() {
    const dadosBase = {
      nome: this.nome.value,
      matricula: this.matricula.value,
      salarioBase: this.converterParaNumero(this.salarioBase.value),
      tipoColaborador: this.tipoColaborador.value,
    }
    if (this.tipoColaborador.value === 'COMISSIONADO') {
      return {
        ...dadosBase,
        valorVendas: this.converterParaNumero(this.valorVendas.value),
        porcentagemComissao: this.converterParaNumero(this.porcentagemComissao.value),
      }
    }
    else if (this.tipoColaborador.value === 'PRODUCAO') {
      return {
        ...dadosBase,
        valorUnidadeProduzida: this.converterParaNumero(this.valorUnidadeProduzida.value),
        quantidadeProduzida: this.quantidadeProduzida.value,
      }
    }
    else {
      return dadosBase;
    }
  }

  private converterParaNumero(valor: string | null): number | null {
    if (valor === null) {
      return null;
    }
    return Number(valor.replace(',', '.'));
  }

  onCurrencyInput(event: Event, formControl: FormControl): void {
    const input = event.target as HTMLInputElement;
    let value = input.value;
    value = value.replace(/[^\d,]/g, '');
    const parts = value.split(',');
    if (parts.length > 2) {
      value = parts[0] + ',' + parts.slice(1).join('');
    }
    if (value.includes(',')) {
      const [inteiro, decimal] = value.split(',');
      value = `${inteiro},${decimal.substring(0, 2)}`;
    }
    input.value = value;
    formControl.setValue(value, {
      emitEvent: false
    });
  }

  validarCampoEspecificoTipoColaborador(tipoColaboradorSelecionado: TipoColaborador, tipoColaboradorCampo: TipoColaborador) {
    return (control: AbstractControl): ValidationErrors | null => {
      const invalid = (control.value == null || control.value === '') && tipoColaboradorSelecionado === tipoColaboradorCampo;
      return invalid ? {required: true} : null;
    };
  }

  private instanciarForm() {
    this.colaboradorForm = new FormGroup({
      nome: new FormControl<string>('', [Validators.required]),
      matricula: new FormControl<string>('', [Validators.required]),
      salarioBase: new FormControl<string | null>(null, [Validators.required]),
      tipoColaborador: new FormControl<string>('PADRAO', [Validators.required]),
      valorUnidadeProduzida: new FormControl<number | null>(null),
      quantidadeProduzida: new FormControl<number | null>(null),
      valorVendas: new FormControl<number | null>(null),
      porcentagemComissao: new FormControl<number | null>(null),
    })
    this.valorUnidadeProduzida.setValidators(this.validarCampoEspecificoTipoColaborador(this.tipoColaborador.value, 'PRODUCAO'));
    this.quantidadeProduzida.setValidators(this.validarCampoEspecificoTipoColaborador(this.tipoColaborador.value, 'PRODUCAO'));
    this.valorVendas.setValidators(this.validarCampoEspecificoTipoColaborador(this.tipoColaborador.value, 'COMISSIONADO'));
    this.porcentagemComissao.setValidators(this.validarCampoEspecificoTipoColaborador(this.tipoColaborador.value, 'COMISSIONADO'));
  }

}
