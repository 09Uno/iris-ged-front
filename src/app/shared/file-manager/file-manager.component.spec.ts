import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ArvoreDocumentosComponent } from './file-manager.component';

describe('ArvoreDocumentosComponent', () => {
  let component: ArvoreDocumentosComponent;
  let fixture: ComponentFixture<ArvoreDocumentosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ArvoreDocumentosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ArvoreDocumentosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
