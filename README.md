# @mastondzn/helix [![npm](https://img.shields.io/npm/v/@mastondzn/helix)](https://www.npmjs.com/package/@mastondzn/helix) [![pkg-size](https://pkg-size.dev/badge/bundle/1689)](https://pkg-size.dev/@mastondzn/helix)

Tiny Twitch Helix API wrapper based on fetch.

## Installation

```sh
pnpm install @mastondzn/helix
```

## Usage

```ts
import { createHelixClient } from '@mastondzn/helix';

const helix = createHelixClient({
    // you should at least provide your credentials:
    headers: {
        'Client-ID': 'your-client-id',
        Authorization: 'Bearer your-token',
    },

    // these are optional, and the specified values are the defaults:
    // whether to throw non-200 status codes as HTTPError
    throwHttpErrors: true,
    // whether or not you can access paths in camelCase. (customRewards instead of custom_rewards)
    camelCasePath: true,
    // specify any other fetch-compatible function
    fetch: globalThis.fetch,
    // specify another baseUrl
    baseUrl: 'https://api.twitch.tv/helix',
});

const response = await helix.users.get({
    query: { login: ['mastondzn'] },
    // ... other fetch options are also available here
    signal: new AbortController().signal,
});
const body = await response.json();
// body.data is typed correctly for the used endpoint

const response = await helix.channelPoints.customRewards
    .post({
        // enforced query parameters and body shapes
        body: {
            cost: 10_000,
            title: 'foo',
            max_per_stream: 1,
        },
        query: { broadcaster_id: '44601243' },
    })
    .catch((error) => {
        // by default, non-200 status codes throw an HTTPError
        if (error instanceof HTTPError) {
            // error.request is the used request
            // error.response is the response object
        }
    });
```

Most endpoints should be available, like they appear on the [Twitch API Reference](https://dev.twitch.tv/docs/api/reference).
For example, if you need to use the [Get Global Chat Badges endpoint](https://dev.twitch.tv/docs/api/reference/#get-global-chat-badges), you can access it via `helix.chat.badges.global.get()`.
The url gets built as you access keys on the [JavaScript Proxy](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy).
This allows for the package's js bundle to be pretty low, while still providing strong type hints.

## Acknowledgements

- [twitch-api-swagger](https://github.com/DmitryScaletta/twitch-api-swagger), for providing the openapi spec for Twitch.
- [hono's rpc client](https://hono.dev/docs/guides/rpc#client), for the inspiration.
