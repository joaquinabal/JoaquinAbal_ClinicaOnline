import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { SupabaseService } from '../../../services/supabase.service';
import { FormBuilder, FormGroup, Validators, FormControl, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { LoadingService } from '../../../services/loading.service';
import { Router } from '@angular/router';
import { RecaptchaModule } from 'ng-recaptcha';
@Component({
  selector: 'app-registro-especialista',
  standalone: true,
  templateUrl: './registro-especialista.component.html',
  styleUrl: './registro-especialista.component.css',
  imports: [ReactiveFormsModule, CommonModule, FormsModule, RecaptchaModule],
})

export class RegistroEspecialistaComponent {
  especialistaForm: FormGroup;
especialidadesDisponibles: string[] = [];
especialidadesSeleccionadas: string[] = [];
  nuevaEspecialidadControl = new FormControl('');
  imagenPerfil: File | null = null;
  captchaResuelto: string | null = null;


  constructor(private router: Router, private fb: FormBuilder, private supabaseService: SupabaseService, private loadingService: LoadingService) {
    this.especialistaForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      apellido: ['', [Validators.required, Validators.minLength(2)]],
      edad: [null, [Validators.required, Validators.min(18), Validators.max(100)]],
      dni: ['', [Validators.required, Validators.pattern(/^\d{7,8}$/)]],
      especialidades: [[], Validators.required],
      mail: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      imagen: [null, Validators.required],
    });
  }

  async ngOnInit() {
    this.loadingService.mostrar();
    this.especialidadesDisponibles = await this.supabaseService.getEspecialidades();
        this.loadingService.ocultar();
  }

  onCaptchaResolved(token: string | null) {
  this.captchaResuelto = token;
}

async agregarEspecialidad() {

  const nueva = this.nuevaEspecialidadControl.value?.trim();
  if (!nueva){
    console.log("aca?")
return;
  } 

  const yaExiste = this.especialidadesDisponibles.find(e => e.toLowerCase() === nueva.toLowerCase());
  if (yaExiste) {
    alert('La especialidad ya existe.');
    return;
  }
  this.loadingService.mostrar()
  const { error } = await this.supabaseService.agregarEspecialidad(nueva);
  this.loadingService.ocultar()
  if (error) {
    console.log(error)
    alert('No se pudo agregar la especialidad.');
    return;
  } else {
    console.log("si se pudo")
  }

  this.especialidadesDisponibles.push(nueva);
 const control = this.especialistaForm.get('especialidades');
  const actuales = control?.value || [];
  control?.setValue([...actuales, nueva]);

  this.nuevaEspecialidadControl.reset();  
}


  onEspecialidadToggle(especialidad: string) {
    const control = this.especialistaForm.get('especialidades');
    const seleccionadas: string[] = control?.value || [];
    if (seleccionadas.includes(especialidad)) {
      control?.setValue(seleccionadas.filter(e => e !== especialidad));
    } else {
      control?.setValue([...seleccionadas, especialidad]);
    }
  }

  onFileChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.imagenPerfil = file;
      this.especialistaForm.get('imagen')?.setValue(file);
    }
  }

  async registrar() {
  if (this.especialistaForm.invalid || !this.imagenPerfil) {
    this.especialistaForm.markAllAsTouched();
    return;
  }

    if (!this.captchaResuelto) {
    alert('Por favor resolvé el captcha.');
    return;
  }

  const form = this.especialistaForm.value;

  // 1. Crear usuario en Supabase Auth
  this.loadingService.mostrar();
  const { data, error } = await this.supabaseService.signUpUser(form.mail, form.password, 'especialista');
  this.loadingService.ocultar();
        this.router.navigate(['/home']);

  if (error) {
    alert('Error en el registro: ' + error.message);
    return;
  }

  const uid = data.user?.id;

  // 2. Subir imagen
  
  const imgUrl = await this.supabaseService.uploadImage(
    'usuarios',
    this.imagenPerfil!,
    `especialistas/${uid}.jpg`
  );


  // 3. Insertar en tabla 'especialistas'
  const especialista = {
    id: uid,
    nombre: form.nombre,
    apellido: form.apellido,
    edad: form.edad,
    dni: form.dni,
    mail: form.mail,
    especialidades: form.especialidades,
    habilitado: false,
    imagen1: imgUrl,
    creado_en: new Date()
  };
    this.loadingService.mostrar();
  const insertRes = await this.supabaseService.insertEspecialista(especialista);
    this.loadingService.ocultar();
  if (insertRes.error) {
    alert('Error al guardar el perfil: ' + insertRes.error.message);
  } else {
    alert('Registro exitoso. Verificá tu mail y aguardá aprobación del administrador.');
    this.especialistaForm.reset();
  }
  
}


}
