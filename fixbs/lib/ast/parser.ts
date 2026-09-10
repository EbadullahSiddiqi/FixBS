import ts from "typescript";

/*
|--------------------------------------------------------------------------
| Supported FixBS languages
|--------------------------------------------------------------------------
*/

export type SupportedLanguage =
  | "typescript"
  | "typescript-jsx"
  | "javascript"
  | "javascript-jsx";

/*
|--------------------------------------------------------------------------
| Parsed import
|--------------------------------------------------------------------------
*/

export type ParsedImport = {
  source: string;
  names: string[];
};

/*
|--------------------------------------------------------------------------
| Parsed export
|--------------------------------------------------------------------------
*/

export type ParsedExport = {
  name: string;
  type: "default" | "named";
};

/*
|--------------------------------------------------------------------------
| Parsed function
|--------------------------------------------------------------------------
*/

export type ParsedFunction = {
  name: string;
  line: number;
};

/*
|--------------------------------------------------------------------------
| Parsed class
|--------------------------------------------------------------------------
*/

export type ParsedClass = {
  name: string;
  line: number;
};

/*
|--------------------------------------------------------------------------
| Parsed React component
|--------------------------------------------------------------------------
*/

export type ParsedComponent = {
  name: string;
  line: number;
};

/*
|--------------------------------------------------------------------------
| Final representation of a source file
|--------------------------------------------------------------------------
*/

export type ParsedFile = {
  path: string;
  name: string;

  language: SupportedLanguage;

  imports: ParsedImport[];

  exports: ParsedExport[];

  functions: ParsedFunction[];

  classes: ParsedClass[];

  components: ParsedComponent[];
};

/*
|--------------------------------------------------------------------------
| Determine language from file extension
|--------------------------------------------------------------------------
*/

export function getLanguage(filePath: string): SupportedLanguage | null {
  const lowerPath = filePath.toLowerCase();

  if (lowerPath.endsWith(".tsx")) {
    return "typescript-jsx";
  }

  if (lowerPath.endsWith(".ts")) {
    return "typescript";
  }

  if (lowerPath.endsWith(".jsx")) {
    return "javascript-jsx";
  }

  if (
    lowerPath.endsWith(".js") ||
    lowerPath.endsWith(".mjs") ||
    lowerPath.endsWith(".cjs")
  ) {
    return "javascript";
  }

  return null;
}

/*
|--------------------------------------------------------------------------
| Convert our language into a TypeScript ScriptKind
|--------------------------------------------------------------------------
*/

function getScriptKind(language: SupportedLanguage): ts.ScriptKind {
  switch (language) {
    case "typescript":
      return ts.ScriptKind.TS;

    case "typescript-jsx":
      return ts.ScriptKind.TSX;

    case "javascript":
      return ts.ScriptKind.JS;

    case "javascript-jsx":
      return ts.ScriptKind.JSX;
  }
}

/*
|--------------------------------------------------------------------------
| Determine whether a function name looks like a React component
|--------------------------------------------------------------------------
|
| For now we use a simple convention:
|
|   UserCard     → component
|   Dashboard    → component
|   getUser      → function, not component
|
| React components conventionally begin with an uppercase letter.
|--------------------------------------------------------------------------
*/

function isComponentName(name: string): boolean {
  return /^[A-Z]/.test(name);
}

/*
|--------------------------------------------------------------------------
| Extract a function name
|--------------------------------------------------------------------------
*/

function getFunctionName(node: ts.FunctionDeclaration): string | null {
  return node.name?.text ?? null;
}

/*
|--------------------------------------------------------------------------
| Parse one source file
|--------------------------------------------------------------------------
*/

export function parseFile(file: {
  path: string;
  name: string;
  content: string;
}): ParsedFile | null {
  const language = getLanguage(file.path);

  /*
  | Ignore unsupported files.
  */

  if (!language) {
    return null;
  }

  /*
  | Create the TypeScript AST.
  */

  const sourceFile = ts.createSourceFile(
    file.path,
    file.content,
    ts.ScriptTarget.Latest,
    true,
    getScriptKind(language),
  );

  /*
  |--------------------------------------------------------------------------
  | Containers for extracted information
  |--------------------------------------------------------------------------
  */

  const imports: ParsedImport[] = [];

  const exports: ParsedExport[] = [];

  const functions: ParsedFunction[] = [];

  const classes: ParsedClass[] = [];

  const components: ParsedComponent[] = [];

  /*
  |--------------------------------------------------------------------------
  | Walk the AST
  |--------------------------------------------------------------------------
  */

  function visit(node: ts.Node) {
    /*
    |--------------------------------------------------------------------------
    | IMPORTS
    |--------------------------------------------------------------------------
    */

    if (
      ts.isImportDeclaration(node) &&
      ts.isStringLiteral(node.moduleSpecifier)
    ) {
      const source = node.moduleSpecifier.text;

      const names: string[] = [];

      const importClause = node.importClause;

      if (importClause) {
        /*
        | Default import
        |
        | import Navbar from "./Navbar"
        */

        if (importClause.name) {
          names.push(importClause.name.text);
        }

        /*
        | Named imports
        |
        | import { foo, bar } from "./utils"
        */

        if (
          importClause.namedBindings &&
          ts.isNamedImports(importClause.namedBindings)
        ) {
          for (const element of importClause.namedBindings.elements) {
            names.push(element.name.text);
          }
        }

        /*
        | Namespace import
        |
        | import * as utils from "./utils"
        */

        if (
          importClause.namedBindings &&
          ts.isNamespaceImport(importClause.namedBindings)
        ) {
          names.push(`* as ${importClause.namedBindings.name.text}`);
        }
      }

      imports.push({
        source,
        names,
      });
    }

    /*
    |--------------------------------------------------------------------------
    | EXPORTS
    |--------------------------------------------------------------------------
    */

    if (ts.isExportAssignment(node)) {
      exports.push({
        name: "default",
        type: "default",
      });
    }

    /*
    | export function foo() {}
    */

    if (ts.isFunctionDeclaration(node) && node.name) {
      const modifiers = ts.getModifiers(node);

      const hasExport = modifiers?.some(
        (modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword,
      );

      const hasDefault = modifiers?.some(
        (modifier) => modifier.kind === ts.SyntaxKind.DefaultKeyword,
      );

      if (hasExport) {
        exports.push({
          name: node.name.text,
          type: hasDefault ? "default" : "named",
        });
      }
    }

    /*
    | export class Foo {}
    */

    if (ts.isClassDeclaration(node) && node.name) {
      const modifiers = ts.getModifiers(node);

      const hasExport = modifiers?.some(
        (modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword,
      );

      const hasDefault = modifiers?.some(
        (modifier) => modifier.kind === ts.SyntaxKind.DefaultKeyword,
      );

      if (hasExport) {
        exports.push({
          name: node.name.text,
          type: hasDefault ? "default" : "named",
        });
      }
    }

    /*
    | export const foo = ...
    | export let foo = ...
    */

    if (ts.isVariableStatement(node)) {
      const modifiers = ts.getModifiers(node);

      const hasExport = modifiers?.some(
        (modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword,
      );

      if (hasExport) {
        for (const declaration of node.declarationList.declarations) {
          if (ts.isIdentifier(declaration.name)) {
            exports.push({
              name: declaration.name.text,
              type: "named",
            });
          }
        }
      }
    }

    /*
    |--------------------------------------------------------------------------
    | FUNCTIONS
    |--------------------------------------------------------------------------
    */

    if (ts.isFunctionDeclaration(node)) {
      const name = getFunctionName(node);

      if (name) {
        const line =
          sourceFile.getLineAndCharacterOfPosition(node.getStart()).line + 1;

        functions.push({
          name,
          line,
        });

        /*
        | A function beginning with an uppercase
        | letter is probably a React component.
        */

        if (isComponentName(name)) {
          components.push({
            name,
            line,
          });
        }
      }
    }

    /*
    |--------------------------------------------------------------------------
    | Arrow functions assigned to variables
    |
    | const Dashboard = () => {}
    |--------------------------------------------------------------------------
    */

    if (
      ts.isVariableDeclaration(node) &&
      ts.isIdentifier(node.name) &&
      node.initializer &&
      ts.isArrowFunction(node.initializer)
    ) {
      const name = node.name.text;

      const line =
        sourceFile.getLineAndCharacterOfPosition(node.getStart()).line + 1;

      functions.push({
        name,
        line,
      });

      if (isComponentName(name)) {
        components.push({
          name,
          line,
        });
      }
    }

    /*
    |--------------------------------------------------------------------------
    | CLASSES
    |--------------------------------------------------------------------------
    */

    if (ts.isClassDeclaration(node) && node.name) {
      const line =
        sourceFile.getLineAndCharacterOfPosition(node.getStart()).line + 1;

      classes.push({
        name: node.name.text,
        line,
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Continue walking the tree
    |--------------------------------------------------------------------------
    */

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);

  /*
  |--------------------------------------------------------------------------
  | Return our simplified representation
  |--------------------------------------------------------------------------
  */

  return {
    path: file.path,

    name: file.name,

    language,

    imports,

    exports,

    functions,

    classes,

    components,
  };
}
