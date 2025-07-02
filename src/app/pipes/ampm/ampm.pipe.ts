// src/app/pipes/ampm.pipe.ts
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'ampm',
  standalone: true
})
export class AmPmPipe implements PipeTransform {
  transform(value: string | Date): string {
    let date: Date;

    if (value instanceof Date) {
      date = value;
    } else if (typeof value === 'string') {
      // si viene solo "HH:mm"
      const hm = value.match(/^(\d{1,2}):(\d{2})$/);
      if (hm) {
        const h = parseInt(hm[1], 10);
        const m = parseInt(hm[2], 10);
        date = new Date();
        date.setHours(h, m, 0, 0);
      } else {
        // intentamos parsear ISO
        date = new Date(value);
      }
    } else {
      return '';
    }

    let hours = date.getHours();
    const minutes = date.getMinutes();
    const period = hours < 12 ? 'am' : 'pm';
    let hour12 = hours % 12;
    if (hour12 === 0) hour12 = 12;

    const minPadded = minutes.toString().padStart(2, '0');
    return `${hour12}:${minPadded}${period}`;
  }
}
