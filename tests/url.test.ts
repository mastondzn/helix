import { describe, expect, it } from 'vitest';

import { createHelixClient } from '../src';

describe('helix.url()', () => {
    it('should create camelCase urls as expected', () => {
        const helix = createHelixClient();
        expect(helix.users.url().toString()).toBe('https://api.twitch.tv/helix/users');

        expect(helix.contentClassificationLabels.url().toString()).toBe(
            'https://api.twitch.tv/helix/content_classification_labels',
        );
    });

    it('should create snake_case urls as expected', () => {
        const helix = createHelixClient({ camelCasePath: false });
        expect(helix.users.url().toString()).toBe('https://api.twitch.tv/helix/users');

        expect(helix.content_classification_labels.url().toString()).toBe(
            'https://api.twitch.tv/helix/content_classification_labels',
        );
    });

    it('should create deeper urls as expected', () => {
        const helix = createHelixClient();
        expect(helix.users.extensions.url().toString()).toBe(
            'https://api.twitch.tv/helix/users/extensions',
        );
    });

    it('should work with baseUrls', () => {
        const helix = createHelixClient({ baseUrl: 'https://example.com' });
        expect(helix.users.url().toString()).toBe('https://example.com/users');
    });
});
