# clone (exported function)

Utility function which deeply-clones the provided object or value. Primitive
values are returned as-is (ie not cloned).

This can be useful when you need to clone an AST node.

```ts
declare function clone<T extends Clonable>(input: T): T;
```

# Clonable (type)

This type is used in the definition of `clone`, but is not exported.

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
