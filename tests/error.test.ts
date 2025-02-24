import { describe, expect, it, vi } from 'vitest';

import { createHelixClient } from '../src';
import { HTTPError } from '../src/http-error';

describe('helix.method() errors', () => {
    it('should error with HTTPError', async () => {
        const spy = vi.fn<typeof fetch>();
        spy.mockResolvedValue(
            new Response('{"error":"Unauthorized","status":401}', {
                status: 401,
                statusText: 'Unauthorized',
            }),
        );
        const helix = createHelixClient({ fetch: spy });

        try {
            await helix.users.get({ query: { id: ['123'] } });
            expect(true).toBe(false);
        } catch (error) {
            expect(error).toBeInstanceOf(HTTPError);
            expect((error as HTTPError).response.status).toBe(401);
            expect((error as HTTPError).request.url).toBe(
                'https://api.twitch.tv/helix/users?id=123',
            );
        }
    });

    it('should not error without throwHttpErrors option', async () => {
        const spy = vi.fn<typeof fetch>();
        spy.mockResolvedValue(
            new Response('{"error":"Unauthorized","status":401}', {
                status: 401,
                statusText: 'Unauthorized',
            }),
        );
        const helix = createHelixClient({ fetch: spy, throwHttpErrors: false });

        const response = await helix.users.get({ query: { id: ['123'] } });
        expect(response.status).toEqual(401);
    });
});
