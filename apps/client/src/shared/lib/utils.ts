import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility to safely merge Tailwind CSS classes
 * Same pattern as shadcn/ui (clsx + tailwind-merge)
 *
 * @example
 * cn('px-4 py-2', 'bg-blue-500', condition && 'text-white')
 * // => 'px-4 py-2 bg-blue-500 text-white'
 *
 * cn('px-4', 'px-8') // Last one wins
 * // => 'px-8'
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
