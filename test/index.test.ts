import { expect, test } from 'vitest';
import { cli } from '../src';

test('clittle', () => {
    expect(cli()).not.toBe(void 0);
});

// TODO: add tests