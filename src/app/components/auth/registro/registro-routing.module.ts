import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { RegistroComponent } from './registro.component';
import { RegistroPacienteComponent } from '../registro-paciente/registro-paciente.component';
import { RegistroEspecialistaComponent } from '../registro-especialista/registro-especialista.component';
const routes: Routes = [
  { path: '', component: RegistroComponent},
  { path: 'paciente', component: RegistroPacienteComponent },
  { path: 'especialista', component: RegistroEspecialistaComponent }
   ,

  {
    path: 'paciente',
    loadComponent: () => import('../registro-paciente/registro-paciente.component')
      .then(m => m.RegistroPacienteComponent)
  },
  {
    path: 'especialista',
    loadComponent: () => import('../registro-especialista/registro-especialista.component')
      .then(m => m.RegistroEspecialistaComponent)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RegistroRoutingModule {}
