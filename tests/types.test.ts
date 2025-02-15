import { describe, expect, expectTypeOf, it } from 'vitest';

import type { Helix } from '../src/types';
import { createHelixClient } from '../src';

describe('helix.()', () => {
    it('should create a Helix client', () => {
        expectTypeOf(createHelixClient()).toMatchTypeOf<Helix<true, true>>();
    });
});
