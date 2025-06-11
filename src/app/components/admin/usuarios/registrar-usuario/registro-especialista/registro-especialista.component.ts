import { Component } from '@angular/core';
import { Input } from '@angular/core';

@Component({
  standalone: true,
  selector: 'app-registro-especialista-admin',
  imports: [],
  templateUrl: './registro-especialista.component.html',
  styleUrl: './registro-especialista.component.css'
})
export class RegistroEspecialistaComponent {
  @Input() registradoPorAdmin: boolean = false;
}
