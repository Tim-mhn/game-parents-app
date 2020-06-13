import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogElementComponent } from './dialog-element.component';

describe('DialogElementComponent', () => {
  let component: DialogElementComponent;
  let fixture: ComponentFixture<DialogElementComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DialogElementComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogElementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
