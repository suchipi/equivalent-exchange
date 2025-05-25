/**
 * Utility function which deeply-clones the provided object or value. Primitive
 * values are returned as-is (ie not cloned).
 *
 * This can be useful when you need to clone an AST node.
 */
export function clone<T extends Clonable>(input: T): T {
  if (Array.isArray(input)) {
    const copy = new Array(input.length);
    for (let i = 0; i < input.length; i++) {
      copy[i] = clone(input[i]);
    }
    // @ts-ignore could be instantiated with different subtype
    return copy;
  }

  if (typeof input !== "object" || input == null) {
    return input;
  }

  const copy = Object.create(Object.getPrototypeOf(input));
  for (const key of Object.keys(input)) {
    copy[key] = clone(input[key]);
  }

  // @ts-ignore could be instantiated with different subtype
  return copy;
}

/** This type is used in the definition of `clone`, but is not exported. */
type Clonable =
  | {}
  | number
  | string
  | null
  | undefined
  | boolean
  | Array<Clonable>;

/**
 * Utility function which checks whether `input` is a structural subset of
 * `shape`.
 *
 * This can be useful when you need to check if an AST node has a set of
 * properties.
 */
export function hasShape<Input, Shape>(
  input: Input,
  shape: Shape,
): input is Input & Shape {
  if (typeof input !== "object" || input == null) {
    // @ts-ignore no overlap
    return input === shape;
  }

  // Used for both Array and Object
  return Object.keys(shape as any).every((key) =>
    hasShape(input[key], shape[key]),
  );
}
