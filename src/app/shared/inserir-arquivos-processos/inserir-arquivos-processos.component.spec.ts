import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InserirArquivosProcessosComponent } from './inserir-arquivos-processos.component';

describe('GerenciarProcessosComponent', () => {
  let component: InserirArquivosProcessosComponent;
  let fixture: ComponentFixture<InserirArquivosProcessosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InserirArquivosProcessosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InserirArquivosProcessosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
