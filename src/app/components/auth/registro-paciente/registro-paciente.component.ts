import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { SupabaseService } from '../../../services/supabase.service';
import { CommonModule } from '@angular/common';
import { LoadingService } from '../../../services/loading.service';
import { RecaptchaModule } from 'ng-recaptcha';
@Component({
  selector: 'app-registro-paciente',
  standalone: true,
  templateUrl: './registro-paciente.component.html',
  styleUrls: ['./registro-paciente.component.css'],
  imports: [ReactiveFormsModule, CommonModule, RecaptchaModule]
})
export class RegistroPacienteComponent implements OnInit {
  imagenPerfil1: File | null = null;
  imagenPerfil2: File | null = null;
  pacienteForm!: FormGroup;
  cargando = false;
  captchaResuelto: string | null = null;

  constructor(
    private fb: FormBuilder,
    private supabaseService: SupabaseService,
    private loadinService: LoadingService
  ) {}

  ngOnInit() {
    this.pacienteForm = this.fb.group({
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      edad: [null, [Validators.required, Validators.min(0)]],
      dni: ['', Validators.required],
      obra_social: ['', Validators.required],
      mail: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

    onCaptchaResolved(token: string | null) {
  this.captchaResuelto = token;
}

  onImage1Selected(event: any) {
    this.imagenPerfil1 = event.target.files[0];
    console.log(this.imagenPerfil1); // debería mostrar el File completo

  }

  onImage2Selected(event: any) {
    this.imagenPerfil2 = event.target.files[0];
    console.log(this.imagenPerfil2); // debería mostrar el File completo

  }

  async registrar() {
    if (this.pacienteForm.invalid || !this.imagenPerfil1 || !this.imagenPerfil2) {
      this.pacienteForm.markAllAsTouched();
      return;
    }

    const form = this.pacienteForm.value;
        this.loadinService.mostrar();
    // 1. Crear usuario en Supabase Auth
    const { data, error } = await this.supabaseService.signUpUser(form.mail!, form.password!, 'paciente');
          this.loadinService.ocultar()
    if (error) {
      alert('Error en el registro: ' + error.message);
      this.cargando = false;
      return;
    }

    const uid = data.user?.id;
    if (!uid) {
      alert('No se pudo obtener el ID del usuario.');
      this.cargando = false;
      return;
    }

    try {
  
      // 2. Subir imágenes
      const imgUrl1 = await this.supabaseService.uploadImage(
        'usuarios',
        this.imagenPerfil1!,
        `pacientes/${uid}_1.jpg`
      );
              console.log("entro1");
      const imgUrl2 = await this.supabaseService.uploadImage(
        'usuarios',
        this.imagenPerfil2!,
        `pacientes/${uid}_2.jpg`
      );
              console.log("entro2");

/*
const imgUrl1 = "";
const imgUrl2 = "";*/
      // 3. Insertar en tabla 'pacientes'
      const paciente = {
        id: uid,
        nombre: form.nombre,
        apellido: form.apellido,
        edad: form.edad,
        dni: form.dni,
        obra_social: form.obra_social,
        mail: form.mail,
        imagen1: imgUrl1,
        imagen2: imgUrl2,
        creado_en: new Date()
      };

      const insertRes = await this.supabaseService.insertPaciente(paciente);
      if (insertRes.error) {
        alert('Error al guardar el perfil: ' + insertRes.error.message);
      } else {
        
        this.pacienteForm.reset();
      }
    } catch (e: any) {
      alert('Error inesperado: ' + e.message);
    } finally {

    }

  }
}
