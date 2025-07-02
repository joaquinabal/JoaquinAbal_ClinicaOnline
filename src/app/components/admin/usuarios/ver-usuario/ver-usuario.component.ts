import { Component, OnInit } from '@angular/core';
import { SupabaseService } from '../../../../services/supabase.service';
import { CommonModule } from '@angular/common';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { RolColorDirective } from '../../../../directives/rol-color/rol-color.directive';

@Component({
  standalone: true,
  imports: [CommonModule, RolColorDirective],
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

  private async obtenerUsuarios() {
    this.cargando = true;

    const [pacRes, espRes, adminRes] = await Promise.all([
      this.supabaseService.getPacientes(),
      this.supabaseService.getEspecialistas(),
      this.supabaseService.getAdministradores()
    ]);

    this.pacientes      = pacRes.data      || [];
    this.especialistas  = espRes.data      || [];
    this.administradores= adminRes.data    || [];

    this.cargando = false;
  }

  async toggleHabilitacion(especialista: any) {
    const nuevoEstado = !especialista.habilitado;
    const res = await this.supabaseService.updateEspecialistaHabilitacion(especialista.id, nuevoEstado);
    if (!res.error) especialista.habilitado = nuevoEstado;
  }

  // --- Nuevo método: descarga los turnos de un paciente en Excel ---
  async descargarExcelTurnos(paciente: any) {
    this.cargando = true;
    try {
      // 1) Traer todos los turnos de este paciente
      const turnos: any[] = await this.supabaseService.getTurnosPorPaciente(paciente.id);

      // 2) Mapearlos a un formato amigable para Excel
      const datos = turnos.map(t => ({
        Fecha:   new Date(t.inicio).toLocaleDateString('es-AR'),
        HoraInicio: new Date(t.inicio).toLocaleTimeString('es-AR', { hour: '2-digit', minute:'2-digit' }),
        HoraFin:    new Date(t.fin).toLocaleTimeString('es-AR', { hour: '2-digit', minute:'2-digit' }),
        Especialista: `${t.nombreEspecialista} ${t.apellidoEspecialista}`,
        Especialidad: t.especialidad,
        Estado:      t.estado
      }));

      // 3) Generar hoja y libro
      const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(datos, { header: [
        'Fecha','HoraInicio','HoraFin','Especialista','Especialidad','Estado'
      ]});
      const wb: XLSX.WorkBook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, `${paciente.nombre}_${paciente.apellido}`);

      // 4) Descargar
      const wbout = XLSX.write(wb, { bookType:'xlsx', type:'array' });
      saveAs(new Blob([wbout], { type: 'application/octet-stream' }),
             `turnos_${paciente.nombre}_${paciente.apellido}.xlsx`);
    } catch (err) {
      console.error('Error descargando turnos:', err);
    } finally {
      this.cargando = false;
    }
  }

descargarExcelUsuarios() {
  // Combinar y normalizar los datos de todas las tablas
  const todos = [
    ...this.pacientes.map(u => ({
      ...u,
      rol: 'Paciente',
      obra_social: u.obra_social ?? '',
      especialidades: '' // Paciente no tiene especialidades
    })),
    ...this.especialistas.map(e => ({
      ...e,
      rol: 'Especialista',
      obra_social: '', // Especialista no tiene obra social
      // Si especialidades es array, lo convertimos a string
      especialidades: Array.isArray(e.especialidades) ? e.especialidades.join(', ') : (e.especialidades ?? '')
    })),
    ...this.administradores.map(a => ({
      ...a,
      rol: 'Administrador',
      obra_social: '',
      especialidades: ''
    })),
  ];

  // Reordenar y limitar campos
  const datos = todos.map(({ id, nombre, apellido, mail, rol, obra_social, especialidades }) => ({
    id, nombre, apellido, mail, rol, obra_social, especialidades
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