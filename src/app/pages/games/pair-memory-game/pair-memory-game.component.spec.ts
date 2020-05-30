import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PairMemoryGameComponent } from './pair-memory-game.component';

describe('PairMemoryGameComponent', () => {
  let component: PairMemoryGameComponent;
  let fixture: ComponentFixture<PairMemoryGameComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PairMemoryGameComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PairMemoryGameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
