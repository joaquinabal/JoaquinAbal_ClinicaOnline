import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/auth/login/login.component';
import { MiPerfilComponent } from './components/mi-perfil/mi-perfil.component';
import { MisHorariosComponent } from './components/mi-perfil/mis-horarios/mis-horarios.component';
import { CuentaConfirmadaComponent } from './components/auth/cuenta-confirmada/cuenta-confirmada.component';
import { SolicitarTurnoComponent } from './components/turnos/solicitar-turno/solicitar-turno.component';
import { MisTurnosComponent } from './components/turnos/mis-turnos-paciente/mis-turnos-paciente.component';


export const routes: Routes = [
  { path: '', component: HomeComponent },
    {path: 'usuarios',
  //canActivate: [AdminGuard], // Protegido por guard
  loadChildren: () => import('./components/admin/usuarios/usuarios.module').then(m => m.UsuariosModule)},
  {
  path: 'cuenta-confirmada',
  component: CuentaConfirmadaComponent
},
  {
  path: 'mi-perfil',
  component: MiPerfilComponent
},
  {
  path: 'mis-turnos',
  
  component: MisTurnosComponent
},
{
  path: 'solicitar-turnos',
  component: SolicitarTurnoComponent  
},
 {
  path: 'mis-horarios',
  component: MisHorariosComponent
},
 
  {
    path: 'login',
    component: LoginComponent
   },
  {
    path: 'registro',
    loadChildren: () => import('./components/auth/registro/registro.module').then(m => m.RegistroModule)
  },
  { path: '**', redirectTo: '' }
];
