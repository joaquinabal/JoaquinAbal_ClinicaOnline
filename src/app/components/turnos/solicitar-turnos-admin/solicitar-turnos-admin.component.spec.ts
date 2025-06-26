import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SolicitarTurnosAdminComponent } from './solicitar-turnos-admin.component';

describe('SolicitarTurnosAdminComponent', () => {
  let component: SolicitarTurnosAdminComponent;
  let fixture: ComponentFixture<SolicitarTurnosAdminComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SolicitarTurnosAdminComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SolicitarTurnosAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
