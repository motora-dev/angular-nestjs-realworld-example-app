import { InputDirective } from './input';

import type { Meta, StoryObj } from '@storybook/angular';

const meta: Meta<InputDirective> = {
  title: 'UI/Input',
  component: InputDirective,
  tags: ['autodocs'],
  argTypes: {
    error: {
      control: 'boolean',
      description: 'エラー状態を表示',
    },
    class: {
      control: 'text',
      description: '追加のCSSクラス',
    },
  },
  render: (args) => ({
    props: args,
    template: `<input appInput [error]="error" [class]="class" placeholder="テキストを入力..." />`,
  }),
};

export default meta;
type Story = StoryObj<InputDirective>;

/** デフォルトの入力フィールド */
export const Default: Story = {
  args: {
    error: false,
  },
};

/** エラー状態の入力フィールド */
export const Error: Story = {
  args: {
    error: true,
  },
  render: (args) => ({
    props: args,
    template: `<input appInput [error]="error" placeholder="エラーがあります" />`,
  }),
};

/** 無効化された入力フィールド */
export const Disabled: Story = {
  args: {
    error: false,
  },
  render: (args) => ({
    props: args,
    template: `<input appInput [error]="error" placeholder="無効化されています" disabled />`,
  }),
};

/** メールアドレス入力 */
export const Email: Story = {
  args: {
    error: false,
  },
  render: (args) => ({
    props: args,
    template: `<input appInput [error]="error" type="email" placeholder="email@example.com" />`,
  }),
};

/** パスワード入力 */
export const Password: Story = {
  args: {
    error: false,
  },
  render: (args) => ({
    props: args,
    template: `<input appInput [error]="error" type="password" placeholder="パスワード" />`,
  }),
};

/** 数値入力 */
export const Number: Story = {
  args: {
    error: false,
  },
  render: (args) => ({
    props: args,
    template: `<input appInput [error]="error" type="number" placeholder="0" />`,
  }),
};

/** テキストエリア */
export const Textarea: Story = {
  args: {
    error: false,
  },
  render: (args) => ({
    props: args,
    template: `<textarea appInput [error]="error" placeholder="複数行のテキスト..." rows="4"></textarea>`,
  }),
};

/** 値が入力済み */
export const WithValue: Story = {
  args: {
    error: false,
  },
  render: (args) => ({
    props: args,
    template: `<input appInput [error]="error" value="入力済みの値" />`,
  }),
};

/** ファイル選択 */
export const File: Story = {
  args: {
    error: false,
  },
  render: (args) => ({
    props: args,
    template: `<input appInput [error]="error" type="file" />`,
  }),
};

/** 全状態一覧 */
export const AllStates: Story = {
  render: () => ({
    template: `
      <div class="flex flex-col gap-4 max-w-sm">
        <input appInput placeholder="通常状態" />
        <input appInput [error]="true" placeholder="エラー状態" />
        <input appInput placeholder="無効化" disabled />
        <input appInput value="入力済み" />
      </div>
    `,
  }),
};
