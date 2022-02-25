import { test, expect } from "vitest";
import { AST, transmute, traverse, types } from "./index";

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

  expect(
    transmute(code, transform),
  ).toMatchInlineSnapshot(`
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
