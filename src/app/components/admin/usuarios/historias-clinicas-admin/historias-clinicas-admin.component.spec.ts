import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HistoriasClinicasAdminComponent } from './historias-clinicas-admin.component';

describe('HistoriasClinicasAdminComponent', () => {
  let component: HistoriasClinicasAdminComponent;
  let fixture: ComponentFixture<HistoriasClinicasAdminComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HistoriasClinicasAdminComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HistoriasClinicasAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
