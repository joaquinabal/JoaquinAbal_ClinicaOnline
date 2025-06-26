import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HistoriaClinicaFormComponent } from './historia-clinica-form.component';

describe('HistoriaClinicaFormComponent', () => {
  let component: HistoriaClinicaFormComponent;
  let fixture: ComponentFixture<HistoriaClinicaFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HistoriaClinicaFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HistoriaClinicaFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
