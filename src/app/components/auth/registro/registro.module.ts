import { NgModule } from '@angular/core';

import { CommonModule } from '@angular/common';

import { RegistroRoutingModule } from './registro-routing.module';
import { RouterModule } from '@angular/router';
import { RegistroComponent } from './registro.component';

@NgModule({
  declarations: [RegistroComponent],
  imports: [CommonModule, RegistroRoutingModule, RouterModule ]
})
export class RegistroModule {}


