import { Directive, ElementRef, Input, OnChanges, SimpleChanges } from '@angular/core';

@Directive({
  selector: '[appRolColor]',
  standalone: true
})
export class RolColorDirective implements OnChanges {

  @Input('appRolColor') rol: string = '';

  constructor(private el: ElementRef) {}

  ngOnChanges(changes: SimpleChanges) {
    this.setColor();
  }

  setColor() {
    let color = '';
    switch ((this.rol || '').toLowerCase()) {
      case 'paciente':
        color = '#FFF9C4'; // Amarillo claro
        break;
      case 'especialista':
        color = '#B3E5FC'; // Celeste claro
        break;
      case 'administrador':
        color = '#BBDEFB'; // Azul claro
        break;
      default:
        color = 'transparent';
    }
    this.el.nativeElement.style.backgroundColor = color;
  }
}
