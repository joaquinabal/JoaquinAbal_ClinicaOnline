import { Component } from '@angular/core';
import {
  trigger,
  transition,
  style,
  query,
  animate,
  sequence
} from '@angular/animations';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-registro',
  standalone: false,
  templateUrl: './registro.component.html',
  styleUrls: ['./registro.component.css'],
  animations: [
    trigger('slideInOut', [
      transition('* => paciente', slide('100%', '0%')),
      transition('* => especialista', slide('-100%', '0%'))
    ])
  ]
})
export class RegistroComponent {
  // lee el campo `childAnimation` de la ruta activa
  prepareChild(outlet: RouterOutlet) {
    return outlet.activatedRouteData?.['childAnimation'];
  }
}

// helper para no repetir código
function slide(from: string, to: string) {
  return sequence([
    style({ position: 'relative' }),
    query(':enter, :leave', [
      style({
        position: 'absolute',
        top: 0, left: 0, width: '100%'
      })
    ], { optional: true }),
    query(':enter', [
      style({ transform: `translateX(${from})` })
    ], { optional: true }),
    query(':leave', [
      animate('300ms ease-out', style({ transform: `translateX(${-parseInt(from)}%)` }))
    ], { optional: true }),
    query(':enter', [
      animate('300ms ease-out', style({ transform: `translateX(${to})` }))
    ], { optional: true })
  ]);
}