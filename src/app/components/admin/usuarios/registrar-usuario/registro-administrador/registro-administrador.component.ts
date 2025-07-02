// registro-administrador.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { SupabaseService } from '../../../../../services/supabase.service';
import { CommonModule } from '@angular/common';
import { LoadingService } from '../../../../../services/loading.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-registro-administrador',
  standalone: true,
  templateUrl: './registro-administrador.component.html',
  styleUrls: ['./registro-administrador.component.css'],
  imports: [ReactiveFormsModule, CommonModule]
})
export class RegistroAdministradorComponent implements OnInit {
  imagenPerfil1: File | null = null;
  imagenPerfil2: File | null = null;
  adminForm!: FormGroup;
  imagenPerfil: File | null = null;

  constructor(
    private fb: FormBuilder,
    private supabaseService: SupabaseService,
    private loadingService: LoadingService,
    private toast: ToastrService
  ) {}

  ngOnInit() {
    this.adminForm = this.fb.group({
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      edad: [null, [Validators.required, Validators.min(0)]],
      dni: ['', Validators.required],
      mail: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onImage1Selected(event: any) {
    this.imagenPerfil1 = event.target.files[0];
  }

  onImage2Selected(event: any) {
    this.imagenPerfil2 = event.target.files[0];
  }

  async registrar() {

    console.log("funca")
    const form = this.adminForm.value;
    this.loadingService.mostrar();

    const { data, error } = await this.supabaseService.signUpUser(form.mail!, form.password!, 'administrador');
    this.loadingService.ocultar();

    if (error) {
      this.toast.error('Error en el registro: ' + error.message);
      return;
    }

    const uid = data.user?.id;
    if (!uid) {
      this.toast.error('No se pudo obtener el ID del usuario.');
      return;
    }

    try {
       console.log("Entré al try");
 const imgUrl1 = await this.supabaseService.uploadImage(
    'usuarios',
    this.imagenPerfil!,
    `administradores/${uid}.jpg`
  );

      const administrador = {
        id: uid,
        nombre: form.nombre,
        apellido: form.apellido,
        edad: form.edad,
        dni: form.dni,
        mail: form.mail,
        imagen1: imgUrl1,
        creado_en: new Date()
      };
     console.log("Antes de mostrar loading para insert");
    this.loadingService.mostrar();
    console.log("Antes de insertAdministrador");
    const insertRes = await this.supabaseService.insertAdministrador(administrador);
    console.log("Después de insertAdministrador", insertRes);
    this.loadingService.ocultar();

      if (insertRes.error) {
        this.toast.error('Error al guardar el perfil: ' + insertRes.error.message);
      } else {
        this.adminForm.reset();
      }
    } catch (e: any) {
      this.toast.error('Error inesperado: ' + e.message);
    }
  }
}
