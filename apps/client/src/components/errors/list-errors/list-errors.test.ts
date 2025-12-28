import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, expect, it, beforeEach } from 'vitest';

import { Errors, ListErrorsComponent } from './list-errors';

describe('ListErrorsComponent', () => {
  let component: ListErrorsComponent;
  let fixture: ComponentFixture<ListErrorsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListErrorsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ListErrorsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('errorList', () => {
    it('should return empty array when errors is null', () => {
      fixture.componentRef.setInput('errors', null);
      fixture.detectChanges();
      expect(component.errorList()).toEqual([]);
    });

    it('should return empty array when errors.errors is undefined', () => {
      fixture.componentRef.setInput('errors', {} as Errors);
      fixture.detectChanges();
      expect(component.errorList()).toEqual([]);
    });

    it('should return empty array when errors.errors is null', () => {
      fixture.componentRef.setInput('errors', { errors: null } as any);
      fixture.detectChanges();
      expect(component.errorList()).toEqual([]);
    });

    it('should return formatted error list', () => {
      const errors: Errors = {
        errors: {
          username: 'is required',
          email: 'is invalid',
        },
      };
      fixture.componentRef.setInput('errors', errors);
      fixture.detectChanges();

      const errorList = component.errorList();
      expect(errorList).toHaveLength(2);
      expect(errorList).toContain('username is required');
      expect(errorList).toContain('email is invalid');
    });

    it('should handle empty errors object', () => {
      const errors: Errors = {
        errors: {},
      };
      fixture.componentRef.setInput('errors', errors);
      fixture.detectChanges();

      expect(component.errorList()).toEqual([]);
    });
  });
});
