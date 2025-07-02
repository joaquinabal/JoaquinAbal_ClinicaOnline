// src/app/components/auth/registro/registro-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { RegistroComponent } from './registro.component';
import { RegistroPacienteComponent } from '../registro-paciente/registro-paciente.component';
import { RegistroEspecialistaComponent } from '../registro-especialista/registro-especialista.component';


const routes: Routes = [
  {
    path: '',
    component: RegistroComponent,
    data: { childAnimation: 'Main' }
  },
  {
    path: 'paciente',
    component: RegistroPacienteComponent,
    data: { childAnimation: 'paciente' }
  },
  {
    path: 'especialista',
    component: RegistroEspecialistaComponent,
    data: { childAnimation: 'especialista' }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RegistroRoutingModule {}
