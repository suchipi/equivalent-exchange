/**
 * Utility function which deeply-clones the provided object or value. Primitive
 * values are returned as-is (ie not cloned).
 *
 * This can be useful when you need to clone an AST node.
 */
export function clone<T extends Clonable>(input: T): T {
  const cache = new WeakMap<any, any>();
  return innerClone(cache, input);
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

function innerClone(cache: WeakMap<any, any>, target: unknown): any {
  // primitive or function
  if (typeof target !== "object" || target == null) {
    return target;
  }

  if (cache.has(target)) {
    return cache.get(target);
  }

  if (Array.isArray(target)) {
    const copy = new Array(target.length);
    cache.set(target, copy);
    for (let i = 0; i < target.length; i++) {
      copy[i] = innerClone(cache, target[i]);
    }
    // @ts-ignore could be instantiated with different subtype
    return copy;
  }

  const copy = Object.create(Object.getPrototypeOf(target));
  cache.set(target, copy);
  for (const key of Object.keys(target)) {
    copy[key] = innerClone(cache, target[key]);
  }

  return copy;
}

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
