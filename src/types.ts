import type {
    CamelCase,
    RequiredKeysOf,
    Simplify,
    SimplifyDeep,
    UnionToIntersection,
} from 'type-fest';

import type { operations, paths } from './helix.generated';
import type {
    ContentlessStatusCode,
    ErrorStatusCode,
    StatusCode,
    SuccessStatusCode,
} from './status';

type CreateCallers<TPath extends keyof paths, TThrowHttpErrors extends boolean> = {
    [K in Exclude<
        keyof paths[TPath],
        'parameters'
    > as paths[TPath][K] extends operations[keyof operations]
        ? K
        : never]: paths[TPath][K] extends operations[keyof operations]
        ? CreateFunctionSignatureForOperation<paths[TPath][K], TThrowHttpErrors>
        : never;
} & { url: () => URL };

type PathToChain<
    TPath extends string,
    TCamelCasePath extends boolean,
    TThrowHttpErrors extends boolean,
    TOriginalPath extends string = TPath,
> = TPath extends `/${infer Path}`
    ? PathToChain<Path, TCamelCasePath, TThrowHttpErrors, TOriginalPath>
    : TPath extends `${infer Path}/${infer Rest}`
      ? {
            [K in Path as TCamelCasePath extends true ? CamelCase<K> : K]: PathToChain<
                Rest,
                TCamelCasePath,
                TThrowHttpErrors,
                TOriginalPath
            >;
        }
      : Simplify<
            Record<
                TCamelCasePath extends true ? CamelCase<TPath> : TPath,
                TOriginalPath extends keyof paths
                    ? CreateCallers<TOriginalPath, TThrowHttpErrors>
                    : never
            >
        >;

type OperationToBody<TOperation extends operations[keyof operations]> = TOperation extends {
    requestBody?: { content?: { 'application/json': infer Body } };
}
    ? unknown extends Body
        ? {}
        : { body: Body }
    : {};

type OperationToQuery<TOperation extends operations[keyof operations]> = TOperation extends {
    parameters: { query: infer Query };
}
    ? { query: Query }
    : TOperation extends { parameters: { query?: infer Query } }
      ? { query?: Query }
      : {};

type KeyToNumber<TKey extends string | number | symbol> = TKey extends `${infer N extends number}`
    ? N
    : TKey extends number
      ? TKey
      : never;

export interface TypedResponse<TStatusCode extends number, TBodyShape = null>
    extends globalThis.Response {
    ok: TStatusCode extends SuccessStatusCode
        ? true
        : TStatusCode extends Exclude<StatusCode, SuccessStatusCode>
          ? false
          : boolean;
    status: TStatusCode;
    clone: () => this;
    json: () => TStatusCode extends ContentlessStatusCode ? Promise<never> : Promise<TBodyShape>;
}

type Indexed<T> = T extends Record<infer K, unknown> ? T[K] : never;

type CreateResponses<
    TResponses extends operations[keyof operations]['responses'],
    TThrowHttpErrors extends boolean,
> = Indexed<{
    [K in keyof TResponses as TThrowHttpErrors extends true
        ? K extends ErrorStatusCode
            ? never
            : K
        : K]: TResponses[K] extends {
        content: { 'application/json': infer BodyShape };
    }
        ? TypedResponse<KeyToNumber<K>, SimplifyDeep<BodyShape>> // simplifying deep might be a bad idea
        : TypedResponse<KeyToNumber<K>>;
}>;

// idk what to name these anymore
type ToFlexibleArgs<T extends object> = RequiredKeysOf<T> extends never ? [T] | [] : [T];

type CreateFunctionSignatureForOperation<
    TOperation extends operations[keyof operations],
    TThrowHttpErrors extends boolean,
> = (
    ...args: ToFlexibleArgs<
        OperationToBody<TOperation> &
            OperationToQuery<TOperation> &
            Omit<RequestInit, 'body' | 'method'>
    >
) => Promise<CreateResponses<TOperation['responses'], TThrowHttpErrors>>;

export type Helix<TCamelCasePath extends boolean, TThrowHttpErrors extends boolean> = Simplify<
    UnionToIntersection<
        Indexed<{ [K in keyof paths]: PathToChain<K, TCamelCasePath, TThrowHttpErrors> }>
    >
>;
