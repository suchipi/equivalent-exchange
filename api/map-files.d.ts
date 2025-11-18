import tinyglobby = require("tinyglobby");
import { Result } from "./ee-types";
export type FileStatus =
  | {
      status: "unchanged";
    }
  | {
      status: "changed";
      before: string;
      after: string;
    }
  | {
      status: "errored";
      error: Error;
    };
export type FileResults = Map<string, FileStatus>;
export type TransformFunction = (
  fileContent: string,
  filePath: string,
) => TransformReturn;
export type TransformReturn =
  | string
  | void
  | Result
  | Promise<string | void | Result>;
/**
 * Helper function which applies a transform function to a set of files,
 * specified via glob patterns.
 *
 * Each file's content will be read as a UTF-8 string and then provided to the
 * transform function. If the transform function returns a *different* UTF-8
 * string, the file will be updated such that its content is equivalent to the
 * string returned from the transform function.
 *
 * Transform functions can return `undefined` to skip updating a file.
 *
 * The return value of `fromGlob` is a Map whose keys are filepath strings and
 * whose value is one of the following:
 *
 * - `{ status: "unchanged" }`, which indicates the file was not modified
 * - `{ status: "changed", before: string, after: string }`, which indicates the file WAS modified
 * - `{ status: "errored", error: Error }`, which indicates that the file could not be processed due to an error.
 */
export declare function fromGlob(
  patterns: string | Array<string>,
  transform: TransformFunction,
): Promise<FileResults>;
export declare function fromGlob(
  patterns: string | Array<string>,
  globOptions: tinyglobby.GlobOptions | undefined,
  transform: TransformFunction,
): Promise<FileResults>;
/**
 * Helper function which applies a transform function to a set of files,
 * specified via an array of filepath strings.
 *
 * Each file's content will be read as a UTF-8 string and then provided to the
 * transform function. If the transform function returns a *different* UTF-8
 * string, the file will be updated such that its content is equivalent to the
 * string returned from the transform function.
 *
 * Transform functions can return `undefined` to skip updating a file.
 *
 * The return value of `fromGlob` is a Map whose keys are filepath strings and
 * whose value is one of the following:
 *
 * - `{ status: "unchanged" }`, which indicates the file was not modified
 * - `{ status: "changed", before: string, after: string }`, which indicates the file WAS modified
 * - `{ status: "errored", error: Error }`, which indicates that the file could not be processed due to an error.
 */
export declare function fromPaths(
  filePaths: Array<string>,
  transform: TransformFunction,
): Promise<FileResults>;
