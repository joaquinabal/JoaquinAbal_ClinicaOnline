import { Component } from '@angular/core';
import { RegistroPacienteComponent } from './registro-paciente/registro-paciente.component';
import { RegistroAdministradorComponent } from './registro-administrador/registro-administrador.component';
import { RegistroEspecialistaComponent } from './registro-especialista/registro-especialista.component';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-registro',
  imports: [RegistroPacienteComponent, RegistroAdministradorComponent, RegistroEspecialistaComponent, CommonModule],
  templateUrl: './registrar-usuario.component.html',
  styleUrl: './registrar-usuario.component.css'
})
export class RegistroUsuarioComponent {
  opcion: 'paciente' | 'especialista' | 'administrador' | null = null;
}
