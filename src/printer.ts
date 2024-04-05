import * as babelGenerator from "@babel/generator";
import * as types from "./types-ns";
import * as recast from "recast";
import { PrintOptions, TransmuteResult } from "./ee-types";

/**
 * Converts an AST back into a code string.
 *
 * This function is used internally by `transmute`.
 *
 * The options parameter works the same as the options parameter for `transmute`.
 */
export function print(
  ast: types.Node,
  options: PrintOptions = {},
): TransmuteResult {
  const printMethod = options.printMethod || "recast.print";

  switch (printMethod) {
    case "recast.print":
    case "recast.prettyPrint": {
      const printFunction =
        printMethod === "recast.print" ? recast.print : recast.prettyPrint;

      if (options.fileName && options.sourceMapFileName) {
        const { code, map } = printFunction.call(recast, ast, {
          sourceFileName: options.fileName,
          sourceMapName: options.sourceMapFileName,
        });
        return { code, map: map || null };
      } else {
        const { code } = printFunction.call(recast, ast);
        return { code, map: null };
      }
    }

    case "@babel/generator": {
      const { code, map } = babelGenerator.default(ast, {
        sourceFileName: options.fileName,
        sourceMaps: Boolean(options.sourceMapFileName),
      });

      if (options.fileName && options.sourceMapFileName) {
        return { code, map: map || null };
      } else {
        return { code, map: null };
      }
    }

    default: {
      throw new Error(`Invalid print method: ${printMethod}`);
    }
  }
}
