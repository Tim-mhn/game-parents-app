import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { QuizzGameComponent } from './quizz-game.component';

describe('QuizzGameComponent', () => {
  let component: QuizzGameComponent;
  let fixture: ComponentFixture<QuizzGameComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ QuizzGameComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QuizzGameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
