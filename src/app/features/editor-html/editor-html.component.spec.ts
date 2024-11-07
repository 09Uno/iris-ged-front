import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditorHtmlComponent } from './editor-html.component';

describe('EditorHtmlComponent', () => {
  let component: EditorHtmlComponent;
  let fixture: ComponentFixture<EditorHtmlComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditorHtmlComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditorHtmlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
