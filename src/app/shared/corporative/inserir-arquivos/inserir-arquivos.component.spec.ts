import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InserirArquivosComponent } from './inserir-arquivos.component';

describe('InserirArquivosComponent', () => {
  let component: InserirArquivosComponent;
  let fixture: ComponentFixture<InserirArquivosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InserirArquivosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InserirArquivosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
