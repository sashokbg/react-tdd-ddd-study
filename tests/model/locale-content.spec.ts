import { describe, expect, it } from '@jest/globals';
import { LocaleContent } from '@/model/locale-content';
import { LocaleEnum } from '@/model/locale.enum';
import { LocaleMismatchError } from '@/model/errors/locale-mismatch.error';
import { BlockNotFoundError } from '@/model/errors/block-not-found.error';

function prepareLocaleContent() {
  const content = new LocaleContent(LocaleEnum.en_US);

  content.addStartChunk({
    is_content_display_title: true,
    display_title: 'title',
    name: 'title',
    level: 0,
    locale: LocaleEnum.en_US,
  });

  content.addChunk({
    block_name: 'title',
    chunk: 'Content',
    locale: LocaleEnum.en_US,
  });

  content.addStartChunk({
    is_content_display_title: true,
    display_title: 'short_description',
    name: 'short_description',
    level: 0,
    locale: LocaleEnum.en_US,
  });

  content.addChunk({
    block_name: 'short_description',
    chunk: 'Some more',
    locale: LocaleEnum.en_US,
  });
  return content;
}

describe('Locale content', () => {
  it('only accepts chunks for the same locale', () => {
    const localeContent = new LocaleContent(LocaleEnum.en_US);

    expect(() => {
      localeContent.addStartChunk({
        is_content_display_title: true,
        display_title: 'title',
        name: 'title',
        level: 0,
        locale: LocaleEnum.en_UK,
      });
    }).toThrow(LocaleMismatchError);
  });

  it('has no blocks initially', () => {
    const content = new LocaleContent(LocaleEnum.en_US);

    expect(content.blocks.value).toHaveLength(0);
  });

  it('creates a new block when start chunk received', async () => {
    const content = new LocaleContent(LocaleEnum.en_US);
    content.addStartChunk({
      is_content_display_title: true,
      display_title: 'title',
      name: 'title',
      level: 0,
      locale: LocaleEnum.en_US,
    });

    expect(content.blocks.value[0].name).toBe('title');
  });

  it('does not accept chunks for block that has not been started', () => {
    const content = new LocaleContent(LocaleEnum.en_US);

    expect(() => {
      content.addChunk({
        block_name: 'title',
        chunk: 'Content',
        locale: LocaleEnum.fr_FR,
      });
    }).toThrow(BlockNotFoundError);
  });

  it('groups chunks in an existing block', () => {
    const content = new LocaleContent(LocaleEnum.en_US);

    content.addStartChunk({
      is_content_display_title: true,
      display_title: 'title',
      name: 'title',
      level: 0,
      locale: LocaleEnum.en_US,
    });

    content.addChunk({
      block_name: 'title',
      chunk: 'Content',
      locale: LocaleEnum.en_US,
    });
    content.addChunk({
      block_name: 'title',
      chunk: ' is generated!',
      locale: LocaleEnum.en_US,
    });

    expect(content.blocks.value[0].content.value).toBe('Content is generated!');
  });

  it('can reset all blocks', () => {
    const content = prepareLocaleContent();

    content.resetAll();

    expect(content.blocks.value[0].content.value).toBe('');
    expect(content.blocks.value[1].content.value).toBe('');
  });

  it('can reset an individual block', () => {
    const content = prepareLocaleContent();

    content.reset('short_description');

    expect(content.blocks.value[0].content.value).toBe('Content');
    expect(content.blocks.value[1].content.value).toBe('');
  });

  it('concatenates the result of its block', () => {
    const content = prepareLocaleContent();

    let contentAsString = content.getContent();

    expect(contentAsString).toBe('Content\nSome more\n');
  });
});
