import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InserirDocumentoComponent } from './inserir-documento.component';

describe('InserirDocumentoComponent', () => {
  let component: InserirDocumentoComponent;
  let fixture: ComponentFixture<InserirDocumentoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InserirDocumentoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InserirDocumentoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
