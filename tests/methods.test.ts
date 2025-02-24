import { describe, expect, it, vi } from 'vitest';

import { createHelixClient } from '../src';

describe('helix.method()', () => {
    it('should call fetch with a Request containing the correct method', async () => {
        const spy = vi.fn<typeof fetch>();
        spy.mockResolvedValue(new Response('{}'));

        const helix = createHelixClient({ fetch: spy });
        await helix.users.get({
            query: { id: ['123'] },
        });

        expect(spy).toHaveBeenCalledWith(
            expect.objectContaining({
                method: 'GET',
                url: 'https://api.twitch.tv/helix/users?id=123',
            }),
        );
        expect(spy).toHaveBeenCalledTimes(1);
    });
});
