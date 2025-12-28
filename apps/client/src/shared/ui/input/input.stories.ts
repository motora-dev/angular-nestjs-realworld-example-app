import { InputDirective } from './input';

import type { Meta, StoryObj } from '@storybook/angular';

const meta: Meta<InputDirective> = {
  title: 'UI/Input',
  component: InputDirective,
  tags: ['autodocs'],
  argTypes: {
    error: {
      control: 'boolean',
      description: 'Show error state',
    },
    class: {
      control: 'text',
      description: 'Additional CSS classes',
    },
  },
  render: (args) => ({
    props: args,
    template: `<input appInput [error]="error" [class]="class" placeholder="Enter text..." />`,
  }),
};

export default meta;
type Story = StoryObj<InputDirective>;

/** Default input field */
export const Default: Story = {
  args: {
    error: false,
  },
};

/** Input field with error state */
export const Error: Story = {
  args: {
    error: true,
  },
  render: (args) => ({
    props: args,
    template: `<input appInput [error]="error" placeholder="Error occurred" />`,
  }),
};

/** Disabled input field */
export const Disabled: Story = {
  args: {
    error: false,
  },
  render: (args) => ({
    props: args,
    template: `<input appInput [error]="error" placeholder="Disabled" />`,
  }),
};

/** Email input */
export const Email: Story = {
  args: {
    error: false,
  },
  render: (args) => ({
    props: args,
    template: `<input appInput [error]="error" type="email" placeholder="email@example.com" />`,
  }),
};

/** Password input */
export const Password: Story = {
  args: {
    error: false,
  },
  render: (args) => ({
    props: args,
    template: `<input appInput [error]="error" type="password" placeholder="Password" />`,
  }),
};

/** Number input */
export const Number: Story = {
  args: {
    error: false,
  },
  render: (args) => ({
    props: args,
    template: `<input appInput [error]="error" type="number" placeholder="0" />`,
  }),
};

/** Textarea */
export const Textarea: Story = {
  args: {
    error: false,
  },
  render: (args) => ({
    props: args,
    template: `<textarea appInput [error]="error" placeholder="Multi-line text..." rows="4"></textarea>`,
  }),
};

/** Input with value */
export const WithValue: Story = {
  args: {
    error: false,
  },
  render: (args) => ({
    props: args,
    template: `<input appInput [error]="error" value="Entered value" />`,
  }),
};

/** File selection */
export const File: Story = {
  args: {
    error: false,
  },
  render: (args) => ({
    props: args,
    template: `<input appInput [error]="error" type="file" />`,
  }),
};

/** All states overview */
export const AllStates: Story = {
  render: () => ({
    template: `
      <div class="flex flex-col gap-4 max-w-sm">
        <input appInput placeholder="Normal state" />
        <input appInput [error]="true" placeholder="Error state" />
        <input appInput placeholder="Disabled" disabled />
        <input appInput value="Entered value" />
      </div>
    `,
  }),
};
