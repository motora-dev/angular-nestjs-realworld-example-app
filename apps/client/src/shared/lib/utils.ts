import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Tailwind CSS クラスを安全にマージするユーティリティ
 * shadcn/ui と同じパターン（clsx + tailwind-merge）
 *
 * @example
 * cn('px-4 py-2', 'bg-blue-500', condition && 'text-white')
 * // => 'px-4 py-2 bg-blue-500 text-white'
 *
 * cn('px-4', 'px-8') // 後勝ち
 * // => 'px-8'
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
