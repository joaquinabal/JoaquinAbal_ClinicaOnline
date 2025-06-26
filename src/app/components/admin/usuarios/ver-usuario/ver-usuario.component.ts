import { Component, OnInit } from '@angular/core';
import { SupabaseService } from '../../../../services/supabase.service';
import { CommonModule } from '@angular/common';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

@Component({
  standalone: true,
  imports: [CommonModule],
  selector: 'app-ver-usuarios',
  templateUrl: './ver-usuario.component.html',
  styleUrls: ['./ver-usuario.component.css']
})
export class VerUsuarioComponent implements OnInit {
  pacientes: any[] = [];
  especialistas: any[] = [];
  administradores: any[] = [];

  cargando = false;

  constructor(private supabaseService: SupabaseService) {}

  ngOnInit(): void {
    this.obtenerUsuarios();
  }

  async obtenerUsuarios() {
    this.cargando = true;

    const [pacRes, espRes, adminRes] = await Promise.all([
      this.supabaseService.getPacientes(),
      this.supabaseService.getEspecialistas(),
      this.supabaseService.getAdministradores()
    ]);

    this.pacientes = pacRes.data || [];
    this.especialistas = espRes.data || [];
    this.administradores = adminRes.data || [];

    this.cargando = false;
  }

  async toggleHabilitacion(especialista: any) {
    const nuevoEstado = !especialista.habilitado;
    const res = await this.supabaseService.updateEspecialistaHabilitacion(especialista.id, nuevoEstado);
    if (!res.error) {
      especialista.habilitado = nuevoEstado;
    }
  }

   descargarExcelUsuarios() {
    // Combinar y normalizar los datos de todas las tablas
    const todos = [
      ...this.pacientes.map(u => ({ ...u, rol: 'Paciente' })),
      ...this.especialistas.map(e => ({ ...e, rol: 'Especialista' })),
      ...this.administradores.map(a => ({ ...a, rol: 'Administrador' })),
    ];

    // Opcional: Reordenar campos
    const datos = todos.map(({ id, nombre, apellido, mail, rol }) => ({
      id, nombre, apellido, mail, rol
    }));

    // Crear hoja Excel
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(datos);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Usuarios");

    // Descargar archivo
    const excelBuffer: any = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const fileName = 'usuarios_clinica_online.xlsx';
    saveAs(new Blob([excelBuffer], { type: 'application/octet-stream' }), fileName);
  }
}