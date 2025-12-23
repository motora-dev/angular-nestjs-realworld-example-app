import { createId } from '@paralleldrive/cuid2';

/**
 * URLセーフな公開IDを生成
 * CUID2を使用 (24文字, 衝突耐性が高く、推測不可能)
 */
export const generatePublicId = (): string => {
  return createId();
};
