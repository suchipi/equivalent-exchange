/**
 * Utility function which deeply-clones the provided object or value. Primitive
 * values are returned as-is (ie not cloned).
 *
 * This can be useful when you need to clone an AST node.
 */
export declare function clone<T extends Clonable>(input: T): T;
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
export declare function hasShape<Input, Shape>(
  input: Input,
  shape: Shape,
): input is Input & Shape;
export {};
