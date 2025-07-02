// src/app/pipes/fecha.pipe.ts
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'fechaEspanol',
  standalone: true
})
export class FechaPipe implements PipeTransform {
  private meses = [
    'Enero', 'Febrero', 'Marzo', 'Abril',
    'Mayo', 'Junio', 'Julio', 'Agosto',
    'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  transform(value: Date | string | number): string {
    if (!value) return '';
    const fecha = new Date(value);
    const dia = fecha.getDate();
    const mes = this.meses[fecha.getMonth()];
    const anio = fecha.getFullYear();
    return `${dia} de ${mes} de ${anio}`;
  }
}
