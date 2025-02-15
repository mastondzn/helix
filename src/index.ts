import type { Helix } from './types';
import { HTTPError } from './http-error';
import { createRecursiveProxy } from './proxy';

/**
 * Options for the Helix client.
 */
export interface ClientOptions<
    TCamelCasePath extends boolean = true,
    TThrowHttpErrors extends boolean = true,
> {
    /**
     * The base URL for requests.
     * @default "https://api.twitch.tv/helix"
     */
    baseUrl?: string;
    /**
     * Whether or not you can access paths in camelCase. (e.g. `helix.somePath` vs `helix.some_path`)
     * @default true
     */
    camelCasePath?: TCamelCasePath;
    /**
     * Whether or not to throw an HTTPError when the HTTP status code is not in the 2xx range.
     * @default true
     */
    throwHttpErrors?: TThrowHttpErrors;
    /**
     * You can choose another fetch implementation to use.
     * @default globalThis.fetch
     */
    fetch?: typeof globalThis.fetch;
    /**
     * The default headers to use for all requests.
     * You should specify 'client-id' and 'authorization' here!
     * If you use a Headers instance, you should be able to use that same reference to refresh tokens!
     * Has 'content-type': 'application/json' unless it is specified.
     */
    headers?: Headers | Record<string, string | string[]>;
}

export function createHelixClient<
    TCamelCasePath extends boolean = true,
    TThrowHttpErrors extends boolean = true,
>(options: ClientOptions<TCamelCasePath, TThrowHttpErrors> = {}) {
    // eslint-disable-next-line ts/promise-function-async
    return createRecursiveProxy(function callback({ path, args: [init] }) {
        // allow calling .toString() and .valueOf() on the proxy
        if (path.at(-1) === 'toString') {
            if (path.at(-2) === 'name') {
                // e.g. helix.somePath.name.toString() -> "somePath"
                return path.at(-3) ?? '';
            }
            // e.g. helix.somePath.toString()
            return callback.toString();
        }

        if (path.at(-1) === 'valueOf') {
            if (path.at(-2) === 'name') {
                // e.g. hc().somePath.name.valueOf() -> "somePath"
                return path.at(-3) ?? '';
            }
            // e.g. hc().somePath.valueOf()
            return callback;
        }

        if (init?.method) {
            throw new Error('You should not specify the method in the init object!');
        }

        const method = path.pop();
        if (options.camelCasePath ?? true) {
            path = path.map((element) =>
                element.replaceAll(/([a-z])([A-Z])/g, '$1_$2').toLowerCase(),
            );
        }

        const baseUrl = options.baseUrl?.replace(/\/$/, '') ?? 'https://api.twitch.tv/helix';

        const url = new URL(`${baseUrl}/${path.join('/')}`);
        if (method === 'url') {
            return url;
        }

        const headers = new Headers(options.headers);
        if (init?.headers) {
            const iterable =
                init.headers instanceof Headers ? init.headers : Object.entries(init.headers);
            for (const [key, value] of iterable) {
                if (Array.isArray(value)) {
                    for (const [i, v] of (value as string[]).entries()) {
                        i === 0 ? headers.set(key, v) : headers.append(key, v);
                    }
                } else {
                    headers.set(key, value as string);
                }
            }
        }

        if (!headers.has('content-type')) {
            headers.set('content-type', 'application/json');
        }

        const query = new URLSearchParams();
        for (const [key, value] of Object.entries(init?.query ?? {})) {
            if (Array.isArray(value)) {
                for (const v of value) {
                    query.append(key, v);
                }
            } else {
                query.set(key, value);
            }
        }

        const body = init?.body ? JSON.stringify(init.body) : undefined;
        const fetch = options.fetch ?? globalThis.fetch;

        const request = new Request(
            query.size > 0 ? `${url.toString()}?${query.toString()}` : url.toString(),
            { ...init, method, headers, body },
        );

        return fetch(request).then((response) => {
            if ((options.throwHttpErrors ?? true) && !response.ok) {
                throw new HTTPError(response, request);
            }
            return response;
        });
    }) as Helix<TCamelCasePath, TThrowHttpErrors>;
}
