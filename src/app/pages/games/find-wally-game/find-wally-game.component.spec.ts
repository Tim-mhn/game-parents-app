import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FindWallyGameComponent } from './find-wally-game.component';

describe('FindWallyGameComponent', () => {
  let component: FindWallyGameComponent;
  let fixture: ComponentFixture<FindWallyGameComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FindWallyGameComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FindWallyGameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
