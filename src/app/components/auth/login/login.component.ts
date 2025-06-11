import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common'; // Para directivas como ngIf, ngClass
import { Router, RouterModule } from '@angular/router'; // Para la navegación y routerLink
import { SupabaseService } from '../../../services/supabase.service';
import { ToastrService } from 'ngx-toastr'; // Para las notificaciones
import { UserRole } from '../../../services/supabase.service';
@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'], // Puedes usar .scss si prefieres Sass
  imports: [
    ReactiveFormsModule, // Para trabajar con formularios reactivos
    CommonModule,        // Para directivas como *ngIf, [ngClass]
    RouterModule         // Para la directiva routerLink
  ]
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private supabaseService: SupabaseService,
    private toastr: ToastrService, // Inyecta el servicio de Toastr
    private router: Router         // Inyecta el servicio de Router
  ) {}

  ngOnInit() {
    this.loginForm = this.fb.group({
      mail: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

 async login() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched(); // Marca todos los campos como tocados para mostrar errores
      this.toastr.warning('Por favor, ingresa tus credenciales.', 'Campos Requeridos');
      return;
    }

    const { mail, password } = this.loginForm.value;

    try {
      // Intenta iniciar sesión con Supabase
      const { data, error } = await this.supabaseService.signInUser(mail, password);

      if (error) {
        // Manejo de errores específicos de Supabase
        let errorMessage = 'Error al iniciar sesión.';
        if (error.message.includes('Invalid login credentials')) {
          errorMessage = 'Credenciales inválidas. Verifica tu correo y contraseña.';
        } else if (error.message.includes('Email not confirmed')) {
          errorMessage = 'Correo no confirmado. Revisa tu bandeja de entrada.';
        } else {
          errorMessage = error.message; // Otro error de Supabase
        }
        this.toastr.error(errorMessage, 'Error de Autenticación');
        console.error('Error de login:', error);
        return;
      }

      if (data.user) {
        // Usuario logueado con éxito
        this.toastr.success('¡Sesión iniciada con éxito!', 'Bienvenido');
        console.log('Usuario logueado:', data.user);

        // --- INICIO DE LA MODIFICACIÓN CLAVE PARA METADATA Y ROLES ---

        // 1. Obtener el rol del usuario directamente de la user_metadata
        // Asegúrate de que 'rol' se haya guardado durante el registro en options.data.rol
        const userRole: UserRole | undefined = data.user.user_metadata?.['rol'] as UserRole;

        if (userRole) { // Si el rol está definido en la metadata
          let isSpecialistEnabled = true; // Bandera para controlar la habilitación del especialista

          // 2. Si el rol es 'especialista', hacemos una consulta adicional para verificar 'habilitado'
          if (userRole === 'especialista') {
            const { data: specialistData, error: specialistError } = await this.supabaseService.getSpecialistProfile(data.user.id);

            if (specialistError) {
              console.error('Error al obtener el perfil de especialista:', specialistError);
              isSpecialistEnabled = false; // Asumimos no habilitado si hay error al obtener el perfil
            } else if (!specialistData) {
                // Esto ocurriría si .single() no encuentra el registro, o si el especialista fue eliminado de la tabla 'especialistas'
                console.warn('Perfil de especialista no encontrado en la tabla "especialistas" para el UID:', data.user.id);
                isSpecialistEnabled = false; // No hay datos de especialista, por lo tanto no está habilitado
            } else {
              // Si se encontró el perfil, usamos su valor de 'habilitado'
              isSpecialistEnabled = specialistData.habilitado;
            }
          }

          // 3. Redirigir según el rol y la habilitación (para especialistas)
          switch (userRole) {
            case 'administrador':
              this.router.navigate(['/admin/dashboard']); // Ruta para administradores
              break;
            case 'paciente':
              this.router.navigate(['/paciente/dashboard']); // Ruta para pacientes
              break;
            case 'especialista':
              if (isSpecialistEnabled) { // Verifica si el especialista está habilitado
                this.router.navigate(['/especialista/dashboard']); // Ruta para especialistas habilitados
              } else {
                this.toastr.info('Tu cuenta de especialista aún no ha sido habilitada por un administrador.', 'Cuenta Pendiente');
                await this.supabaseService.signOutUser(); // Cerrar sesión si no está habilitado
                this.router.navigate(['/login']); // O a una página de "espera de activación"
              }
              break;
            default:
              this.toastr.warning('Rol de usuario no reconocido en metadata. Redirigiendo a Home.', 'Rol Desconocido');
              this.router.navigate(['/']); // Ruta por defecto si el rol no se reconoce
              break;
          }
        } else {
          // Si el rol no se encontró en la metadata (posiblemente un usuario antiguo o un error de registro)
          this.toastr.warning('No se encontró el rol del usuario en su perfil. Redirigiendo a Home.', 'Perfil Incompleto');
          this.router.navigate(['/']); // Redirigir si no hay rol
        }

        // --- FIN DE LA MODIFICACIÓN CLAVE ---

      } else {
        this.toastr.error('No se pudo iniciar sesión. Intenta nuevamente.', 'Error Desconocido');
      }

    } catch (error: any) {
      // Manejo de otros errores no capturados por Supabase (ej. red, etc.)
      this.toastr.error(error.message || 'Ocurrió un error inesperado al iniciar sesión.', 'Error General');
      console.error('Error inesperado durante el login:', error);
    }
  }
}

