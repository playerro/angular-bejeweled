import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GamefieldComponent } from './gamefield.component';

describe('GamefieldComponent', () => {
  let component: GamefieldComponent;
  let fixture: ComponentFixture<GamefieldComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GamefieldComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GamefieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
