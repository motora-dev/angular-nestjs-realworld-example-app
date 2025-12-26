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
      description: 'ラベルテキスト',
    },
    id: {
      control: 'text',
      description: 'HTML id属性（ラベルとの関連付け用）',
    },
  },
};

export default meta;
type Story = StoryObj<InputFieldComponent>;

/** ラベル付きの基本的な入力フィールド */
export const Default: Story = {
  render: () => {
    const control = new FormControl('');
    return {
      props: { control },
      template: `
        <app-input-field label="ユーザー名" id="username" [control]="control">
          <input appInput id="username" [formControl]="control" placeholder="ユーザー名を入力" />
        </app-input-field>
      `,
    };
  },
};

/** 必須フィールド（タッチ後にエラー表示） */
export const Required: Story = {
  render: () => {
    const control = new FormControl('', [Validators.required]);
    // タッチ状態をシミュレート
    control.markAsTouched();
    return {
      props: { control },
      template: `
        <app-input-field label="メールアドレス" id="email" [control]="control">
          <input appInput id="email" [formControl]="control" [error]="control.invalid && control.touched" placeholder="必須項目です" />
        </app-input-field>
      `,
    };
  },
};

/** 最小文字数バリデーション */
export const MinLength: Story = {
  render: () => {
    const control = new FormControl('ab', [Validators.minLength(5)]);
    control.markAsTouched();
    return {
      props: { control },
      template: `
        <app-input-field label="パスワード" id="password" [control]="control">
          <input appInput id="password" type="password" [formControl]="control" [error]="control.invalid && control.touched" placeholder="5文字以上" />
        </app-input-field>
      `,
    };
  },
};

/** 最大文字数バリデーション */
export const MaxLength: Story = {
  render: () => {
    const control = new FormControl('これは長すぎるテキストです', [Validators.maxLength(10)]);
    control.markAsTouched();
    return {
      props: { control },
      template: `
        <app-input-field label="ニックネーム" id="nickname" [control]="control">
          <input appInput id="nickname" [formControl]="control" [error]="control.invalid && control.touched" placeholder="10文字以内" />
        </app-input-field>
      `,
    };
  },
};

/** メールバリデーション */
export const Email: Story = {
  render: () => {
    const control = new FormControl('invalid-email', [Validators.email]);
    control.markAsTouched();
    return {
      props: { control },
      template: `
        <app-input-field label="メールアドレス" id="email-field" [control]="control">
          <input appInput id="email-field" type="email" [formControl]="control" [error]="control.invalid && control.touched" placeholder="example@email.com" />
        </app-input-field>
      `,
    };
  },
};

/** カスタムエラーメッセージ */
export const CustomErrorMessages: Story = {
  render: () => {
    const control = new FormControl('', [Validators.required]);
    control.markAsTouched();
    const messages = { required: 'この項目は必須入力です' };
    return {
      props: { control, messages },
      template: `
        <app-input-field label="会社名" id="company" [control]="control" [messages]="messages">
          <input appInput id="company" [formControl]="control" [error]="control.invalid && control.touched" placeholder="会社名を入力" />
        </app-input-field>
      `,
    };
  },
};

/** 有効な入力 */
export const Valid: Story = {
  render: () => {
    const control = new FormControl('valid@example.com', [Validators.required, Validators.email]);
    control.markAsTouched();
    return {
      props: { control },
      template: `
        <app-input-field label="メールアドレス" id="valid-email" [control]="control">
          <input appInput id="valid-email" type="email" [formControl]="control" [error]="control.invalid && control.touched" />
        </app-input-field>
      `,
    };
  },
};

/** ラベルなし */
export const WithoutLabel: Story = {
  render: () => {
    const control = new FormControl('');
    return {
      props: { control },
      template: `
        <app-input-field id="no-label" [control]="control">
          <input appInput id="no-label" [formControl]="control" placeholder="ラベルなし入力" />
        </app-input-field>
      `,
    };
  },
};

/** 複数フィールドのフォーム例 */
export const FormExample: Story = {
  render: () => {
    const nameControl = new FormControl('', [Validators.required]);
    const emailControl = new FormControl('', [Validators.required, Validators.email]);
    const messageControl = new FormControl('', [Validators.required, Validators.minLength(10)]);
    return {
      props: { nameControl, emailControl, messageControl },
      template: `
        <form class="flex flex-col gap-4 max-w-md">
          <app-input-field label="お名前" id="form-name" [control]="nameControl">
            <input appInput id="form-name" [formControl]="nameControl" [error]="nameControl.invalid && nameControl.touched" placeholder="山田 太郎" />
          </app-input-field>

          <app-input-field label="メールアドレス" id="form-email" [control]="emailControl">
            <input appInput id="form-email" type="email" [formControl]="emailControl" [error]="emailControl.invalid && emailControl.touched" placeholder="email@example.com" />
          </app-input-field>

          <app-input-field label="お問い合わせ内容" id="form-message" [control]="messageControl">
            <textarea appInput id="form-message" [formControl]="messageControl" [error]="messageControl.invalid && messageControl.touched" placeholder="10文字以上で入力してください" rows="4"></textarea>
          </app-input-field>
        </form>
      `,
    };
  },
};
