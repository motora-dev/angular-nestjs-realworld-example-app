import { ButtonDirective } from './button';

import type { Meta, StoryObj } from '@storybook/angular';

const meta: Meta<ButtonDirective> = {
  title: 'UI/Button',
  component: ButtonDirective,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'],
      description: 'Button style variant',
    },
    size: {
      control: 'select',
      options: ['default', 'sm', 'lg', 'icon'],
      description: 'Button size',
    },
    class: {
      control: 'text',
      description: 'Additional CSS classes',
    },
  },
  render: (args) => ({
    props: args,
    template: `<button appButton [variant]="variant" [size]="size" [class]="class">Button</button>`,
  }),
};

export default meta;
type Story = StoryObj<ButtonDirective>;

/** Default button style */
export const Default: Story = {
  args: {
    variant: 'default',
    size: 'default',
  },
};

/** Button for destructive actions */
export const Destructive: Story = {
  args: {
    variant: 'destructive',
    size: 'default',
  },
  render: (args) => ({
    props: args,
    template: `<button appButton [variant]="variant" [size]="size">Delete</button>`,
  }),
};

/** Outline style button */
export const Outline: Story = {
  args: {
    variant: 'outline',
    size: 'default',
  },
  render: (args) => ({
    props: args,
    template: `<button appButton [variant]="variant" [size]="size">Cancel</button>`,
  }),
};

/** Secondary style button */
export const Secondary: Story = {
  args: {
    variant: 'secondary',
    size: 'default',
  },
  render: (args) => ({
    props: args,
    template: `<button appButton [variant]="variant" [size]="size">Secondary</button>`,
  }),
};

/** Ghost style button */
export const Ghost: Story = {
  args: {
    variant: 'ghost',
    size: 'default',
  },
  render: (args) => ({
    props: args,
    template: `<button appButton [variant]="variant" [size]="size">Ghost</button>`,
  }),
};

/** Link style button */
export const Link: Story = {
  args: {
    variant: 'link',
    size: 'default',
  },
  render: (args) => ({
    props: args,
    template: `<button appButton [variant]="variant" [size]="size">Link</button>`,
  }),
};

/** Small size button */
export const Small: Story = {
  args: {
    variant: 'default',
    size: 'sm',
  },
  render: (args) => ({
    props: args,
    template: `<button appButton [variant]="variant" [size]="size">Small</button>`,
  }),
};

/** Large size button */
export const Large: Story = {
  args: {
    variant: 'default',
    size: 'lg',
  },
  render: (args) => ({
    props: args,
    template: `<button appButton [variant]="variant" [size]="size">Large</button>`,
  }),
};

/** Icon button */
export const Icon: Story = {
  args: {
    variant: 'outline',
    size: 'icon',
  },
  render: (args) => ({
    props: args,
    template: `
      <button appButton [variant]="variant" [size]="size">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M5 12h14"/>
          <path d="M12 5v14"/>
        </svg>
      </button>
    `,
  }),
};

/** Disabled button */
export const Disabled: Story = {
  args: {
    variant: 'default',
    size: 'default',
  },
  render: (args) => ({
    props: args,
    template: `<button appButton [variant]="variant" [size]="size" disabled>Disabled</button>`,
  }),
};

/** All variants overview */
export const AllVariants: Story = {
  render: () => ({
    template: `
      <div class="flex flex-wrap gap-4">
        <button appButton variant="default">Default</button>
        <button appButton variant="destructive">Destructive</button>
        <button appButton variant="outline">Outline</button>
        <button appButton variant="secondary">Secondary</button>
        <button appButton variant="ghost">Ghost</button>
        <button appButton variant="link">Link</button>
      </div>
    `,
  }),
};

/** All sizes overview */
export const AllSizes: Story = {
  render: () => ({
    template: `
      <div class="flex items-center gap-4">
        <button appButton size="sm">Small</button>
        <button appButton size="default">Default</button>
        <button appButton size="lg">Large</button>
        <button appButton size="icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M5 12h14"/>
            <path d="M12 5v14"/>
          </svg>
        </button>
      </div>
    `,
  }),
};
