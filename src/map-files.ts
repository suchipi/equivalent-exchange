import fsp from "node:fs/promises";
import tinyglobby = require("tinyglobby");
import { runJobs } from "parallel-park";
import { Result } from "./ee-types";
import makeDebug from "debug";

const debug = makeDebug("equivalent-exchange:map-files");
const debugContent = makeDebug("equivalent-exchange:map-files:content");

export type FileStatus =
  | { status: "unchanged" }
  | { status: "changed"; before: string; after: string }
  | { status: "errored"; error: Error };

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
export async function fromGlob(
  patterns: string | Array<string>,
  transform: TransformFunction,
): Promise<FileResults>;
export async function fromGlob(
  patterns: string | Array<string>,
  globOptions: tinyglobby.GlobOptions | undefined,
  transform: TransformFunction,
): Promise<FileResults>;
export async function fromGlob(
  patterns: string | Array<string>,
  ...maybeOptionsAndTransform: any
): Promise<FileResults> {
  let globOptions: tinyglobby.GlobOptions | undefined;
  let transform: TransformFunction;
  if (maybeOptionsAndTransform.length === 2) {
    [globOptions, transform] = maybeOptionsAndTransform;
  } else {
    [transform] = maybeOptionsAndTransform;
    globOptions = undefined;
  }
  debug("Globbing...", { patterns, globOptions });
  const paths = await tinyglobby.glob(patterns, globOptions);
  return fromPaths(paths, transform);
}

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
export async function fromPaths(
  filePaths: Array<string>,
  transform: TransformFunction,
): Promise<FileResults> {
  const results: FileResults = new Map();
  debug(`Processing ${filePaths.length} files, up to 8 at a time`);
  await runJobs(filePaths, async (filePath) => {
    try {
      debug("Reading:", filePath);
      const content = await fsp.readFile(filePath, "utf-8");
      debugContent(filePath, "content before:\n", content);
      debug("Transforming:", filePath);
      const result = await transform(content, filePath);
      debug("Done Transforming:", filePath);
      if (result === undefined || result === content) {
        debug("Unchanged:", filePath);
        results.set(filePath, { status: "unchanged" });
      } else {
        let newContent: string;
        if (typeof result === "string") {
          newContent = result;
        } else if (
          typeof result === "object" &&
          result != null &&
          "code" in result &&
          typeof result.code === "string"
        ) {
          newContent = result.code;
        } else {
          debug("Transform returned invalid value:", { filePath, result });
          throw new Error(
            `Transform returned invalid value: ${String(result)}`,
          );
        }

        debugContent(filePath, "content after:\n", newContent);
        debug("Writing:", filePath);
        await fsp.writeFile(filePath, newContent);
        results.set(filePath, {
          status: "changed",
          before: content,
          after: newContent,
        });
      }
    } catch (err: any) {
      debug("Errored:", { filePath, err });
      results.set(filePath, {
        status: "errored",
        error: err,
      });
    }
  });
  debug(`Done processing ${filePaths.length} files.`);
  return results;
}
