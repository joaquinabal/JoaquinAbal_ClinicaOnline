import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/auth/login/login.component';
import { MiPerfilComponent } from './components/mi-perfil/mi-perfil.component';
import { MisHorariosComponent } from './components/mi-perfil/mis-horarios/mis-horarios.component';
import { CuentaConfirmadaComponent } from './components/auth/cuenta-confirmada/cuenta-confirmada.component';
import { SolicitarTurnoComponent } from './components/turnos/solicitar-turno/solicitar-turno.component';
import { MisTurnosPacienteComponent } from './components/turnos/mis-turnos-paciente/mis-turnos-paciente.component';
import { MisTurnosEspecialistaComponent } from './components/turnos/mis-turnos-especialista/mis-turnos-especialista.component';
import { TurnosAdminComponent } from './components/turnos/turnos-admin/turnos-admin.component';
import { SolicitarTurnosAdminComponent } from './components/turnos/solicitar-turnos-admin/solicitar-turnos-admin.component';
import { PacientesAtendidosEspecialistaComponent } from './components/especialista/pacientes/pacientes.component';
import { CommonModule } from '@angular/common';

export const routes: Routes = [
  { path: '', component: HomeComponent },
    {path: 'usuarios',
  //canActivate: [AdminGuard], // Protegido por guard
  loadChildren: () => import('./components/admin/usuarios/usuarios.module').then(m => m.UsuariosModule)},
  {
  path: 'cuenta-confirmada',
  component: CuentaConfirmadaComponent, 
},
  {
  path: 'mi-perfil',
  component: MiPerfilComponent, data: { animation: 'MiPerfilPage' }
},
  {
  path: 'mis-turnos/paciente',
  
  component: MisTurnosPacienteComponent, data: { animation: 'TurnosPacientePage' }
},
{
  path: 'turnos',
  component: TurnosAdminComponent, data: { animation: 'TurnosPage' }
},
 {
  path: 'mis-turnos/especialista',
  
  component: MisTurnosEspecialistaComponent, data: { animation: 'TurnosEspecialistaPage' }
},
{
  path: 'solicitar-turno',
  component: SolicitarTurnoComponent, data: { animation: 'SolicitarTurnosPage' }
},
{
  path: 'turnos/solicitar',
  component: SolicitarTurnosAdminComponent, data: { animation: 'SolicitarTurnosAdminPage' }  
},
 {
  path: 'mis-horarios',
  component: MisHorariosComponent, data: { animation: 'MisHorariosPage' }
},
 {
  path: 'pacientes',
  component: PacientesAtendidosEspecialistaComponent, data: { animation: 'PacientesPage' }
},
 
  {
    path: 'login',
    component: LoginComponent, data: { animation: 'LoginPage' }
   },
  {
    path: 'registro',
    loadChildren: () => import('./components/auth/registro/registro.module').then(m => m.RegistroModule)
  },
  { path: '**', redirectTo: '' }
];
