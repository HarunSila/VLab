import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CourseCreationPage } from './course-creation.page';

describe('CourseCreationPage', () => {
  let component: CourseCreationPage;
  let fixture: ComponentFixture<CourseCreationPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CourseCreationPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
