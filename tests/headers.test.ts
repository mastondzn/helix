import { describe, expect, expectTypeOf, it, vi } from 'vitest';

import { createHelixClient } from '../src';

expect.extend({
    toMatchHeaders(headers: Headers, expected: Record<string, string | string[]>) {
        for (const [key, value] of Object.entries(expected)) {
            expect(headers.get(key)).toBe(value);
        }
        return { pass: true, message: () => '' };
    },
});

const expectToMatchHeaders = (
    expect as unknown as { toMatchHeaders: (headers: Record<string, string | string[]>) => unknown }
).toMatchHeaders;

describe('createHelixClient({ headers: ... })', () => {
    it('should use the specified headers as expected', async () => {
        const spy = vi.fn<typeof fetch>();
        spy.mockResolvedValue(new Response('{}'));

        const helix = createHelixClient({
            fetch: spy,
            headers: {
                'client-id': 'my-client-id',
                authorization: 'Bearer my-access-token',
            },
        });
        await helix.users.get({ query: { id: ['123'] } });

        expect(spy).toHaveBeenCalledWith(
            expect.objectContaining({
                headers: expectToMatchHeaders({
                    'client-id': 'my-client-id',
                    authorization: 'Bearer my-access-token',
                    'content-type': 'application/json',
                }),
            }),
        );
    });

    it('should use the specified headers as expected with a Headers instance', async () => {
        const spy = vi.fn<typeof fetch>();
        spy.mockResolvedValue(new Response('{}'));

        const headers = new Headers({
            'client-id': 'my-client-id',
            authorization: 'Bearer my-access-token',
        });

        const helix = createHelixClient({
            fetch: spy,
            headers,
        });
        await helix.users.get({ query: { id: ['123'] } });

        expect(spy).toHaveBeenCalledWith(
            expect.objectContaining({
                headers: expectToMatchHeaders({
                    'client-id': 'my-client-id',
                    authorization: 'Bearer my-access-token',
                    'content-type': 'application/json',
                }),
            }),
        );
    });
});
