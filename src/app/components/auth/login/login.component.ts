import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common'; // Para directivas como ngIf, ngClass
import { Router, RouterModule } from '@angular/router'; // Para la navegación y routerLink
import { SupabaseService } from '../../../services/supabase.service';
import { ToastrService } from 'ngx-toastr'; // Para las notificaciones
import { UserRole } from '../../../services/supabase.service';
import { LoadingService } from '../../../services/loading.service';
import { Input } from '@angular/core';
import { LoginAvatarHoverDirective } from '../../../directives/login-avatar-hover/login-avatar-hover.directive';
@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'], // Puedes usar .scss si prefieres Sass
  imports: [
    ReactiveFormsModule, // Para trabajar con formularios reactivos
    CommonModule,        // Para directivas como *ngIf, [ngClass]
    RouterModule,         // Para la directiva routerLink
    LoginAvatarHoverDirective
  ]
})
export class LoginComponent implements OnInit {
  @Input() user: any;
  loginForm!: FormGroup;
  // En LoginComponent
avatarHoveredIdx: number | null = null;
avatarRoles = ['Administrador', 'Paciente', 'Paciente', 'Paciente', 'Especialista', 'Especialista'];
avatarImgs = [
  { src: '../../../../assets/admin.jpg', email: 'dewiko4920@finfave.com', pwd: '123456' },
  { src: '../../../../assets/p1.jpg', email: 'rikico9483@ethsms.com', pwd: '123456' },
  { src: '../../../../assets/p2.jpg', email: 'kacipe3105@ethsms.com', pwd: '123456' },
  { src: '../../../../assets/p3.jpg', email: 'leraji8751@ethsms.com', pwd: '123456' },
  { src: '../../../../assets/d1.jpg', email: 'tapaw66345@ethsms.com', pwd: '123456' },
  { src: '../../../../assets/d2.jpg', email: 'wecelap802@finfave.com', pwd: '123456' },
];


  constructor(
    private fb: FormBuilder,
    private supabaseService: SupabaseService,
    private toastr: ToastrService, // Inyecta el servicio de Toastr
    private router: Router,         // Inyecta el servicio de Router
    private loadingService: LoadingService
  ) {}

  ngOnInit() {
    this.loginForm = this.fb.group({
      mail: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  setAvatarHover(idx: number | null) {
  this.avatarHoveredIdx = idx;
}

async login() {
  if (this.loginForm.invalid) {
    this.loginForm.markAllAsTouched();
    this.toastr.warning('Por favor, ingresa tus credenciales.', 'Campos Requeridos');
    return;
  }

  const { mail, password } = this.loginForm.value;

  try {
    this.loadingService.mostrar();
    const { data, error } = await this.supabaseService.signInUser(mail, password);
    this.loadingService.ocultar();

    if (error) {
      let errorMessage = 'Error al iniciar sesión.';
      if (error.message.includes('Invalid login credentials')) {
        errorMessage = 'Credenciales inválidas. Verifica tu correo y contraseña.';
      } else if (error.message.includes('Email not confirmed')) {
        errorMessage = 'Correo no confirmado. Revisa tu bandeja de entrada.';
      } else {
        errorMessage = error.message;
      }
      this.toastr.error(errorMessage, 'Error de Autenticación');
      return;
    }

    if (data.user) {
      // --- Obtiene el rol del usuario
      const userRole: UserRole | undefined = data.user.user_metadata?.['rol'] as UserRole;

      await this.supabaseService.logLogin(data.user);
      if (userRole) {
        let isSpecialistEnabled = true;
        if (userRole === 'especialista') {
          const { data: specialistData, error: specialistError } = await this.supabaseService.getSpecialistProfile(data.user.id);

          if (specialistError || !specialistData) {
            this.toastr.info('Tu cuenta de especialista aún no ha sido habilitada por un administrador.', 'Cuenta Pendiente');
            await this.supabaseService.signOutUser();
            this.router.navigate(['/home']);
            return; // 👈 ACÁ CORTA Y NO MUESTRA EL TOAST DE ÉXITO
          } else {
            isSpecialistEnabled = specialistData.habilitado;
            if (!isSpecialistEnabled) {
              this.toastr.info('Tu cuenta de especialista aún no ha sido habilitada por un administrador.', 'Cuenta Pendiente');
              await this.supabaseService.signOutUser();
              this.router.navigate(['/home']);
              return;
            }
          }
        }

        // Solo si pasó los chequeos y NO entró en ningún return anterior:
        switch (userRole) {
          case 'administrador':
            this.toastr.success('¡Sesión iniciada con éxito!', 'Bienvenido');
            this.router.navigate(['/admin/dashboard']);
            break;
          case 'paciente':
            this.toastr.success('¡Sesión iniciada con éxito!', 'Bienvenido');
            this.router.navigate(['/paciente/dashboard']);
            break;
          case 'especialista':
            this.toastr.success('¡Sesión iniciada con éxito!', 'Bienvenido');
            this.router.navigate(['/especialista/dashboard']);
            break;
          default:
            this.toastr.warning('Rol de usuario no reconocido en metadata. Redirigiendo a Home.', 'Rol Desconocido');
            this.router.navigate(['/']);
            break;
        }
      } else {
        this.toastr.warning('No se encontró el rol del usuario en su perfil. Redirigiendo a Home.', 'Perfil Incompleto');
        this.router.navigate(['/']);
      }

    } else {
      this.toastr.error('No se pudo iniciar sesión. Intenta nuevamente.', 'Error Desconocido');
    }

  } catch (error: any) {
    this.toastr.error(error.message || 'Ocurrió un error inesperado al iniciar sesión.', 'Error General');
    console.error('Error inesperado durante el login:', error);
  }
}

  autocompletarCredenciales(mail: string, password: string) {
  this.loginForm.patchValue({ mail, password });
}
}

