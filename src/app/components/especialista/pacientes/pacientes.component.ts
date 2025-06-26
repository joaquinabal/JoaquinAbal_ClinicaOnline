import { Component, OnInit } from '@angular/core';
import { SupabaseService } from '../../../services/supabase.service';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  imports: [CommonModule],
  selector: 'app-pacientes-atendidos-especialista',
  templateUrl: './pacientes.component.html',
})
export class PacientesAtendidosEspecialistaComponent implements OnInit {
  user: any;
  historiasClinicas: any[] = [];

  constructor(private supabase: SupabaseService) {}

  async ngOnInit() {
    this.user = await this.supabase.getUser();
    if (this.user) {
      this.historiasClinicas = await this.supabase.getHistoriasClinicasAtendidosPorEspecialista(this.user.id);
    }
  }
}
