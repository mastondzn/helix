import { describe, expect, it, vi } from 'vitest';

import { createHelixClient } from '../src';

describe('helix.method()', () => {
    it('should call fetch with a Request containing the correct method', () => {
        // eslint-disable-next-line ts/no-empty-function
        const fetch = vi.fn(async () => new Promise(() => {}));

        const helix = createHelixClient({
            fetch: fetch as typeof globalThis.fetch,
        });

        void helix.users.get({
            query: { id: ['123'] },
        });

        expect(fetch).toHaveBeenCalledWith(
            expect.objectContaining({
                method: 'GET',
                url: 'https://api.twitch.tv/helix/users?id=123',
            }),
        );
        expect(fetch).toHaveBeenCalledTimes(1);
    });
});
