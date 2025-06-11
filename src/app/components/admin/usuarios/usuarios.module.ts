// 1. Módulo de Lazy Loading: usuarios.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { UsuariosRoutingModule } from './usuarios-routing.module';
import { VerUsuarioComponent } from './ver-usuario/ver-usuario.component';
import { RegistroUsuarioComponent } from './registrar-usuario/registrar-usuario.component';
import { RegistroPacienteComponent } from './registrar-usuario/registro-paciente/registro-paciente.component';
import { RegistroEspecialistaComponent } from './registrar-usuario/registro-especialista/registro-especialista.component';



@NgModule({
  declarations: [/*
    VerUsuariosComponent,
    RegistrarUsuarioComponent,
    RegistroPacienteComponent,
    RegistroEspecialistaComponent,
    RegistroAdministradorComponent*/
    

  ],
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    UsuariosRoutingModule,
    VerUsuarioComponent,
    RegistroUsuarioComponent,
    RegistroPacienteComponent,
    RegistroEspecialistaComponent,
  ]
})
export class UsuariosModule {}

