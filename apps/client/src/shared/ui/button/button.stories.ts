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
      description: 'ボタンのスタイルバリアント',
    },
    size: {
      control: 'select',
      options: ['default', 'sm', 'lg', 'icon'],
      description: 'ボタンのサイズ',
    },
    class: {
      control: 'text',
      description: '追加のCSSクラス',
    },
  },
  render: (args) => ({
    props: args,
    template: `<button appButton [variant]="variant" [size]="size" [class]="class">Button</button>`,
  }),
};

export default meta;
type Story = StoryObj<ButtonDirective>;

/** デフォルトのボタンスタイル */
export const Default: Story = {
  args: {
    variant: 'default',
    size: 'default',
  },
};

/** 破壊的なアクション用のボタン */
export const Destructive: Story = {
  args: {
    variant: 'destructive',
    size: 'default',
  },
  render: (args) => ({
    props: args,
    template: `<button appButton [variant]="variant" [size]="size">削除</button>`,
  }),
};

/** アウトラインスタイルのボタン */
export const Outline: Story = {
  args: {
    variant: 'outline',
    size: 'default',
  },
  render: (args) => ({
    props: args,
    template: `<button appButton [variant]="variant" [size]="size">キャンセル</button>`,
  }),
};

/** セカンダリスタイルのボタン */
export const Secondary: Story = {
  args: {
    variant: 'secondary',
    size: 'default',
  },
  render: (args) => ({
    props: args,
    template: `<button appButton [variant]="variant" [size]="size">セカンダリ</button>`,
  }),
};

/** ゴーストスタイルのボタン */
export const Ghost: Story = {
  args: {
    variant: 'ghost',
    size: 'default',
  },
  render: (args) => ({
    props: args,
    template: `<button appButton [variant]="variant" [size]="size">ゴースト</button>`,
  }),
};

/** リンクスタイルのボタン */
export const Link: Story = {
  args: {
    variant: 'link',
    size: 'default',
  },
  render: (args) => ({
    props: args,
    template: `<button appButton [variant]="variant" [size]="size">リンク</button>`,
  }),
};

/** 小さいサイズのボタン */
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

/** 大きいサイズのボタン */
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

/** アイコンボタン */
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

/** 無効化されたボタン */
export const Disabled: Story = {
  args: {
    variant: 'default',
    size: 'default',
  },
  render: (args) => ({
    props: args,
    template: `<button appButton [variant]="variant" [size]="size" disabled>無効</button>`,
  }),
};

/** 全バリアント一覧 */
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

/** 全サイズ一覧 */
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
