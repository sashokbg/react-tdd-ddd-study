import { LocaleEnum } from '@/model/locale.enum';
import { BlockLevel } from '@/model/block-level.type';

/**
 * This chunk is sent whenever a new block content is starting.
 */
export type BlockStartChunk = {
  is_content_display_title: boolean;
  display_title: string;
  name: string;
  level: BlockLevel;
  locale: LocaleEnum;
};
