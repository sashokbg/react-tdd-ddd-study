import { BlockLevel } from '@/model/block-level.type';
import { signal } from '@preact/signals-react';

export class Block {
  private readonly _name: string;
  private _content = signal<string>('');
  private readonly _level: BlockLevel;
  private readonly _displayTitle: string;
  private readonly _isContentDisplayTitle: boolean;

  constructor(
    name: string,
    level: BlockLevel,
    displayTitle: string,
    isContentDisplayTitle: boolean,
    content: string | undefined = undefined,
  ) {
    this._name = name;
    this._level = level;
    this._displayTitle = displayTitle;
    this._isContentDisplayTitle = isContentDisplayTitle;
    if (content) {
      this._content.value = content;
    }
  }

  get level(): BlockLevel {
    return this._level;
  }

  get displayTitle(): string {
    return this._displayTitle;
  }

  get isContentDisplayTitle(): boolean {
    return this._isContentDisplayTitle;
  }

  get name() {
    return this._name;
  }

  get content() {
    return this._content;
  }

  addContent(item: string) {
    this._content.value += item;
  }

  /**
   * Create a new block from this block with its content reset to an empty string.
   *
   * @return a new block
   */
  freshNewInstance(): Block {
    return new Block(
      this.name,
      this.level,
      this.displayTitle,
      this.isContentDisplayTitle,
    );
  }
}
