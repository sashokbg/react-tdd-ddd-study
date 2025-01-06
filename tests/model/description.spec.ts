import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { LocaleEnum } from '@/model/locale.enum';
import { TranslationError } from '@/model/errors/translation.error';
import { DescriptionModel } from '@/model/description-model';
import { BlockNotFoundError } from '@/model/errors/block-not-found.error';
import { Block } from '@/model/block';

const mockCallback = jest.fn();

function prepareArticle(): DescriptionModel {
  let descriptionModel = new DescriptionModel(mockCallback);
  descriptionModel.run_id = 'run1';
  return descriptionModel;
}

function addEnUsTitle(desc: DescriptionModel) {
  desc.addStartChunk({
    is_content_display_title: true,
    display_title: 'title',
    name: 'title',
    level: 0,
    locale: LocaleEnum.en_US,
  });

  desc.addChunk({
    block_name: 'title',
    chunk: 'Hello World',
    locale: LocaleEnum.en_US,
  });

  return desc;
}

function addEnUsDescription(desc: DescriptionModel) {
  desc.addStartChunk({
    is_content_display_title: true,
    display_title: 'Short Description',
    name: 'short_description',
    level: 0,
    locale: LocaleEnum.en_US,
  });

  desc.addChunk({
    block_name: 'short_description',
    chunk: 'Lorem ipsum',
    locale: LocaleEnum.en_US,
  });

  return desc;
}

function addFrenchDescription(desc: DescriptionModel) {
  desc.addStartChunk({
    is_content_display_title: true,
    display_title: 'Short Description',
    name: 'short_description',
    level: 0,
    locale: LocaleEnum.fr_FR,
  });

  desc.addChunk({
    block_name: 'short_description',
    chunk: 'FR: Lorem Ipsum',
    locale: LocaleEnum.fr_FR,
  });

  return desc;
}

function addFrenchTitle(desc: DescriptionModel) {
  desc.addStartChunk({
    is_content_display_title: true,
    display_title: 'title',
    name: 'title',
    level: 0,
    locale: LocaleEnum.fr_FR,
  });

  desc.addChunk({
    block_name: 'title',
    chunk: 'Bonjour World',
    locale: LocaleEnum.fr_FR,
  });
}

beforeEach(() => {
  mockCallback.mockReset();
});

describe('Article Description', () => {
  it('has default languages', () => {
    const desc = prepareArticle();

    expect(desc.languages).toContain(LocaleEnum.en_US);
    expect(desc.languages).toContain(LocaleEnum.fr_FR);
    expect(desc.languages).toContain(LocaleEnum.en_UK);
  });

  it('has EN_US as initial language', () => {
    const desc = prepareArticle();

    expect(desc.currentLocale.value).toBe(LocaleEnum.en_US);
  });

  it('can change language', () => {
    const desc = prepareArticle();
    addEnUsTitle(desc);

    desc.changeLocale(LocaleEnum.en_UK);

    expect(desc.currentLocale.value).toBe(LocaleEnum.en_UK);
  });

  it('initiates locale content on start chunk', () => {
    const desc = prepareArticle();

    expect(desc.localeContents.value).toHaveLength(0);

    desc.addStartChunk({
      is_content_display_title: true,
      display_title: 'title',
      name: 'title',
      level: 0,
      locale: LocaleEnum.en_US,
    });

    expect(desc.localeContents.value).toHaveLength(1);
  });

  it('has default locale set to en_US', () => {
    const desc = prepareArticle();
    addEnUsTitle(desc);

    desc.changeLocale(LocaleEnum.fr_FR);

    expect(desc.defaultLocale).toBe(LocaleEnum.en_US);
  });

  it('is initially not loading', () => {
    const desc = prepareArticle();

    expect(desc.isLoading.value).toBe(false);
  });

  it('starts loading whenever a block start is received', () => {
    const desc = prepareArticle();

    desc.addStartChunk({
      is_content_display_title: true,
      display_title: 'title',
      name: 'title',
      level: 0,
      locale: LocaleEnum.en_US,
    });

    expect(desc.isLoading.value).toBe(true);
  });

  it('is no longer loading after the end of content is signaled', () => {
    const desc = prepareArticle();

    desc.addStartChunk({
      is_content_display_title: true,
      display_title: 'title',
      name: 'title',
      level: 0,
      locale: LocaleEnum.en_US,
    });

    desc.onContentFinished();

    expect(desc.isLoading.value).toBe(false);
  });

  it('resets content of previous block when receiving another block start', () => {
    const desc = prepareArticle();
    addEnUsTitle(desc);

    desc.addStartChunk({
      is_content_display_title: true,
      display_title: 'title',
      name: 'title',
      level: 0,
      locale: LocaleEnum.en_US,
    });

    expect(desc.getBlock(LocaleEnum.en_US, 'title').value?.content.value).toBe(
      '',
    );
  });

  it('resets all translations if a default locale block has been regenerated', () => {
    const desc = prepareArticle();
    addEnUsTitle(desc);
    addFrenchTitle(desc);
    desc.changeLocale(LocaleEnum.fr_FR);

    desc.addStartChunk({
      is_content_display_title: true,
      display_title: 'title',
      name: 'title',
      level: 0,
      locale: LocaleEnum.en_US,
    });

    expect(desc.getLocaleContent(LocaleEnum.fr_FR).value).toBe(undefined);
    expect(desc.currentLocale.value).toBe(desc.defaultLocale);
  });

  it('does not accept block chunks before the block is started', () => {
    const desc = prepareArticle();

    expect(() => {
      desc.addChunk({
        block_name: 'title',
        chunk: 'Hello World',
        locale: LocaleEnum.en_US,
      });
    }).toThrow(BlockNotFoundError);
  });

  it('has blocks grouped by locale', () => {
    const desc = prepareArticle();
    addEnUsTitle(desc);
    addFrenchTitle(desc);

    expect(desc.localeContents.value[0].blocks.value[0].content.value).toBe(
      'Hello World',
    );
    expect(desc.localeContents.value[1].blocks.value[0].content.value).toBe(
      'Bonjour World',
    );
  });

  it('has multiple blocks per locale', () => {
    const desc = prepareArticle();
    addEnUsTitle(desc);
    addEnUsDescription(desc);

    expect(desc.localeContents.value[0].blocks.value[0].content.value).toBe(
      'Hello World',
    );
    expect(desc.localeContents.value[0].blocks.value[1].content.value).toBe(
      'Lorem ipsum',
    );
  });

  describe('Translation', () => {
    it('cannot start a translation if no blocks', () => {
      const desc = prepareArticle();

      expect(() => {
        desc.changeLocale(LocaleEnum.fr_FR);
      }).toThrow(TranslationError);
    });

    it('will not re-translate a language if it has already been translated', () => {
      const desc = prepareArticle();
      addEnUsTitle(desc);

      desc.changeLocale(LocaleEnum.fr_FR);
      desc.changeLocale(LocaleEnum.en_US);
      expect(mockCallback).toBeCalledWith('run1', LocaleEnum.fr_FR);
      expect(mockCallback).toHaveBeenCalledTimes(1);
    });

    it('starting a locale translation resets all blocks for that locale', () => {
      const desc = prepareArticle();
      addFrenchTitle(desc);
      addEnUsTitle(desc);

      // @ts-ignore
      desc.translate(LocaleEnum.fr_FR);

      expect(
        desc.getLocaleContent(LocaleEnum.fr_FR).value?.blocks.value[0].content
          .value,
      ).toBe('');
    });

    it('starting a translation will call the external service', () => {
      const desc = prepareArticle();
      addEnUsTitle(desc);

      desc.changeLocale(LocaleEnum.fr_FR);

      expect(mockCallback).toBeCalledWith('run1', LocaleEnum.fr_FR);
    });

    it('can re-translate a single block', () => {
      const desc = prepareArticle();
      addEnUsTitle(desc);
      addEnUsDescription(desc);

      desc.changeLocale(LocaleEnum.fr_FR, 'title');

      expect(mockCallback).toBeCalledWith('run1', LocaleEnum.fr_FR, 'title');
    });

    it('re-translating a single block will only reset it', () => {
      const desc = prepareArticle();
      addEnUsTitle(desc);
      addEnUsDescription(desc);
      addFrenchTitle(desc);
      addFrenchDescription(desc);

      // @ts-ignore
      desc.translate(LocaleEnum.fr_FR, 'short_description');

      expect(
        desc.getLocaleContent(LocaleEnum.fr_FR).value?.blocks.value[0].content
          .value,
      ).toBe('Bonjour World');
      expect(
        desc.getLocaleContent(LocaleEnum.fr_FR).value?.blocks.value[1].content
          .value,
      ).toBe('');
    });
  });

  it('can receive an entire generated block', () => {
    const block = new Block(
      'title',
      1,
      'Title',
      false,
      '# Hello this is a description',
    );

    const descriptionModel = prepareArticle();
    descriptionModel.addBlock(block);

    expect(
      descriptionModel.getCurrentLocaleContent().value?.blocks.value[0].content
        .value,
    ).toBe('# Hello this is a description');
  });

  it('can receive an entire generated block for another locale', () => {
    const blockUs = new Block(
      'title',
      1,
      'Title',
      false,
      '# Hello this is a description',
    );

    const blockFr = new Block(
      'title',
      1,
      'Title',
      false,
      '# Bonjour ceci est une traduction',
    );

    const descriptionModel = prepareArticle();
    descriptionModel.addBlock(blockUs);
    descriptionModel.addBlock(blockFr, LocaleEnum.fr_FR);

    expect(
      descriptionModel.getLocaleContent(LocaleEnum.fr_FR).value?.blocks.value[0]
        .content.value,
    ).toBe('# Bonjour ceci est une traduction');
  });
});
