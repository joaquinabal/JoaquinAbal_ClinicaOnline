import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-cuenta-confirmada',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cuenta-confirmada.component.html',
  styleUrls: ['./cuenta-confirmada.component.css']
})
export class CuentaConfirmadaComponent implements OnInit {

  constructor(private router: Router, private location: Location) {}

  ngOnInit(): void {
    // ⚠️ Borramos el hash (#access_token...) de la URL por seguridad y para evitar login automático
    this.location.replaceState('/cuenta-confirmada');

    // Redirigir luego de 5 segundos
    setTimeout(() => {
      this.router.navigate(['/home']);
    }, 5000);
  }
}
