import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BranchesView } from './branches-view';

describe('BranchesView', () => {
  let component: BranchesView;
  let fixture: ComponentFixture<BranchesView>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BranchesView]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BranchesView);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
