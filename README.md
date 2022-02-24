# equivalent-exchange

Transmute one JavaScript string into another by way of mutating its AST. Powered by [babel](https://babeljs.io/) and [recast](https://www.npmjs.com/package/recast).

## Features

- Can parse code using modern ES20XX syntax, as well as either TypeScript or Flow syntax.
- Maintains the source formatting of the original source, where possible; only modified parts of the code will be touched.
- Can generate a source map that maps your input file into your transformed output.

## Usage Example

```ts
import { transmute, traverse, types } from "equivalent-exchange";

const someJs = "console.log('hi!');";

const result = transmute(someJs, (ast) => {
  traverse(ast, {
    StringLiteral(path) {
      const { node } = path;
      if (node.value === "hi!") {
        path.replaceWith(types.stringLiteral("goodbye!"));
      }
    },
  });
});

console.log(result.code); // console.log("goodbye!");
```

Note that you don't have to use the provided `traverse` or `types`; you can mutate the ast using whatever traversal method you prefer.

## API Documentation

Please see [api/index.d.ts](https://github.com/suchipi/equivalent-exchange/blob/main/api/index.d.ts) for API documentation. There are lots of comments.

## License

MIT
