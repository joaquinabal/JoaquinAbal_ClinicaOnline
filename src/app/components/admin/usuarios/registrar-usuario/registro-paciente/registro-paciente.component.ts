import { Component } from '@angular/core';
import { Input } from '@angular/core';
@Component({
  selector: 'app-registro-paciente',
  standalone: true,
  imports: [],
  templateUrl: './registro-paciente.component.html',
  styleUrl: './registro-paciente.component.css'
})

export class RegistroPacienteComponent {
  @Input() registradoPorAdmin: boolean = false;

}

