import { describe, expect, it } from '@jest/globals';
import { Block } from '@/model/block';

describe('block', () => {
  it('has empty content by default', () => {
    const block = new Block('title', 1, 'Title', false);
    expect(block.content.value).toBe('');
  });

  it('can be reset with a fresh new instance', () => {
    const block = new Block('title', 1, 'Title', false);
    block['_content'].value = 'CONTENT !';

    let newInstance = block.freshNewInstance();

    expect(newInstance.content.value).toBe('');
    expect(newInstance).not.toBe(block);
  });
});
