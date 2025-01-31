import { describe, test, expect } from "vitest";
import {
  AST,
  transmute,
  traverse,
  types,
  clone,
  codeToAst,
  astToCode,
  hasShape,
  parse,
  print,
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
      "code": "console.log("goodbye!");",
      "map": null,
    }
  `);
});

test("with source map", async () => {
  const code = `console.log("hello!");`;

  const transform = (ast: types.Node) => {
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
      "code": "console.log("goodbye!");",
      "map": {
        "file": "src/index.js.map",
        "mappings": "AAAA,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,WAAS,CAAC",
        "names": [],
        "sources": [
          "src/index.js",
        ],
        "sourcesContent": [
          "console.log("hello!");",
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

      const Component: React.FC<Props> = ({greet = "goodbye!"}) => {
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
  expect(ast.program).not.toBe(otherAst.program);
  expect(ast.program.body[0]).not.toBe(otherAst.program.body[0]);

  expect(astToCode(ast).code).toMatchInlineSnapshot(
    "\"console.log(   'hi there!' );\"",
  );

  // recast-tracked formatting is lost. I think I don't care?
  expect(astToCode(otherAst).code).toMatchInlineSnapshot(
    '"console.log("hi there!");"',
  );
});

test("duplicate child", async () => {
  const ast = codeToAst("console.log( hi ) ;");

  ast.program.body.push(ast.program.body[0]);

  expect(astToCode(ast).code).toMatchInlineSnapshot(
    '"console.log( hi ) ;console.log( hi ) ;"',
  );
});

test("cloned duplicate child", async () => {
  const ast = codeToAst("console.log( hi ) ;");

  ast.program.body.push(clone(ast.program.body[0]));

  expect(astToCode(ast).code).toMatchInlineSnapshot(
    '"console.log( hi ) ;console.log(hi);"',
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

test("astToCode with non-file (simple)", () => {
  const ast = codeToAst("hi;");
  const node = (ast as any).program.body[0].expression;
  const result = astToCode(node);
  expect(result).toMatchInlineSnapshot(`
    {
      "code": "hi",
      "map": null,
    }
  `);
});

test("astToCode with non-file (complicated)", () => {
  const ast = codeToAst(
    "                console.log(  hi, 2 + some `one ${\noutThere}\n              \t \t`  )  ;\n\tvar theBite = 87;",
  ) as types.File;

  const callExpression: types.CallExpression = (ast.program.body[0] as any)
    .expression;

  const hi: types.Identifier = callExpression.arguments[0] as any;

  const binaryExpression: types.BinaryExpression = callExpression
    .arguments[1] as any;

  const variableDeclaration: types.VariableDeclaration = ast.program
    .body[1] as any;

  const theBite: types.Identifier = variableDeclaration.declarations[0]
    .init as any;

  const result = {
    callExpression: astToCode(callExpression),
    hi: astToCode(hi),
    binaryExpression: astToCode(binaryExpression),
    variableDeclaration: astToCode(variableDeclaration),
    theBite: astToCode(theBite),
  };

  expect(result).toMatchInlineSnapshot(`
    {
      "binaryExpression": {
        "code": "2 + some \`one \${
    outThere}
        \`",
        "map": null,
      },
      "callExpression": {
        "code": "console.log(  hi, 2 + some \`one \${
    outThere}
        \`  )",
        "map": null,
      },
      "hi": {
        "code": "hi",
        "map": null,
      },
      "theBite": {
        "code": "87",
        "map": null,
      },
      "variableDeclaration": {
        "code": "var theBite = 87;",
        "map": null,
      },
    }
  `);
});

test("codeToAst as expression", () => {
  const node = codeToAst("hi", { expression: true });
  expect(node.type).toBe("Identifier");
  expect((node as any).name).toBe("hi");
});

test("codeToAst as expression but it's a statement", () => {
  expect(() => {
    codeToAst("hi;", { expression: true });
  }).toThrowErrorMatchingInlineSnapshot(
    `[SyntaxError: Unexpected token, expected "," (1:3)]`,
  );
});

test("parse function (basic)", () => {
  const node = parse("hi");
  expect(node.type).toBe("File");
  expect(node.program.body[0].expression.type).toBe("Identifier");
  expect(node.program.body[0].expression.name).toBe("hi");
});

test("parse function (jsx)", () => {
  const node = parse("<a />");
  expect(node.type).toBe("File");
  expect(node.program.body[0].expression.type).toBe("JSXElement");
});

test("parse function (typescript)", () => {
  const node = parse("const a = (something: string): string => something;");
  expect(node.type).toBe("File");
  expect(node.program.body[0].type).toBe("VariableDeclaration");
  const decl = node.program.body[0];
  expect(decl.declarations[0].init.type).toBe("ArrowFunctionExpression");
  const arrowFnExpr = decl.declarations[0].init;
  expect(arrowFnExpr.returnType.typeAnnotation.type).toBe("TSStringKeyword");
});

test("parse function (typescript-dts)", () => {
  // Note: without dts option, this fails with "Missing initializer in const declaration."
  const node = parse("export const a: string;", {
    typeSyntax: "typescript-dts",
  });
  expect(node.type).toBe("File");
  expect(node.program.body[0].type).toBe("ExportNamedDeclaration");
  const exportDecl = node.program.body[0];
  expect(exportDecl.declaration.type).toBe("VariableDeclaration");
  const variableDeclaration = exportDecl.declaration;
  expect(variableDeclaration.declarations[0].type).toBe("VariableDeclarator");
  const variableDeclarator = variableDeclaration.declarations[0];

  // Note: const declaration without init not allowed in non-dts
  expect(variableDeclaration.kind).toBe("const");
  expect(variableDeclarator.init).toBe(null);

  expect(variableDeclarator.id.type).toBe("Identifier");
  const typeAnnotation = variableDeclarator.id.typeAnnotation;
  expect(typeAnnotation.type).toBe("TSTypeAnnotation");
});

test("parse function (flow)", () => {
  const node = parse("const a = (something: string): string => something;", {
    typeSyntax: "flow",
  });
  expect(node.type).toBe("File");
  expect(node.program.body[0].type).toBe("VariableDeclaration");
  const decl = node.program.body[0];
  expect(decl.declarations[0].init.type).toBe("ArrowFunctionExpression");
  const arrowFnExpr = decl.declarations[0].init;
  expect(arrowFnExpr.returnType.typeAnnotation.type).toBe(
    "StringTypeAnnotation",
  );
});

test("parse function (JSX implicitly enabled)", () => {
  expect(() => {
    parse("const a = <string>45;");
  }).toThrowErrorMatchingInlineSnapshot(
    `[SyntaxError: Unterminated JSX contents. (1:18)]`,
  );
});

test("parse function (JSX explicitly enabled)", () => {
  expect(() => {
    parse("const a = <string>45;", { jsxEnabled: true });
  }).toThrowErrorMatchingInlineSnapshot(
    `[SyntaxError: Unterminated JSX contents. (1:18)]`,
  );
});

test("parse function (JSX explicitly disabled)", () => {
  const node = parse("const a = <string>45;", { jsxEnabled: false });
  expect(node.type).toBe("File");
  expect(node.program.body[0].type).toBe("VariableDeclaration");
  const decl = node.program.body[0];
  expect(decl.declarations[0].init.type).toBe("TSTypeAssertion");
  const init = decl.declarations[0].init;
  expect(init.typeAnnotation.type).toBe("TSStringKeyword");
  expect(init.expression.type).toBe("NumericLiteral");
});

test("parse function (v8Intrinsic enabled without changing pipeline syntax)", () => {
  expect(() => {
    parse("const a = %Something()", {
      v8Intrinsic: true,
    });
  }).toThrowErrorMatchingInlineSnapshot(
    `[Error: Babel disallows using both v8Intrinsic and Hack-style pipes together. \`equivalent-exchange\` has hack-style pipeline syntax enabled by default. Either disable the 'v8Intrinsic' option or change the 'pipelineSyntax' option to a different value, such as 'none' (it defaults to 'hack').]`,
  );
});

test("parse function (v8Intrinsic enabled, pipeline syntax disabled)", () => {
  const node = parse("const a = %Something()", {
    v8Intrinsic: true,
    pipelineSyntax: "none",
  });
  expect(node.program.body[0].type).toBe("VariableDeclaration");
  const decl = node.program.body[0];
  expect(decl.declarations[0].init.type).toBe("CallExpression");
  expect(decl.declarations[0].init.callee.type).toBe("V8IntrinsicIdentifier");
  expect(decl.declarations[0].init.callee.name).toBe("Something");
});

test("parse function (v8Intrinsic enabled, pipeline syntax changed to fsharp)", () => {
  const node = parse("const a = %Something()", {
    v8Intrinsic: true,
    pipelineSyntax: "fsharp",
  });
  expect(node.program.body[0].type).toBe("VariableDeclaration");
  const decl = node.program.body[0];
  expect(decl.declarations[0].init.type).toBe("CallExpression");
  expect(decl.declarations[0].init.callee.type).toBe("V8IntrinsicIdentifier");
  expect(decl.declarations[0].init.callee.name).toBe("Something");
});

test("parse function (placeholders enabled without changing pipeline syntax)", () => {
  expect(() => {
    parse("const a = %%b%%", {
      placeholders: true,
    });
  }).toThrowErrorMatchingInlineSnapshot(
    `[Error: Babel disallows using both placeholders and Hack-style pipes together. \`equivalent-exchange\` has hack-style pipeline syntax enabled by default. Either disable the 'placeholders' option or change the 'pipelineSyntax' option to a different value, such as 'none' (it defaults to 'hack').]`,
  );
});

test("parse function (placeholders enabled, pipeline syntax disabled)", () => {
  const node = parse("const a = %%b%%", {
    placeholders: true,
    pipelineSyntax: "none",
  });
  expect(node.program.body[0].type).toBe("VariableDeclaration");
  const decl = node.program.body[0];
  expect(decl.declarations[0].init.type).toBe("Placeholder");
  const placeholder = decl.declarations[0].init;
  expect(placeholder.name.type).toBe("Identifier");
  expect(placeholder.name.name).toBe("b");
});

test("parse function (placeholders enabled, pipeline syntax changed to fsharp)", () => {
  const node = parse("const a = %%b%%", {
    placeholders: true,
    pipelineSyntax: "fsharp",
  });
  expect(node.program.body[0].type).toBe("VariableDeclaration");
  const decl = node.program.body[0];
  expect(decl.declarations[0].init.type).toBe("Placeholder");
  const placeholder = decl.declarations[0].init;
  expect(placeholder.name.type).toBe("Identifier");
  expect(placeholder.name.name).toBe("b");
});

test("parse function (placeholders enabled, v8 intrinsics enabled)", () => {
  expect(() => {
    parse("const a = %Something(%%b%%)", {
      placeholders: true,
      v8Intrinsic: true,
    });
  }).toThrowErrorMatchingInlineSnapshot(
    `[Error: Babel disallows using both v8Intrinsic and placeholders together at the same time. Either disable the 'v8Intrinsic' option or disable the 'placeholders' option.]`,
  );
});

test("print function (basic)", () => {
  const node = types.identifier("hi");
  const result = print(node);
  expect(result.code).toBe("hi");
});

test("print function (different methods)", () => {
  const node = types.identifier("hi");

  for (const printMethod of [
    "@babel/generator",
    "recast.print",
    "recast.prettyPrint",
  ] as const) {
    const result = print(node, { printMethod });
    expect(result.code).toBe("hi");
  }
});

test("print function (source maps, recast.print)", () => {
  const fileName = "myfile.js";
  const sourceMapFileName = "myfile.js.map";

  const ast = codeToAst("console.log(3);", { fileName, sourceMapFileName });

  traverse(ast, {
    Identifier(nodePath) {
      const node = nodePath.node;
      if (node.name === "log") {
        nodePath.replaceWith(types.identifier("pog"));
      }
    },
  });

  const result = print(ast, {
    printMethod: "recast.print",
    fileName,
    sourceMapFileName,
  });
  expect(result).toMatchInlineSnapshot(`
    {
      "code": "console.pog(3);",
      "map": {
        "file": "myfile.js.map",
        "mappings": "AAAA,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,IAAI,CAAC,CAAC,CAAC",
        "names": [],
        "sources": [
          "myfile.js",
        ],
        "sourcesContent": [
          "console.log(3);",
        ],
        "version": 3,
      },
    }
  `);
});

test("print function (source maps, recast.prettyPrint)", () => {
  const fileName = "myfile.js";
  const sourceMapFileName = "myfile.js.map";

  const ast = codeToAst("console.log(3);", { fileName, sourceMapFileName });

  traverse(ast, {
    Identifier(nodePath) {
      const node = nodePath.node;
      if (node.name === "log") {
        nodePath.replaceWith(types.identifier("pog"));
      }
    },
  });

  const result = print(ast, {
    printMethod: "recast.prettyPrint",
    fileName,
    sourceMapFileName,
  });
  expect(result).toMatchInlineSnapshot(`
    {
      "code": "console.pog(3);",
      "map": null,
    }
  `);
});

test("print function (source maps, @babel/generator)", () => {
  const fileName = "myfile.js";
  const sourceMapFileName = "myfile.js.map";

  const ast = codeToAst("console.log(3);", { fileName, sourceMapFileName });

  traverse(ast, {
    Identifier(nodePath) {
      const node = nodePath.node;
      if (node.name === "log") {
        nodePath.replaceWith(types.identifier("pog"));
      }
    },
  });

  const result = print(ast, {
    printMethod: "@babel/generator",
    fileName,
    sourceMapFileName,
  });
  expect(result).toMatchInlineSnapshot(`
    {
      "code": "console.pog(3);",
      "map": {
        "file": undefined,
        "ignoreList": [],
        "mappings": "AAAAA,OAAO,CAAAC,GAAI,CAAC,CAAC,CAAC",
        "names": [
          "console",
          "pog",
        ],
        "sourceRoot": undefined,
        "sources": [
          "myfile.js",
        ],
        "sourcesContent": [
          null,
        ],
        "version": 3,
      },
    }
  `);
});
