import {LocaleEnum} from '@/model/locale.enum';
import {Block} from '@/model/block';
import {BlockStartChunk} from '@/model/block-start-chunk';
import {BlockChunk} from '@/model/block-chunk';
import {BlockNotFoundError} from '@/model/errors/block-not-found.error';
import {LocaleMismatchError} from '@/model/errors/locale-mismatch.error';
import {signal, Signal} from "@preact/signals-react";

export class LocaleContent {
  private readonly _locale: LocaleEnum;
  private readonly _blocks: Signal<Block[]>;


  constructor(locale: LocaleEnum) {
    this._locale = locale;
    this._blocks = signal([]);
  }

  get locale() {
    return this._locale;
  }

  get blocks() {
    return this._blocks;
  }

  getBlock(block_name: string) {
    return this._blocks.value.find((block) => block.name === block_name);
  }

  addStartChunk(chunk: BlockStartChunk) {
    if (chunk.locale !== this._locale) {
      throw new LocaleMismatchError(
        `Cannot add a chunk with local ${chunk.locale} for a locale content ${this.locale}`,
      );
    }

    const existingBlock = this.getBlock(chunk.name);

    if (!existingBlock) {
      this._blocks.value = [...this._blocks.value,
        new Block(
          chunk.name,
          chunk.level,
          chunk.display_title,
          chunk.is_content_display_title,
        ),
      ];
    }
  }

  addChunk(chunk: BlockChunk) {
    const existingBlock = this.getBlock(chunk.block_name);

    if (!existingBlock) {
      throw new BlockNotFoundError(
        `Block ${chunk.block_name} has not been yet started`,
      );
    }

    existingBlock.addContent(chunk.chunk);
  }

  resetAll() {
    for (let i = 0; i < this._blocks.value.length; i++) {
      const existingBlock = this._blocks.value[i];
      this._blocks.value[i] = existingBlock.freshNewInstance();
    }
  }

  reset(block_name: string) {
    for (let i = 0; i < this._blocks.value.length; i++) {
      const existingBlock = this._blocks.value[i];
      if (existingBlock.name === block_name) {
        this._blocks.value[i] = existingBlock.freshNewInstance();
        this._blocks.value = [...this._blocks.value]
      }
    }
  }
}
