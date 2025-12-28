import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { moduleMetadata } from '@storybook/angular';

import { InputFieldComponent } from './input-field';
import { InputDirective } from '../../../shared/ui/input/input';

import type { Meta, StoryObj } from '@storybook/angular';

const meta: Meta<InputFieldComponent> = {
  title: 'Components/InputField',
  component: InputFieldComponent,
  tags: ['autodocs'],
  decorators: [
    moduleMetadata({
      imports: [ReactiveFormsModule, InputDirective],
    }),
  ],
  argTypes: {
    label: {
      control: 'text',
      description: 'Label text',
    },
    id: {
      control: 'text',
      description: 'HTML id attribute (for label association)',
    },
  },
};

export default meta;
type Story = StoryObj<InputFieldComponent>;

/** Basic input field with label */
export const Default: Story = {
  render: () => {
    const control = new FormControl('');
    return {
      props: { control },
      template: `
        <app-input-field label="Username" id="username" [control]="control">
          <input appInput id="username" [formControl]="control" placeholder="Enter username" />
        </app-input-field>
      `,
    };
  },
};

/** Required field (shows error after touch) */
export const Required: Story = {
  render: () => {
    const control = new FormControl('', [Validators.required]);
    // Simulate touched state
    control.markAsTouched();
    return {
      props: { control },
      template: `
        <app-input-field label="Email" id="email" [control]="control">
          <input appInput id="email" [formControl]="control" [error]="control.invalid && control.touched" placeholder="This field is required" />
        </app-input-field>
      `,
    };
  },
};

/** Minimum length validation */
export const MinLength: Story = {
  render: () => {
    const control = new FormControl('ab', [Validators.minLength(5)]);
    control.markAsTouched();
    return {
      props: { control },
      template: `
        <app-input-field label="Password" id="password" [control]="control">
          <input appInput id="password" type="password" [formControl]="control" [error]="control.invalid && control.touched" placeholder="At least 5 characters" />
        </app-input-field>
      `,
    };
  },
};

/** Maximum length validation */
export const MaxLength: Story = {
  render: () => {
    const control = new FormControl('This text is too long', [Validators.maxLength(10)]);
    control.markAsTouched();
    return {
      props: { control },
      template: `
        <app-input-field label="Nickname" id="nickname" [control]="control">
          <input appInput id="nickname" [formControl]="control" [error]="control.invalid && control.touched" placeholder="Max 10 characters" />
        </app-input-field>
      `,
    };
  },
};

/** Email validation */
export const Email: Story = {
  render: () => {
    const control = new FormControl('invalid-email', [Validators.email]);
    control.markAsTouched();
    return {
      props: { control },
      template: `
        <app-input-field label="Email" id="email-field" [control]="control">
          <input appInput id="email-field" type="email" [formControl]="control" [error]="control.invalid && control.touched" placeholder="example@email.com" />
        </app-input-field>
      `,
    };
  },
};

/** Custom error messages */
export const CustomErrorMessages: Story = {
  render: () => {
    const control = new FormControl('', [Validators.required]);
    control.markAsTouched();
    const messages = { required: 'This field is required' };
    return {
      props: { control, messages },
      template: `
        <app-input-field label="Company Name" id="company" [control]="control" [messages]="messages">
          <input appInput id="company" [formControl]="control" [error]="control.invalid && control.touched" placeholder="Enter company name" />
        </app-input-field>
      `,
    };
  },
};

/** Valid input */
export const Valid: Story = {
  render: () => {
    const control = new FormControl('valid@example.com', [Validators.required, Validators.email]);
    control.markAsTouched();
    return {
      props: { control },
      template: `
        <app-input-field label="Email" id="valid-email" [control]="control">
          <input appInput id="valid-email" type="email" [formControl]="control" [error]="control.invalid && control.touched" />
        </app-input-field>
      `,
    };
  },
};

/** Without label */
export const WithoutLabel: Story = {
  render: () => {
    const control = new FormControl('');
    return {
      props: { control },
      template: `
        <app-input-field id="no-label" [control]="control">
          <input appInput id="no-label" [formControl]="control" placeholder="Input without label" />
        </app-input-field>
      `,
    };
  },
};

/** Form example with multiple fields */
export const FormExample: Story = {
  render: () => {
    const nameControl = new FormControl('', [Validators.required]);
    const emailControl = new FormControl('', [Validators.required, Validators.email]);
    const messageControl = new FormControl('', [Validators.required, Validators.minLength(10)]);
    return {
      props: { nameControl, emailControl, messageControl },
      template: `
        <form class="flex flex-col gap-4 max-w-md">
          <app-input-field label="Name" id="form-name" [control]="nameControl">
            <input appInput id="form-name" [formControl]="nameControl" [error]="nameControl.invalid && nameControl.touched" placeholder="John Doe" />
          </app-input-field>

          <app-input-field label="Email" id="form-email" [control]="emailControl">
            <input appInput id="form-email" type="email" [formControl]="emailControl" [error]="emailControl.invalid && emailControl.touched" placeholder="email@example.com" />
          </app-input-field>

          <app-input-field label="Message" id="form-message" [control]="messageControl">
            <textarea appInput id="form-message" [formControl]="messageControl" [error]="messageControl.invalid && messageControl.touched" placeholder="Enter at least 10 characters" rows="4"></textarea>
          </app-input-field>
        </form>
      `,
    };
  },
};
