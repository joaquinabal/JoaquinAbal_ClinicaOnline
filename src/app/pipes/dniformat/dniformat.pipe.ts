// src/app/pipes/dni-format.pipe.ts
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'dniFormat',
  standalone: true
})
export class DniFormatPipe implements PipeTransform {
  transform(value: string | number | null | undefined): string {
    if (value == null) return '';
    // Quitamos todo lo que no sea dígito
    const digits = value.toString().replace(/\D+/g, '');
    // Insertamos puntos cada 3 dígitos, de derecha a izquierda
    return digits.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }
}