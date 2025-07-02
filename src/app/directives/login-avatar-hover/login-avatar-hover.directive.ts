// src/app/directives/login-avatar-hover.directive.ts
import { Directive, ElementRef, Renderer2, HostListener, Input } from '@angular/core';

@Directive({
  selector: '[loginAvatarHover]',
  standalone: true
})
export class LoginAvatarHoverDirective {
  @Input('loginAvatarHover') avatarIdx: number | undefined;
  @Input() hoveredIdx: number | null = null;
  @Input() setCurrentHover!: (idx: number | null) => void;

  constructor(private el: ElementRef, private renderer: Renderer2) {}

  @HostListener('mouseenter') onEnter() {
    if (this.setCurrentHover && typeof this.avatarIdx === 'number') this.setCurrentHover(this.avatarIdx);
  }
  @HostListener('mouseleave') onLeave() {
    if (this.setCurrentHover) this.setCurrentHover(null);
  }
}
