'use client'

import {BlockStartChunk} from '@/model/block-start-chunk';
import {BlockChunk} from '@/model/block-chunk';
import {LocaleEnum} from '@/model/locale.enum';
import {LocaleContent} from '@/model/locale-content';
import {TranslationError} from '@/model/errors/translation.error';
import {BlockNotFoundError} from '@/model/errors/block-not-found.error';
import {computed, ReadonlySignal, Signal, signal} from "@preact/signals-react";

export class DescriptionModel {
  private readonly _languages: LocaleEnum[];
  private readonly _localeContents: Signal<LocaleContent[]>;
  private _currentLocale: Signal<LocaleEnum>;
  private readonly startTranslationCallback: any;
  private readonly _defaultLocale: LocaleEnum;
  private readonly _run_id: string;
  isLoading = signal(false);

  constructor(run_id: string, startTranslationCallback: any) {
    this._languages = [LocaleEnum.en_US, LocaleEnum.fr_FR, LocaleEnum.en_UK];
    this._currentLocale = signal(LocaleEnum.en_US);
    this._localeContents = signal([]);
    this.startTranslationCallback = startTranslationCallback;
    this._defaultLocale = LocaleEnum.en_US;
    if (!run_id) {
      throw new Error('Run id is required !');
    }
    this._run_id = run_id;
  }

  get run_id() {
    return this._run_id;
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

  getLocaleContent(locale: LocaleEnum): ReadonlySignal<LocaleContent | undefined> {
    return computed(() => this._localeContents.value.find((loc) => loc.locale === locale));
  }

  getBlock(locale: LocaleEnum, block_name: string) {
    return computed(() => {
      const localeContent = this._localeContents.value.find(
        (loc) => loc.locale === locale,
      );

      return localeContent?.getBlock(block_name);
    })
  }

  addStartChunk(chunk: BlockStartChunk) {
    console.log('Adding a new block', chunk);
    let localeContent = this.getLocaleContent(chunk.locale).value;

    if (!localeContent) {
      localeContent = new LocaleContent(chunk.locale);
      this._localeContents.value = [...this._localeContents.value, localeContent];
    }

    const existingBlock = localeContent?.getBlock(chunk.name);
    if (existingBlock) {
      localeContent.reset(chunk.name);
    }

    localeContent.addStartChunk(chunk);
    this.isLoading.value = true;
  }

  addChunk(chunk: BlockChunk) {
    console.log('Adding a chunk to block', chunk);

    const localeContent = this.getLocaleContent(chunk.locale).value;
    if (!localeContent) {
      throw new BlockNotFoundError(
        `Unable to find block ${chunk.block_name} for locale ${chunk.locale}.`,
      );
    }
    localeContent.addChunk(chunk);
  }

  changeLocale(language: LocaleEnum) {
    this._currentLocale.value = language;
  }

  translate(
    targetLocale: LocaleEnum,
    block_name: string | undefined = undefined,
  ) {
    const defaultLocaleContent = this.getLocaleContent(this.defaultLocale).value;

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
      this.startTranslationCallback(this.run_id, targetLocale, block_name);
    } else {
      this.startTranslationCallback(this.run_id, targetLocale);
    }
  }

  resetAll() {
    this.localeContents.value.forEach((content) => content.resetAll());
  }

  onContentFinished() {
    this.isLoading.value = false;
  }
}
