// perfil-hover.directive.ts
import { Directive, ElementRef, HostListener, Input } from '@angular/core';

@Directive({
  selector: '[appPerfilHover]',
  standalone: true
})
export class PerfilHoverDirective {
  @Input('appPerfilHover') rol: string = '';

  private colorPorRol: { [key: string]: string } = {
    paciente: '#ffe066',     // amarillo claro
    especialista: '#a7c7e7', // celeste claro
    administradore: '#89CFF0' // azul claro
  };

  private originalColor: string = '';
  private originalWeight: string = '';

  constructor(private el: ElementRef) {}

  @HostListener('mouseenter')
  onMouseEnter() {
    this.originalColor = this.el.nativeElement.style.backgroundcolor;
    this.originalWeight = this.el.nativeElement.style.fontWeight;
    this.el.nativeElement.style.fontWeight = 'bold';
    this.el.nativeElement.style.backgroundColor = this.colorPorRol[this.rol];
  }

  @HostListener('mouseleave')
  onMouseLeave() {
    this.el.nativeElement.style.fontWeight = this.originalWeight || 'normal';
    this.el.nativeElement.style.backgroundColor = this.originalColor || '#FFFFFF';
  }
}
