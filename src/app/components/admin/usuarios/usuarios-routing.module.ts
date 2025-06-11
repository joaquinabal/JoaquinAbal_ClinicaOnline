import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VerUsuarioComponent } from './ver-usuario/ver-usuario.component';
import { RegistroUsuarioComponent } from './registrar-usuario/registrar-usuario.component';

const routes: Routes = [
  { path: '', redirectTo: 'ver', pathMatch: 'full' },
  { path: 'ver', component: VerUsuarioComponent },
  { path: 'registrar', component: RegistroUsuarioComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UsuariosRoutingModule {}
