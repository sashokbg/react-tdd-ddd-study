'use client';

import { BlockStartChunk } from '@/model/block-start-chunk';
import { BlockChunk } from '@/model/block-chunk';
import { LocaleEnum } from '@/model/locale.enum';
import { LocaleContent } from '@/model/locale-content';
import { TranslationError } from '@/model/errors/translation.error';
import { BlockNotFoundError } from '@/model/errors/block-not-found.error';
import {
  computed,
  ReadonlySignal,
  Signal,
  signal,
} from '@preact/signals-react';
import { Block } from '@/model/block';

/**
 * This class is the main aggregate that manages the description of an Article.
 * It provides operations such as #addChunk, #addStartChunk etc. for adding content to the appropriate blocks.
 *
 * The description comprises multiple LocaleContent.
 */
export class DescriptionModel {
  private readonly _languages: LocaleEnum[];
  private readonly _localeContents: Signal<LocaleContent[]>;
  private readonly _currentLocale: Signal<LocaleEnum>;
  private readonly _defaultLocale: LocaleEnum;
  private _run_id = "";
  private readonly _isLoading = signal(false);
  callback: any;

  constructor(callback: any = undefined) {
    this._languages = [LocaleEnum.en_US, LocaleEnum.fr_FR, LocaleEnum.en_UK];
    this._currentLocale = signal(LocaleEnum.en_US);
    this._localeContents = signal([]);
    this._defaultLocale = LocaleEnum.en_US;
    this.callback = callback;
  }

  get isLoading(): ReadonlySignal {
    return this._isLoading;
  }

  get run_id() {
    return this._run_id;
  }

  set run_id(runId: string) {
    this._run_id = runId;
  }

  get defaultLocale(): LocaleEnum {
    return this._defaultLocale;
  }

  get languages() {
    return this._languages;
  }

  get currentLocale() {
    return this._currentLocale;
  }

  get localeContents(): Signal<LocaleContent[]> {
    return this._localeContents;
  }

  getCurrentLocaleContent(): ReadonlySignal<LocaleContent | undefined> {
    return this.getLocaleContent(this.currentLocale.value);
  }

  getLocaleContent(
    locale: LocaleEnum,
  ): ReadonlySignal<LocaleContent | undefined> {
    return computed(() =>
      this._localeContents.value.find((loc) => loc.locale === locale),
    );
  }

  getBlock(locale: LocaleEnum, block_name: string) {
    return computed(() => {
      const localeContent = this._localeContents.value.find(
        (loc) => loc.locale === locale,
      );

      return localeContent?.getBlock(block_name);
    });
  }

  addStartChunk(chunk: BlockStartChunk) {
    console.log('Added start block', chunk);
    let localeContent = this.getLocaleContent(chunk.locale).value;

    if (!localeContent) {
      localeContent = new LocaleContent(chunk.locale);
      this._localeContents.value = [
        ...this._localeContents.value,
        localeContent,
      ];
    }

    const existingBlock = localeContent?.getBlock(chunk.name);
    if (existingBlock) {
      localeContent.reset(chunk.name);

      // if the default locale content has changed, remove all translations
      if (chunk.locale === this.defaultLocale) {
        this.removeAllTranslations();
        this.changeLocale(this.defaultLocale);
      }
    }

    localeContent.addStartChunk(chunk);
    this._isLoading.value = true;
  }

  private removeAllTranslations() {
    this._localeContents.value = [
      ...this._localeContents.value.filter(
        (content) => content.locale === this.defaultLocale,
      ),
    ];
  }

  addChunk(chunk: BlockChunk) {
    console.log('Added chunk', chunk);

    const localeContent = this.getLocaleContent(chunk.locale).value;
    if (!localeContent) {
      throw new BlockNotFoundError(
        `Unable to find block ${chunk.block_name} for locale ${chunk.locale}.`,
      );
    }
    localeContent.addChunk(chunk);
  }

  changeLocale(
    language: LocaleEnum,
    blockName: string | undefined = undefined,
  ) {
    if (
      !this.getLocaleContent(language).value &&
      language != this.defaultLocale
    ) {
      this.translate(language, blockName);
    }
    this._currentLocale.value = language;
  }

  private translate(
    targetLocale: LocaleEnum,
    block_name: string | undefined = undefined,
  ) {
    const defaultLocaleContent = this.getLocaleContent(
      this.defaultLocale,
    ).value;

    this._currentLocale.value = targetLocale;

    if (!defaultLocaleContent) {
      throw new TranslationError(
        `Unable to find locale content for the default locale ${this.defaultLocale}. No block chunks received ?`,
      );
    }

    const targetLocaleContent = this.getLocaleContent(targetLocale).value;

    if (targetLocaleContent) {
      if (block_name) {
        targetLocaleContent.reset(block_name);
      } else {
        targetLocaleContent.resetAll();
      }
    }

    if (block_name) {
      this.callback(this.run_id, targetLocale, block_name);
    } else {
      this.callback(this.run_id, targetLocale);
    }
  }

  resetAll() {
    this.localeContents.value.forEach((content) => content.resetAll());
  }

  onContentFinished() {
    console.log('Content finished');
    this._isLoading.value = false;
  }

  addBlock(block: Block, locale: LocaleEnum.fr_FR | undefined = undefined) {
    this.addStartChunk({
      name: block.name,
      locale: locale || this.currentLocale.value,
      level: block.level,
      display_title: block.displayTitle,
      is_content_display_title: block.isContentDisplayTitle,
    });

    this.addChunk({
      block_name: block.name,
      locale: locale || this.currentLocale.value,
      chunk: block.content.value,
    });

    this.onContentFinished();
  }
}
