import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SupabaseService } from '../../services/supabase.service';
import { RouterLink, RouterModule } from '@angular/router';
import { LoadingService } from '../../services/loading.service';
import { PerfilHoverDirective } from '../../directives/perfil-hover/perfil-hover.directive';
import { CapitalizePipe } from '../../pipes/capitalize/capitalize.pipe';
import { DniFormatPipe } from '../../pipes/dniformat/dniformat.pipe';
import jsPDF from 'jspdf';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-mi-perfil',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, PerfilHoverDirective, CapitalizePipe, DniFormatPipe],
  templateUrl: './mi-perfil.component.html',
  styleUrl: './mi-perfil.component.css'
})
export class MiPerfilComponent implements OnInit {
  historias: any[] = [];
  especialidades: string[] = [];
  especialidadesConTodas: string[] = [];
  selectedEspecialidad = 'Todas';

  // resto de tus props...
  user: any = null;
  dataUsuario: any = null;
  rol: 'paciente'|'especialista'|'administrador'|null = null;

  constructor(
    private supabase: SupabaseService,
    private loadingService: LoadingService
  ) {}

  async ngOnInit() {
    this.user = await this.supabase.getUser();
    if (!this.user) return;

    this.loadingService.mostrar();
    const res = await this.supabase.obtenerDatosUsuarioConRol(this.user.id);
    this.rol = res.rol;
    this.dataUsuario = res.data;

      this.historias = await this.supabase.getHistoriasClinicasPorPaciente(this.user.id);

    // obtengo la lista de especialidades únicas de esas historias
     const setEsp = await this.supabase.getEspecialidades();
    this.especialidadesConTodas = ['Todas', ...setEsp];
    
    this.loadingService.ocultar();
  }

   descargarPdfHistoria() {
    const doc = new jsPDF({ unit: 'pt' });
    const img = new Image();
    img.src = 'assets/logo.png';
    img.onload = () => {
      doc.addImage(img, 'PNG', 40, 40, 60, 60);
      doc.setFontSize(18);
      doc.text('Informe de Historia Clínica', 120, 70);
      doc.setFontSize(12);
      doc.text(`Fecha de emisión: ${new Date().toLocaleDateString()}`, 120, 90);

      let y = 120;
      const filtradas = this.selectedEspecialidad === 'Todas'
        ? this.historias
        : this.historias.filter(h => h.turnos.especialidad === this.selectedEspecialidad);


      filtradas.forEach((h, i) => {
        doc.setFontSize(14);
       // doc.text(`${i + 1}. Especialidad: ${h.especialidad}`, 40, y); y += 20;
        doc.setFontSize(12);
       // doc.text(`Turno ID: ${h.turno_id}`, 60, y);           y += 16;
        doc.text(`Altura: ${h.altura} cm`, 60, y);            y += 16;
        doc.text(`Peso: ${h.peso} kg`, 60, y);                 y += 16;
        doc.text(`Temperatura: ${h.temperatura} °C`, 60, y);  y += 16;
        doc.text(`Presión: ${h.presion}`, 60, y);              y += 20;
        doc.text(`Especialidad: ${h.turnos.especialidad}`, 60, y);              y += 20;

        if (h.adicionales?.length) {
          doc.text('Datos adicionales:', 60, y);              y += 16;
          h.adicionales.forEach((ad: any) => {
            doc.text(`- ${ad.clave}: ${ad.valor}`, 80, y);
            y += 16;
          });
          y += 10;
        }

        if (y > 700) { doc.addPage(); y = 60; }
      });

      doc.save('historia_clinica.pdf');
    };
  }
}