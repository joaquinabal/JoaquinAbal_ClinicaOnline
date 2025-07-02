// src/app/components/pacientes/pacientes-atendidos-especialista.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SupabaseService } from '../../../services/supabase.service';
import { AmPmPipe } from '../../../pipes/ampm/ampm.pipe';
import { FechaPipe } from '../../../pipes/fechaEspañol/fecha-español.pipe';

interface PacienteCard {
  pacienteId: string;
  nombre: string;
  apellido: string;
  foto: string;
  ultimosTurnos: string[]; // ISO strings
}

@Component({
  standalone: true,
  imports: [CommonModule, AmPmPipe, FechaPipe],
  selector: 'app-pacientes-atendidos-especialista',
  templateUrl: './pacientes.component.html',
  styleUrls: ['./pacientes.component.css']
})
export class PacientesAtendidosEspecialistaComponent implements OnInit {
  userId = '';
  pacientesCards: PacienteCard[] = [];
  expandedId: string | null = null;
  historiasMap: Record<string, any[]> = {};

  constructor(private supabase: SupabaseService) {}

  async ngOnInit() {
    const user = await this.supabase.getUser();
    if (!user) return;
    this.userId = user.id;

    const turnos = await this.supabase.getTurnosPorEspecialista(this.userId);
    const map = new Map<string, PacienteCard>();

    for (let t of turnos) {
      const pid = t.paciente_id;
      if (!map.has(pid)) {
        map.set(pid, {
          pacienteId: pid,
          nombre: t.nombrePaciente,
          apellido: t.apellidoPaciente,
          foto: (t as any).pacientes?.imagen1 || 'assets/user-default.png',
          ultimosTurnos: []
        });
      }
      const card = map.get(pid)!;
      if (card.ultimosTurnos.length < 3) {
        // guardamos el ISO para formatearlo en la vista
        card.ultimosTurnos.push(t.inicio);
      }
    }

    this.pacientesCards = Array.from(map.values());
  }

  async toggleHistoria(pacienteId: string) {
    if (this.expandedId === pacienteId) {
      this.expandedId = null;
      return;
    }
    this.expandedId = pacienteId;
    if (!this.historiasMap[pacienteId]) {
      this.historiasMap[pacienteId] = await this.supabase.getHistoriasClinicasPorPaciente(pacienteId);
    }
  }
}
