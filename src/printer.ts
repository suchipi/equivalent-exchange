import * as babelGenerator from "@babel/generator";
import * as types from "./types-ns";
import * as recast from "recast";
import { Result, Options } from "./ee-types";
import makeDebug from "debug";

const debug = makeDebug("equivalent-exchange:printer");

/**
 * Converts an AST back into a code string.
 *
 * This function is used internally by {@link transmute}.
 *
 * The options parameter is the same type as the options parameter for `transmute`.
 */
export function print(ast: types.Node, options?: Options): Result {
  debug("print", { ast, options });
  if (options) {
    const maybeWrongOpts = options as any;
    if ("printMethod" in maybeWrongOpts) {
      throw new Error(
        "`print` function received a legacy PrintOptions, but we want an Options. The following property should be in a sub-object under `printOptions`: printMethod",
      );
    }
  }

  const printMethod = options?.printOptions?.printMethod || "recast.print";

  debug("printing using", printMethod);

  switch (printMethod) {
    case "recast.print":
    case "recast.prettyPrint": {
      const printFunction =
        printMethod === "recast.print" ? recast.print : recast.prettyPrint;

      if (options?.fileName && options.sourceMapFileName) {
        const { code, map } = printFunction.call(recast, ast, {
          sourceFileName: options.fileName,
          sourceMapName: options.sourceMapFileName,
        });
        debug("returning with sourcemap maybe");
        return { code, map: map || null };
      } else {
        const { code } = printFunction.call(recast, ast);
        debug("returning without sourcemap");
        return { code, map: null };
      }
    }

    case "@babel/generator": {
      const { code, map } = babelGenerator.default(ast, {
        sourceFileName: options?.fileName,
        sourceMaps: Boolean(options?.sourceMapFileName),
      });

      if (options?.fileName && options.sourceMapFileName) {
        debug("returning with sourcemap maybe");
        return { code, map: map || null };
      } else {
        debug("returning without sourcemap");
        return { code, map: null };
      }
    }

    default: {
      throw new Error(`Invalid print method: ${printMethod}`);
    }
  }
}
