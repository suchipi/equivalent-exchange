# equivalent-exchange

Suchipi's flexible JS/TS codemodding/refactoring toolkit, powered by [Babel](https://babeljs.io/) and [Recast](https://www.npmjs.com/package/recast).

## Features

- Can parse code using modern ES20XX syntax, as well as JSX/TSX and TypeScript/Flow syntax.
- Maintains the source formatting of the original source, where possible; only modified parts of the code will be touched.
- Can generate a source map that maps your input file into your transformed output.

## Usage Example

"Transmute" one string of code into another by using the `transmute` function:

```ts
import { transmute } from "equivalent-exchange";

const someJs = "console.log('hi!');";

const result = transmute(someJs, (ast) => {
  // Within this callback, we mutate the AST as desired for the
  // codemod/refactor.
  // Use https://astexplorer.net/ to see what this tree
  // structure looks like!
  ast.program.body[0].expression.callee.arguments[0].value = "goodbye!";
});

console.log(result.code); // console.log("goodbye!");
```

For more flexible codemods, use the included utilities:

```ts
import { transmute, traverse, types } from "equivalent-exchange";

// `traverse` and `types` come from Babel!

const someJs = "console.log('hi!', 'hi again!');";

const result = transmute(someJs, (ast) => {
  // Walk the tree...
  traverse(ast, {
    // And for every StringLiteral node we find...
    StringLiteral(path) {
      const { node } = path;
      // If it starts with 'hi'...
      if (node.value.startsWith("hi")) {
        const newValue = node.value.replace(/^hi/, "bye");
        const newNode = types.stringLiteral(newValue);
        // Change 'hi' to 'bye'
        path.replaceWith(newNode);
      }
    },
  });
});

console.log(result.code); // "console.log('bye!', 'bye again!');"
```

## API Documentation

See [api/index.md](/api/index.md).

## License

MIT
