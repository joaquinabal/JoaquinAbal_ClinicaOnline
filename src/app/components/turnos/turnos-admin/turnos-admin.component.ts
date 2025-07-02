import { AfterViewInit, Component,ViewChild, ElementRef ,OnInit } from '@angular/core';
import { SupabaseService } from '../../../services/supabase.service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LoadingService } from '../../../services/loading.service';
import { RouterModule } from '@angular/router';
import { AmPmPipe } from '../../../pipes/ampm/ampm.pipe';
import { FechaPipe } from '../../../pipes/fechaEspañol/fecha-español.pipe';
import Chart from 'chart.js/auto';
import * as XLSX from 'xlsx';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-turnos-admin',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterModule, AmPmPipe, FechaPipe],
  templateUrl: './turnos-admin.component.html',
  styleUrls: ['./turnos-admin.component.css']
})
export class TurnosAdminComponent implements OnInit {

   reporteSeleccionado: 'log'|'porEspecialidad'|'porDia'|'solicitudesMedico'|'finalizadosMedico'|null = null;
  fechaDesde!: string;
  fechaHasta!: string;


  // para el informe
  loginLogs: { nombre: string; apellido: string, fecha_hora: string }[] = [];
    userLoginCounts: { nombre: string; apellido: string; count: number }[] = [];

    @ViewChild('userChart', { static: true }) userChartRef!: ElementRef<HTMLCanvasElement>;
  
  @ViewChild('especialidadChart') espChartRef!: ElementRef<HTMLCanvasElement>;
@ViewChild('diaChart') diaChartRef!: ElementRef<HTMLCanvasElement>;
@ViewChild('medSolicChart') medSolicChartRef!: ElementRef<HTMLCanvasElement>;
@ViewChild('medFinalChart') medFinalChartRef!: ElementRef<HTMLCanvasElement>;


private userChart!: Chart;
private espChart!: Chart;
private diaChart!: Chart;
private medSolicChart!: Chart;
private medFinalChart!: Chart;


  turnos: any[] = [];
  especialidades: string[] = [];
  especialistas: any[] = [];

  filtroEspecialidad: string | null = null;
  filtroEspecialistaId: string | null = null;

  // Para cancelar turno
  turnoACancelar: any = null;
  comentarioCancelacion: string = '';

  cargando = false;

  constructor(private supabase: SupabaseService, private loadingService: LoadingService) {}

  async ngOnInit() {
        this.loadingService.mostrar();
    this.especialidades = await this.supabase.getEspecialidades();
    this.especialistas = await this.supabase.obtenerEspecialistas();
        this.buildUserLoginCounts();
    await this.cargarTurnos();

    // **Carga de logs**  
    this.loginLogs = await this.supabase.getLoginLogs();
   // this.procesarLoginCounts();
    this.loadingService.ocultar();

    console.log(this.loginLogs)

      const map = new Map<string, { nombre: string; apellido: string; count: number }>();
    for (const log of this.loginLogs) {
      const key = `${log.nombre}|||${log.apellido}`;
      const entry = map.get(key);
      if (entry) entry.count++;
      else map.set(key, { nombre: log.nombre, apellido: log.apellido, count: 1 });
    }
    this.userLoginCounts = Array.from(map.values());

        this.crearUserChart();


  }  ngAfterViewInit() {
    // Ahora el <canvas> está disponible

      this.onReporteChange(this.reporteSeleccionado);

  }

   private async ensureEspChart() {
    if (!this.espChart) await this.crearEspChart();
  }


  onReporteChange(sel: string|null) {
  switch(sel) {
    case 'porEspecialidad': this.crearEspChart(); break;
    case 'porDia': this.crearDiaChart(); break;
    case 'solicitudesMedico': this.crearMedSolicChart(); break;
    case 'finalizadosMedico': this.crearMedFinalChart(); break;
  }
}

private async crearEspChart() {
  const data = await this.supabase.getTurnosCountByEspecialidad();
  const ctx = this.espChartRef.nativeElement.getContext('2d')!;
  this.espChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: data.map(d=>d.especialidad),
      datasets: [{ data: data.map(d=>d.count), label: 'Turnos', backgroundColor:'rgba(75,192,192,0.5)' }]
    }
  });
}

private async crearDiaChart() {
  const data = await this.supabase.getTurnosCountByDia();
  const ctx = this.diaChartRef.nativeElement.getContext('2d')!;
  this.diaChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: data.map(d=>d.fecha),
      datasets: [{ data: data.map(d=>d.count), label: 'Turnos/día' }]
    }
  });
}

private async crearMedSolicChart() {
  const data = await this.supabase.getTurnosCountByMedico('Solicitado', this.fechaDesde, this.fechaHasta);
  const ctx = this.medSolicChartRef.nativeElement.getContext('2d')!;
  this.medSolicChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: data.map(d=>`${d.nombre} ${d.apellido}`),
      datasets: [{ data: data.map(d=>d.count), label: 'Solicitados' }]
    }
  });
}

private async crearMedFinalChart() {
  const data = await this.supabase.getTurnosCountByMedico('Realizado', this.fechaDesde, this.fechaHasta);
  const ctx = this.medFinalChartRef.nativeElement.getContext('2d')!;
  this.medFinalChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: data.map(d=>`${d.nombre} ${d.apellido}`),
      datasets: [{ data: data.map(d=>d.count), label: 'Finalizados' }]
    }
  });
}

 private crearUserChart() {
    const ctx = this.userChartRef.nativeElement.getContext('2d')!;
    this.userChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: this.userLoginCounts.map(u => `${u.nombre} ${u.apellido}`),
        datasets: [{
          label: 'Ingresos por usuario',
          data: this.userLoginCounts.map(u => u.count),
          backgroundColor: 'rgba(54,162,235,0.5)',
          borderColor: 'rgba(54,162,235,1)',
          borderWidth: 1
        }]
      },
      options: {
        responsive: false,
        maintainAspectRatio: false,
        scales: {
          x: { ticks: { autoSkip: false }, title: { display: true, text: 'Usuario' } },
          y: { beginAtZero: true, title: { display: true, text: 'Cantidad de Ingresos' } }
        }
      }
    });
  }

  private buildUserLoginCounts() {
    const map = new Map<string, { nombre: string; apellido: string; count: number }>();
    for (const log of this.loginLogs) {
      const key = `${log.nombre}|||${log.apellido}`;
      const entry = map.get(key);
      if (entry) entry.count++;
      else map.set(key, { nombre: log.nombre, apellido: log.apellido, count: 1 });
    }
    this.userLoginCounts = Array.from(map.values());
  } 


  async cargarTurnos() {
    this.cargando = true;
    this.turnos = await this.supabase.getTurnosAdmin();
    this.cargando = false;
  }

  filtrarTurnos() {
    let filtrados = [...this.turnos];
    if (this.filtroEspecialidad)
      filtrados = filtrados.filter(t => t.especialidad === this.filtroEspecialidad);
    if (this.filtroEspecialistaId)
      filtrados = filtrados.filter(t => t.especialista_id === this.filtroEspecialistaId);
    return filtrados;
  }

  puedeCancelar(turno: any) {
    // Solo si estado !== aceptado, realizado o rechazado
    return !['aceptado', 'realizado', 'rechazado', 'cancelado'].includes((turno.estado || '').toLowerCase());
  }

  seleccionarTurnoParaCancelar(turno: any) {
    this.turnoACancelar = turno;
    this.comentarioCancelacion = '';
  }

  async confirmarCancelacion() {
    if (!this.comentarioCancelacion.trim()) {
      alert('Debe ingresar un comentario para cancelar el turno.');
      return;
    }
    await this.supabase.cancelarTurnoAdmin(this.turnoACancelar.id, this.comentarioCancelacion);
    alert('Turno cancelado');
    await this.cargarTurnos();
    this.turnoACancelar = null;
  }

    async downloadExcelTurnosPorEspecialidad() {
    const data = await this.supabase.getTurnosCountByEspecialidad();
    // 1) Crear workbook y hoja
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet('Turnos x Especialidad');
    ws.columns = [
      { header: 'Especialidad', key: 'especialidad', width: 30 },
      { header: 'Cantidad',      key: 'count',        width: 15 }
    ];
    data.forEach(r => ws.addRow(r));

    // 2) Asegurar chart y extraer imagen
        if (!this.espChart) this.crearEspChart();
    const imgBase64 = this.espChart.toBase64Image().split(',')[1];
    const imgId = wb.addImage({ base64: imgBase64, extension: 'png' });

    // 3) Incrustar imagen a partir de la columna D (3) fila 1
    ws.addImage(imgId, {
      tl: { col: 3, row: 1 },
      ext: { width: 500, height: 300 }
    });

    // 4) Descargar
    const buf = await wb.xlsx.writeBuffer();
    saveAs(new Blob([buf]), 'turnos_por_especialidad.xlsx');
  }

  async downloadPdfTurnosPorEspecialidad() {
    const data = await this.supabase.getTurnosCountByEspecialidad();
    const doc = new jsPDF({ unit: 'pt' });
    doc.setFontSize(16);
    doc.text('Turnos por Especialidad', 40, 40);

    autoTable(doc, {
      startY: 60,
      head: [['Especialidad','Cantidad']],
      body: data.map(r => [r.especialidad, r.count.toString()])
    });

    // Nueva página con gráfico
    doc.addPage();
        if (!this.espChart) this.crearEspChart();

    const img = this.espChart.toBase64Image();
    const pw = doc.internal.pageSize.getWidth() - 80;
    doc.addImage(img, 'PNG', 40, 60, pw, pw * 0.6);

    doc.save('turnos_por_especialidad.pdf');
  }

  // --------------------------------------------------
  // 2) POR DÍA
  // --------------------------------------------------

  private async ensureDiaChart() {
    if (!this.diaChart) await this.crearDiaChart();
  }

  async downloadExcelTurnosPorDia() {
    const data = await this.supabase.getTurnosCountByDia();
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet('Turnos x Día');
    ws.columns = [
      { header: 'Fecha',    key: 'fecha', width: 20 },
      { header: 'Cantidad', key: 'count', width: 15 }
    ];
    data.forEach(r => ws.addRow(r));

    if (!this.diaChart) this.crearDiaChart();
    const imgBase64 = this.diaChart.toBase64Image().split(',')[1];
    const imgId = wb.addImage({ base64: imgBase64, extension: 'png' });
    ws.addImage(imgId, { tl: { col: 3, row: 1 }, ext: { width: 500, height: 300 } });

    const buf = await wb.xlsx.writeBuffer();
    saveAs(new Blob([buf]), 'turnos_por_dia.xlsx');
  }

  async downloadPdfTurnosPorDia() {
    const data = await this.supabase.getTurnosCountByDia();
    const doc = new jsPDF({ unit: 'pt' });
    doc.setFontSize(16);
    doc.text('Turnos por Día', 40, 40);

    autoTable(doc, {
      startY: 60,
      head: [['Fecha','Cantidad']],
      body: data.map(r => [r.fecha, r.count.toString()])
    });

    doc.addPage();
    if (!this.diaChart) this.crearDiaChart();
    const img = this.diaChart.toBase64Image();
    const pw = doc.internal.pageSize.getWidth() - 80;
    doc.addImage(img, 'PNG', 40, 60, pw, pw * 0.6);

    doc.save('turnos_por_dia.pdf');
  }

  // --------------------------------------------------
  // 3) POR MÉDICO (Solicitado / Realizado)
  // --------------------------------------------------

  private async ensureMedSolicChart() {
    if (!this.medSolicChart) await this.crearMedSolicChart();
  }
  private async ensureMedFinalChart() {
    if (!this.medFinalChart) await this.crearMedFinalChart();
  }

  async downloadExcelTurnosPorMedico(estado: 'Solicitado'|'Realizado', desde: string, hasta: string) {
    const data = await this.supabase.getTurnosCountByMedico(estado, desde, hasta);
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet(`Turnos ${estado}`);
    ws.columns = [
      { header: 'Médico',   key: 'medico', width: 30 },
      { header: 'Cantidad', key: 'count',  width: 15 }
    ];
    data.forEach(r => ws.addRow({
      medico: `${r.nombre} ${r.apellido}`,
      count:  r.count
    }));

    if (estado === 'Solicitado') {
      if (!this.medSolicChart) this.crearMedSolicChart();
      const imgB = this.medSolicChart.toBase64Image().split(',')[1];
      const id = wb.addImage({ base64: imgB, extension: 'png' });
      ws.addImage(id, { tl:{col:3,row:1}, ext:{width:500,height:300} });
    } else {
      if (!this.medFinalChart) this.crearMedFinalChart();
      const imgB = this.medFinalChart.toBase64Image().split(',')[1];
      const id = wb.addImage({ base64: imgB, extension: 'png' });
      ws.addImage(id, { tl:{col:3,row:1}, ext:{width:500,height:300} });
    }

    const buf = await wb.xlsx.writeBuffer();
    saveAs(new Blob([buf]), `turnos_${estado.toLowerCase()}_por_medico.xlsx`);
  }

  async downloadPdfTurnosPorMedico(estado: 'Solicitado'|'Realizado', desde: string, hasta: string) {
    const data = await this.supabase.getTurnosCountByMedico(estado, desde, hasta);
    const doc = new jsPDF({ unit: 'pt' });
    doc.setFontSize(16);
    doc.text(`Turnos ${estado} por Médico`, 40, 40);
    autoTable(doc, {
      startY: 60,
      head: [['Médico','Cantidad']],
      body: data.map(r => [`${r.nombre} ${r.apellido}`, r.count.toString()])
    });
    doc.addPage();
    if (estado === 'Solicitado') {
      if (!this.medSolicChart) this.crearMedSolicChart();
      const img = this.medSolicChart.toBase64Image();
      const pw = doc.internal.pageSize.getWidth() - 80;
      doc.addImage(img, 'PNG', 40, 60, pw, pw * 0.6);
    } else {
       if (!this.medFinalChart) this.crearMedFinalChart();
      const img = this.medFinalChart.toBase64Image();
      const pw = doc.internal.pageSize.getWidth() - 80;
      doc.addImage(img, 'PNG', 40, 60, pw, pw * 0.6);
    }
    doc.save(`turnos_${estado.toLowerCase()}_por_medico.pdf`);
  }


  /** Excel: dos hojas: Log detalle + Conteo por usuario */
  async downloadExcelLoginLogs() {
  // 1) Worksheet detalle
  const wb = new ExcelJS.Workbook();
  const ws1 = wb.addWorksheet('Detalle Log');
  ws1.columns = [
    { header: 'Nombre', key: 'nombre', width: 20 },
    { header: 'Apellido', key: 'apellido', width: 20 },
    { header: 'Fecha / Hora', key: 'fecha_hora', width: 30 }
  ];
  this.loginLogs.forEach(l => ws1.addRow(l));

  // 2) Worksheet conteo
  const ws2 = wb.addWorksheet('Ingresos x Usuario');
  ws2.columns = [
    { header: 'Nombre', key: 'nombre', width: 20 },
    { header: 'Apellido', key: 'apellido', width: 20 },
    { header: 'Cantidad', key: 'count', width: 15 }
  ];
  this.userLoginCounts.forEach(u => ws2.addRow(u));

  // 3) Incrustar gráfico
  if (!this.userChart) this.crearUserChart();
  const imgData = this.userChart.toBase64Image().split(',')[1];
  const imageId = wb.addImage({ base64: imgData, extension: 'png' });
  ws2.addImage(imageId, {
    tl: { col: 4, row: 1 },
    ext: { width: 500, height: 300 }
  });

  // 4) Descargar
  const buf = await wb.xlsx.writeBuffer();
  saveAs(new Blob([buf], { type: 'application/octet-stream' }), 'login_logs_con_grafico.xlsx');
}


  /** PDF: tabla detalle + tabla conteo + página con gráfica */
   downloadPdfLoginLogs() {
    const doc = new jsPDF({ unit: 'pt' });
    doc.setFontSize(16);
    doc.text('Log de Ingresos al Sistema', 40, 40);

    autoTable(doc, {
      startY: 60,
      head: [['Nombre','Apellido','Fecha / Hora']],
      body: this.loginLogs.map(l=>[l.nombre,l.apellido,l.fecha_hora])
    });

    const yAfter = (doc as any).lastAutoTable.finalY + 20;
    doc.setFontSize(14);
    doc.text('Ingresos por Usuario', 40, yAfter);
    autoTable(doc, {
      startY: yAfter+10,
      head: [['Nombre','Apellido','Cantidad']],
      body: this.userLoginCounts.map(u=>[u.nombre,u.apellido,u.count.toString()])
    });

    doc.addPage();
    const img = this.userChart.toBase64Image();
    const pageW = doc.internal.pageSize.getWidth();
    const chartW = pageW - 80;
    doc.addImage(img,'PNG',40,80,chartW,chartW*0.6);

    doc.save('login_logs.pdf');
  }

    async generarReporte() {
    switch (this.reporteSeleccionado) {
      case 'log':
        this.downloadExcelLoginLogs();
        break;

      case 'porEspecialidad':
        await this.downloadExcelTurnosPorEspecialidad();
        break;

      case 'porDia':
        await this.downloadExcelTurnosPorDia();
        break;

      case 'solicitudesMedico':
        if (!this.fechaDesde || !this.fechaHasta) return alert('Selecciona ambas fechas');
        await this.downloadExcelTurnosPorMedico('Solicitado', this.fechaDesde, this.fechaHasta);
        break;

      case 'finalizadosMedico':
        if (!this.fechaDesde || !this.fechaHasta) return alert('Selecciona ambas fechas');
        await this.downloadExcelTurnosPorMedico('Realizado', this.fechaDesde, this.fechaHasta);
        break;
    }
  }

  



}
