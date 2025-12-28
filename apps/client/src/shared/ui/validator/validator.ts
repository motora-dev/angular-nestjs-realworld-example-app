import { ChangeDetectionStrategy, Component } from '@angular/core';

/**
 * Validator component for i18n extraction
 * This component is used solely to extract validation messages via ng extract-i18n
 * The template contains i18n attributes that will be extracted to messages.xlf
 */
@Component({
  selector: 'app-validator-messages',
  standalone: true,
  templateUrl: './validator.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ValidatorMessagesComponent {}

/** Individual validation error messages using @angular/localize */
export const VALIDATION_MESSAGE_REQUIRED = $localize`:@@validation.required:This field is required`;
export const VALIDATION_MESSAGE_MINLENGTH = $localize`:@@validation.minlength:Insufficient characters`;
export const VALIDATION_MESSAGE_MAXLENGTH = $localize`:@@validation.maxlength:Too many characters`;
export const VALIDATION_MESSAGE_EMAIL = $localize`:@@validation.email:Please enter a valid email address`;
export const VALIDATION_MESSAGE_PATTERN = $localize`:@@validation.pattern:Invalid format`;

/** Localized message prefixes for dynamic validation errors */
export const MINLENGTH_PREFIX = $localize`:@@validation.minlength.withValue:Please enter at least`;
export const MAXLENGTH_PREFIX = $localize`:@@validation.maxlength.withValue:Please enter no more than`;
export const UNKNOWN_ERROR_SUFFIX = $localize`:@@validation.unknown:error`;

/**
 * Format minlength validation error message with dynamic value
 */
export function formatMinLengthMessage(requiredLength: number): string {
  return `${MINLENGTH_PREFIX} ${requiredLength} characters`;
}

/**
 * Format maxlength validation error message with dynamic value
 */
export function formatMaxLengthMessage(requiredLength: number): string {
  return `${MAXLENGTH_PREFIX} ${requiredLength} characters`;
}

/**
 * Format unknown validation error message
 */
export function formatUnknownErrorMessage(key: string): string {
  return `${key} ${UNKNOWN_ERROR_SUFFIX}`;
}
