  import { Component, OnInit } from '@angular/core';
  import { SupabaseService } from '../../../services/supabase.service';
  import { ToastrService } from 'ngx-toastr';
  import { CommonModule } from '@angular/common';
  import { FormsModule } from '@angular/forms';
import { AmPmPipe } from '../../../pipes/ampm/ampm.pipe';
import { FechaPipe } from '../../../pipes/fechaEspañol/fecha-español.pipe';

  @Component({
    selector: 'app-mis-turnos-especialista',
    standalone: true,
    imports: [CommonModule, FormsModule, AmPmPipe, FechaPipe],
    templateUrl: './mis-turnos-especialista.component.html',
  })
  export class MisTurnosEspecialistaComponent implements OnInit {
    turnos: any[] = [];
    filtroEspecialidad = '';  
    filtroPaciente = '';
    userId: string = '';
    filtroTurno = '';

    abierto: { [turnoId: string]: 'rechazo' | 'cancelacion' | 'resena' | null } = {};
    input: { [turnoId: string]: string } = {};
    mensaje: { [turnoId: string]: string } = {};

    // Historia clínica
    turnoAbierto: string | null = null; // ID del turno que se está editando
    historia: any = {
      altura: null,
      peso: null,
      temperatura: null,
      presion: '',
      adicionales: []
    };

    historiasClinicasMap: { [turnoId: string]: any } = {};  

    constructor(private supabase: SupabaseService, private toastr: ToastrService) {}

    async ngOnInit() {
       // Cargá los turnos
  const user = await this.supabase.getUser();
  if (user) {
    this.userId = user.id;
  }
  this.turnos = await this.supabase.getTurnosPorEspecialista(this.userId);

  // Cargá las historias clínicas SOLO de estos turnos
  const turnoIds = this.turnos.map(t => t.id);
  const historias = await this.supabase.getHistoriasClinicasPorTurnos(turnoIds);
  console.log(historias)

  // Armá un diccionario para lookup rápido por turno_id
  this.historiasClinicasMap = {};
  for (const h of historias) {
    this.historiasClinicasMap[h.turno_id] = h;
  }  
  console.log(this.historiasClinicasMap)                                              
    }

turnosFiltrados() {
  const f = this.filtroTurno?.toLowerCase() ?? '';
  return this.turnos.filter(turno => {
    // Campos principales
    const camposPrincipales = [
      `especialidad: ${turno.especialidad}`,
      `nombre: ${turno.nombrePaciente}`,
      `apellido: ${turno.apellidoPaciente}`,
      `estado: ${turno.estado}`,
      `inicio: ${turno.inicio}`,
      `fin: ${turno.fin}`,
      `resena: ${turno.resena}`,
    ].map(x => (x ?? '').toString().toLowerCase());

    // Historia clínica (si existe)
    let historiaCampos: string[] = [];
    const historia = this.historiasClinicasMap[turno.id];
    if (historia) {
      historiaCampos = [
        `altura: ${historia.altura}`,
        `peso: ${historia.peso}`,
        `temperatura: ${historia.temperatura}`,
        `presion: ${historia.presion}`,
        ...(historia.adicionales?.map((ad: any) => `${ad.clave}: ${ad.valor}`) ?? [])
      ].map(x => (x ?? '').toString().toLowerCase());
    }

    const allCampos = [...camposPrincipales, ...historiaCampos];
    return allCampos.some(campo => campo.includes(f));
  });
}


    // --- Acciones de turnos ---
    puedeAceptar(estado: string) { return !['Realizado','Cancelado','Rechazado'].includes(estado); }
    puedeRechazar(estado: string) { return !['Aceptado','Realizado','Cancelado','Rechazado'].includes(estado); }
    puedeCancelar(estado: string) { return !['Aceptado','Realizado','Rechazado'].includes(estado); }
    puedeFinalizar(estado: string) { return estado === 'Aceptado'; }
    puedeVerResena(turno: any) { return turno.resena && turno.resena.trim() !== ''; }

    abrirInput(turnoId: string, tipo: 'rechazo' | 'cancelacion' | 'resena') { this.abierto[turnoId] = tipo; }
    cerrarInput(turnoId: string) { this.abierto[turnoId] = null; this.input[turnoId] = ''; }

    async aceptarTurno(turno: any) {
      await this.supabase.actualizarEstadoTurno(turno.id, 'Aceptado');
      turno.estado = 'Aceptado';
      this.mensaje[turno.id] = 'Turno aceptado.';
      this.toastr.success('Turno aceptado');
    }

    async rechazarTurno(turno: any) {
      const motivo = this.input[turno.id]?.trim();
      if (!motivo) {
        this.toastr.error('Debes ingresar un motivo');
        return;
      }
      await this.supabase.rechazarTurno(turno.id, motivo);
      turno.estado = 'Rechazado';
      this.mensaje[turno.id] = 'Turno rechazado.';
      this.toastr.success('Turno rechazado');
      this.cerrarInput(turno.id);
    }

    async cancelarTurno(turno: any) {
      const motivo = this.input[turno.id]?.trim();
      if (!motivo) {
        this.toastr.error('Debes ingresar un motivo');
        return;
      }
      await this.supabase.cancelarTurno(turno.id, motivo);
      turno.estado = 'Cancelado';
      this.mensaje[turno.id] = 'Turno cancelado.';
      this.toastr.success('Turno cancelado');
      this.cerrarInput(turno.id);
    }

    async finalizarTurno(turno: any) {
      const resena = this.input[turno.id]?.trim();
      if (!resena) {
        this.toastr.error('Debes ingresar una reseña');
        return;
      }
      await this.supabase.finalizarTurno(turno.id, resena);
      turno.estado = 'Realizado';
      turno.resena = resena;
      this.mensaje[turno.id] = 'Turno finalizado.';
      this.toastr.success('Turno finalizado');
      this.cerrarInput(turno.id);
    }

    puedeCargarHistoria(turno: any) {
    return turno.estado === 'Realizado' && !turno.historiaClinicaCargada;
  }

  abrirHistoria(turnoId: string) {
    this.turnoAbierto = turnoId;
    this.historia = {
      altura: null,
      peso: null,
      temperatura: null,
      presion: '',
      adicionales: []
    };
  }

  cerrarHistoria() {
    this.turnoAbierto = null;
    this.historia = {
      altura: null,
      peso: null,
      temperatura: null,
      presion: '',
      adicionales: []
    };
  }

  agregarAdicional() {
    if (this.historia.adicionales.length < 3) {
      this.historia.adicionales.push({ clave: '', valor: '' });
    }
  }

  eliminarAdicional(i: number) {
    this.historia.adicionales.splice(i, 1);
  }

  async guardarHistoriaClinica(turno: any) {
    // Validación simple
    if (!this.historia.altura || !this.historia.peso || !this.historia.temperatura || !this.historia.presion) {
      this.toastr.warning('Complete todos los campos obligatorios.', 'Campos requeridos');
      return;
    }
    console.log(this.historia)
    const data = await this.supabase.cargarHistoriaClinica(turno, this.historia);
    console.log(data)
    if (data) {
      this.toastr.success('Historia clínica guardada con éxito.');
      turno.historiaClinicaCargada = true;
      this.cerrarHistoria();
    } else {
      this.toastr.error('Error al guardar la historia clínica.');
    }
  }


    // Cambia los estilos de estado del turno
    estadoClass(estado: string) {
      switch (estado) {
        case 'Cancelado': return 'text-danger fw-bold';
        case 'Realizado': return 'text-success fw-bold';
        case 'Solicitado': return 'text-primary fw-bold';
        case 'Aceptado': return 'text-warning fw-bold';
        case 'Rechazado': return 'text-muted fw-bold';
        default: return 'text-secondary';
      }
    }
  }
