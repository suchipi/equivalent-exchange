import { test, expect } from "vitest";
import {
  AST,
  transmute,
  traverse,
  types,
  clone,
  codeToAst,
  astToCode,
  hasShape,
} from "./index";

test("basic usage", async () => {
  const code = `console.log("hello!");`;

  const transform = (ast: AST) => {
    traverse(ast, {
      StringLiteral(path) {
        const { node } = path;
        if (node.value === "hello!") {
          path.replaceWith(types.stringLiteral("goodbye!"));
        }
      },
    });
  };

  const result1 = transmute(code, transform);
  const result2 = await transmute(code, async (ast) => transform(ast));

  expect(result1).toEqual(result2);
  expect(result1).toMatchInlineSnapshot(`
    {
      "code": "console.log(\\"goodbye!\\");",
      "map": null,
    }
  `);
});

test("with source map", async () => {
  const code = `console.log("hello!");`;

  const transform = (ast: AST) => {
    traverse(ast, {
      StringLiteral(path) {
        const { node } = path;
        if (node.value === "hello!") {
          path.replaceWith(types.stringLiteral("goodbye!"));
        }
      },
    });
  };

  const options = {
    fileName: "src/index.js",
    sourceMapFileName: "src/index.js.map",
  };
  const result1 = transmute(code, options, transform);
  const result2 = await transmute(code, options, async (ast) => transform(ast));

  expect(result1).toEqual(result2);
  expect(result1).toMatchInlineSnapshot(`
    {
      "code": "console.log(\\"goodbye!\\");",
      "map": {
        "file": "src/index.js.map",
        "mappings": "AAAA,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,WAAS,CAAC",
        "names": [],
        "sources": [
          "src/index.js",
        ],
        "sourcesContent": [
          "console.log(\\"hello!\\");",
        ],
        "version": 3,
      },
    }
  `);
});

test("received AST type is File", async () => {
  expect.assertions(2);

  const code = `console.log("hello!");`;

  const transform = (ast: AST) => {
    expect(ast.type).toBe("File");
  };

  transmute(code, transform);
  await transmute(code, async (ast) => {
    transform(ast);
  });
});

test("received AST uses babel *Literal types instead of ESTree Literal type", async () => {
  expect.assertions(6);

  const code = `console.log("hello!", 2, /blah/);`;

  const transform = (ast: AST) => {
    traverse(ast, {
      StringLiteral(path) {
        expect(path.node.type).toBe("StringLiteral");
      },
      NumericLiteral(path) {
        expect(path.node.type).toBe("NumericLiteral");
      },
      RegExpLiteral(path) {
        expect(path.node.type).toBe("RegExpLiteral");
      },
    });
  };

  transmute(code, transform);
  await transmute(code, async (ast) => {
    transform(ast);
  });
});

test("with jsx syntax", async () => {
  const code = `
  interface Props {
    greet: string;
  }

  const Component: React.FC<Props> = ({greet = "hello!"}) => {
    return <div>{greet}</div>
  }`;

  const transform = (ast: AST) => {
    traverse(ast, {
      StringLiteral(path) {
        const { node } = path;
        if (node.value === "hello!") {
          path.replaceWith(types.stringLiteral("goodbye!"));
        }
      },
    });
  };

  expect(transmute(code, transform)).toMatchInlineSnapshot(`
    {
      "code": "
      interface Props {
        greet: string;
      }
    
      const Component: React.FC<Props> = ({greet = \\"goodbye!\\"}) => {
        return <div>{greet}</div>
      }",
      "map": null,
    }
  `);
});

test("clone helper", async () => {
  const ast = codeToAst("console.log(   'hi there!' );");
  const otherAst = clone(ast);

  expect(otherAst).not.toBe(ast);
  expect(otherAst).toBeInstanceOf(ast.constructor);
  expect(types.isFile(ast)).toBe(true);
  expect(types.isFile(otherAst)).toBe(true);

  expect(astToCode(ast).code).toMatchInlineSnapshot(
    "\"console.log(   'hi there!' );\""
  );
  expect(astToCode(otherAst).code).toMatchInlineSnapshot(
    "\"console.log(   'hi there!' );\""
  );
});

test("duplicate child", async () => {
  const ast = codeToAst("console.log( hi ) ;");

  ast.program.body.push(ast.program.body[0]);

  expect(astToCode(ast).code).toMatchInlineSnapshot(
    '"console.log( hi ) ;console.log( hi ) ;"'
  );
});

test("cloned duplicate child", async () => {
  const ast = codeToAst("console.log( hi ) ;");

  ast.program.body.push(clone(ast.program.body[0]));

  expect(astToCode(ast).code).toMatchInlineSnapshot(
    '"console.log( hi ) ;console.log(hi);"'
  );
});

// is this a recast bug? I don't like this, but I don't know where
// the right place to fix it is. Documenting the behavior here for now.
test("dangerous duplicate child", async () => {
  const ast = codeToAst(" [ 1] ");

  ast.program.body.push(ast.program.body[0]);

  expect(astToCode(ast).code).toMatchInlineSnapshot('" [ 1][ 1] "');
});

// is this a recast bug? I don't like this, but I don't know where
// the right place to fix it is. Documenting the behavior here for now.
test("dangerous cloned duplicate child", async () => {
  const ast = codeToAst(" [ 1] ");

  ast.program.body.push(clone(ast.program.body[0]));

  expect(astToCode(ast).code).toMatchInlineSnapshot('" [ 1][1]; "');
});

test("hasShape", async () => {
  {
    const input = { type: "Bla", one: [1] };
    const shape = { type: "Bla" };
    expect(hasShape(input, shape)).toBe(true);
  }

  {
    const input = { type: "Bla", one: [1] };
    const shape = { type: "Blah" };
    expect(hasShape(input, shape)).toBe(false);
  }

  {
    const input = [1, 2, 3];
    const shape = [1, 2];
    expect(hasShape(input, shape)).toBe(true);
  }

  {
    const input = [1, 2, 3];
    const shape = [2, 2];
    expect(hasShape(input, shape)).toBe(false);
  }

  {
    const input = [1, 2, 3];
    const shape = [1, 2, 3, 4];
    expect(hasShape(input, shape)).toBe(false);
  }

  {
    const input = 4;
    const shape = 4;
    expect(hasShape(input, shape)).toBe(true);
  }

  {
    const input = "hi";
    const shape = "hiiii";
    expect(hasShape(input, shape)).toBe(false);
  }

  {
    const input = "hi";
    const shape = "hi";
    expect(hasShape(input, shape)).toBe(true);
  }

  {
    const input = codeToAst("hi;");
    const shape = { type: "File", program: { type: "Program" } };
    expect(hasShape(input, shape)).toBe(true);
  }

  {
    const input = codeToAst("hi;");
    const shape = { type: "File", program: { type: "Not a Program" } };
    expect(hasShape(input, shape)).toBe(false);
  }

  {
    const input = codeToAst("hi;") as types.Node;

    const check = (_: types.File) => {};

    // @ts-expect-error input is not types.File
    check(input);

    if (hasShape(input, { type: "File" } as const)) {
      // There should not be a typescript error on the next line
      check(input);
    }
  }
});
