import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StackViewPage } from './stack-view.page';

describe('StackViewPage', () => {
  let component: StackViewPage;
  let fixture: ComponentFixture<StackViewPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(StackViewPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
