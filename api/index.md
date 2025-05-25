# transmute (exported Transmute)

The transmute function; star of the library. See [Transmute](/api/index.md#transmute-exported-interface).

```ts
const transmute: Transmute;
```

# Transmute (exported interface)

The interface of the `transmute` function, which has 4 different call signatures.

```ts
interface Transmute {
  (
    code: string,
    transform: (ast: AST) => Promise<void>,
  ): Promise<TransmuteResult>;
  (
    code: string,
    options: TransmuteOptions,
    transform: (ast: types.Node) => Promise<void>,
  ): Promise<TransmuteResult>;
  (code: string, transform: (ast: AST) => void): TransmuteResult;
  (
    code: string,
    options: TransmuteOptions,
    transform: (ast: types.Node) => void,
  ): TransmuteResult;
}
```

## Transmute(...) (call signature)

Parses `code` into an AST, then passes that to `transform`, which is
expected to mutate the AST somehow.

Once the Promise returned by `transform` has resolved, it converts the AST
back into a string, and returns you a [TransmuteResult](/api/ee-types.md#transmuteresult-exported-type), which has
the transformed string on it as its `code` property.

```ts
(code: string, transform: (ast: AST) => Promise<void>): Promise<TransmuteResult>;
```

## Transmute(...) (call signature)

Parses `code` into an AST, then passes that to `transform`, which is
expected to mutate the AST somehow.

Once the Promise returned by `transform` has resolved, it converts the AST
back into a string, and returns you a [TransmuteResult](/api/ee-types.md#transmuteresult-exported-type), which has
the transformed string on it as its `code` property.

The contents of `options` will determine what syntax options to use to
parse the code, and whether to consume/generate source maps. See
[TransmuteOptions](/api/ee-types.md#transmuteoptions-exported-type) for more details.

```ts
(code: string, options: TransmuteOptions, transform: (ast: types.Node) => Promise<void>): Promise<TransmuteResult>;
```

## Transmute(...) (call signature)

Parses `code` into an AST, then passes that to `transform`, which
is expected to mutate the AST somehow.

Then, it converts the AST back into a string, and returns you a
[TransmuteResult](/api/ee-types.md#transmuteresult-exported-type), which has the transformed string on it as its
`code` property.

```ts
(code: string, transform: (ast: AST) => void): TransmuteResult;
```

## Transmute(...) (call signature)

Parses `code` into an AST, then passes that to `transform`, which is
expected to mutate the AST somehow.

Then, it converts the AST back into a string, and returns you a
[TransmuteResult](/api/ee-types.md#transmuteresult-exported-type), which has the transformed string on it as its
`code` property.

The contents of `options` will determine what syntax options to use to
parse the code, and whether to consume/generate source maps. See
[TransmuteOptions](/api/ee-types.md#transmuteoptions-exported-type) for more details.

```ts
(code: string, options: TransmuteOptions, transform: (ast: types.Node) => void): TransmuteResult;
```

# astToCode (exported function)

Converts an AST back into a code string.

This function is used internally by [transmute](/api/index.md#transmute-exported-function).

The options parameter works the same as the options parameter for `transmute`.

```ts
declare function astToCode(
  ast: types.Node,
  options?: TransmuteOptions,
): TransmuteResult;
```

# CodeToAst (interface)

The various call signatures of the [codeToAst](/api/index.md#codetoast-exported-codetoast) function. When option
`expression` is true, it returns a `types.Node`, but when it isn't, it
returns an `AST`, which is an alias for `types.File`.

```ts
interface CodeToAst {
  (code: string): AST;
  (
    code: string,
    options: TransmuteOptions & {
      expression: true;
    },
  ): types.Node;
  (
    code: string,
    options: TransmuteOptions & {
      expression: false;
    },
  ): AST;
  (
    code: string,
    options: TransmuteOptions & {
      expression: boolean;
    },
  ): types.Node;
  (code: string, options: TransmuteOptions): AST;
}
```

## CodeToAst(...) (call signature)

```ts
(code: string): AST;
```

## CodeToAst(...) (call signature)

```ts
(code: string, options: TransmuteOptions & {
  expression: true;
}): types.Node;
```

## CodeToAst(...) (call signature)

```ts
(code: string, options: TransmuteOptions & {
  expression: false;
}): AST;
```

## CodeToAst(...) (call signature)

```ts
(code: string, options: TransmuteOptions & {
  expression: boolean;
}): types.Node;
```

## CodeToAst(...) (call signature)

```ts
(code: string, options: TransmuteOptions): AST;
```

# codeToAst (exported CodeToAst)

Parses a JavaScript/TypeScript code string into an AST.

This function is used internally by [transmute](/api/index.md#transmute-exported-function).

The options parameter works the same as the options parameter for `transmute`.

```ts
const codeToAst: CodeToAst;
```

# clone (exported function)

Utility function which deeply-clones the provided object or value. Primitive
values are returned as-is (ie not cloned).

This can be useful when you need to clone an AST node.

```ts
declare function clone<T extends Clonable>(input: T): T;
```

# Clonable (type)

```ts
type Clonable =
  | {}
  | number
  | string
  | null
  | undefined
  | boolean
  | Array<Clonable>;
```

# hasShape (exported function)

Utility function which checks whether `input` is a structural subset of
`shape`.

This can be useful when you need to check if an AST node has a set of
properties.

```ts
declare function hasShape<Input, Shape>(
  input: Input,
  shape: Shape,
): input is Input & Shape;
```

# traverse (exported binding)

Re-export of `@babel/traverse`'s default export.

```ts
export { traverse };
```

# types (exported binding)

Contains the named exports of both `@babel/types` and `@babel/traverse`.

```ts
export { types };
```

# template (exported binding)

Re-export of `@babel/template`'s default export.

```ts
export { template };
```

# AST (exported type)

Type returned by [codeToAst](/api/index.md#codetoast-exported-codetoast). See [AST](/api/ee-types.md#ast-exported-type).

```ts
export { type AST };
```

# TransmuteOptions (exported type)

Type used by [transmute](/api/index.md#transmute-exported-function). See [TransmuteOptions](/api/ee-types.md#transmuteoptions-exported-type).

```ts
export { type TransmuteOptions };
```

# ParseOptions (exported type)

Type used by [parse](/api/index.md#parse-exported-function) and [TransmuteOptions](/api/ee-types.md#transmuteoptions-exported-type). See [ParseOptions](/api/ee-types.md#parseoptions-exported-type).

```ts
export { type ParseOptions };
```

# PrintOptions (exported type)

Type used by [print](/api/index.md#print-exported-function) and [TransmuteOptions](/api/ee-types.md#transmuteoptions-exported-type). See [PrintOptions](/api/ee-types.md#printoptions-exported-type).

```ts
export { type PrintOptions };
```

# TransmuteResult (exported type)

Type returned by [transmute](/api/index.md#transmute-exported-function). See [TransmuteResult](/api/ee-types.md#transmuteresult-exported-type).

```ts
export { type TransmuteResult };
```

# parse (exported function)

A version of the function [codeToAst](/api/index.md#codetoast-exported-codetoast) exported as the named export
'parse', suitable for use with AST tooling that lets you specify a parser
module.

Unlike `codeToAst`, \*\* `parse` receives [ParseOptions](/api/ee-types.md#parseoptions-exported-type) (aka the
"parseOptions" property of [TransmuteOptions](/api/ee-types.md#transmuteoptions-exported-type)), instead of the whole
`TransmuteOptions`.

> Important: **`parse` doesn't wrap the resulting AST using recast**, so code
> style and formatting changes are not tracked. For this reason, you should
> probably use `codeToAst` (or `transmute`) instead or `parse`.

If you aren't sure whether to use `parse` or `codeToAst`, use `codeToAst`.

```ts
const parse: (source: string, options?: ParseOptions) => any;
```

# print (exported value)

The version of the function [astToCode](/api/index.md#asttocode-exported-function) exported as the named export
'print', suitable for use with AST tooling that lets you specify a printer
module.

Unlike `astToCode`, `print` receives [PrintOptions](/api/ee-types.md#printoptions-exported-type) (aka the
"printOptions" property of [TransmuteOptions](/api/ee-types.md#transmuteoptions-exported-type)), instead of the whole
`TransmuteOptions`.

If you aren't sure whether to use `print` or `astToCode`, use `astToCode`.

```ts
const print: typeof printer.print;
```
