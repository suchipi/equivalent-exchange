import fsp from "node:fs/promises";
import tinyglobby from "tinyglobby";
import { runJobs } from "parallel-park";

export type FileStatus =
  | { status: "unchanged" }
  | { status: "changed"; before: string; after: string }
  | { status: "errored"; error: Error };

export type FileResults = Map<string, FileStatus>;

/**
 * Helper functions which apply a transform function to a set of files.
 */
export const mapFiles = {
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
  async fromGlob(
    patterns: string | Array<string>,
    globOptions: tinyglobby.GlobOptions | undefined,
    transform: (
      fileContent: string,
      filePath: string,
    ) => string | void | Promise<string | void>,
  ): Promise<FileResults> {
    const paths = await tinyglobby.glob(patterns, globOptions);
    return mapFiles.fromPaths(paths, transform);
  },

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
  async fromPaths(
    filePaths: Array<string>,
    transform: (
      fileContent: string,
      filePath: string,
    ) => string | void | Promise<string | void>,
  ): Promise<FileResults> {
    const results: FileResults = new Map();
    await runJobs(filePaths, async (filePath) => {
      try {
        const content = await fsp.readFile(filePath, "utf-8");
        const result = await transform(content, filePath);
        if (result == null || result === content) {
          results.set(filePath, { status: "unchanged" });
        } else {
          await fsp.writeFile(filePath, result);
          results.set(filePath, {
            status: "changed",
            before: content,
            after: result,
          });
        }
      } catch (err: any) {
        results.set(filePath, {
          status: "errored",
          error: err,
        });
      }
    });
    return results;
  },
};
