interface CallbackOptions {
    path: string[];
    args:
        | [
              {
                  query?: Record<string, string | string[]>;
                  body?: Record<string | number | symbol, unknown>;
              } & Omit<RequestInit, 'body'>,
              ...unknown[],
          ]
        | [];
}

export function createRecursiveProxy(
    callback: (opts: CallbackOptions) => unknown,
    path: string[] = [],
): {} {
    // eslint-disable-next-line ts/no-empty-function
    return new Proxy(() => {}, {
        get(_obj, key) {
            if (typeof key !== 'string' || key === 'then') return;
            return createRecursiveProxy(callback, [...path, key]);
        },
        apply(_1, _2, args: CallbackOptions['args']) {
            return callback({ path, args });
        },
    });
}
