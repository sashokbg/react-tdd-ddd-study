import { LocaleEnum } from '@/model/locale.enum';

/**
 * A chunk of information generated for a specific block for a specific translation (locale)
 */
export type BlockChunk = {
  block_name: string;
  chunk: string;
  locale: LocaleEnum;
};
