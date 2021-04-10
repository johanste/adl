// TextMate-based syntax highlighting is implemented in this file.
// adl.tmLanguage is generated by running this script.

import * as tm from "@azure-tools/tmlanguage-generator";
import fs from "fs/promises";
import { resolve } from "path";

type IncludeRule = tm.IncludeRule<ADLScope>;
type BeginEndRule = tm.BeginEndRule<ADLScope>;
type MatchRule = tm.MatchRule<ADLScope>;
type Grammar = tm.Grammar<ADLScope>;

type ADLScope =
  | "comment.block.adl"
  | "comment.line.double-slash.adl"
  | "constant.character.escape.adl"
  | "constant.numeric.adl"
  | "constant.language.adl"
  | "entity.name.type.adl"
  | "entity.name.function.adl"
  | "keyword.other.adl"
  | "string.quoted.double.adl"
  | "variable.name.adl";

const meta: typeof tm.meta = tm.meta;
const identifierStart = "[_$[:alpha:]]";
const identifierContinue = "[_$[:alnum:]]";
const beforeIdentifier = `(?=${identifierStart})`;
const identifier = `\\b${identifierStart}${identifierContinue}*\\b`;
const stringPattern = '\\"(?:[^\\"\\\\]|\\\\.)*\\"';
const statementKeyword = `\\b(?:namespace|model|op|using|import)\\b`;
const universalEnd = `(?=,|;|@|\\)|\\}|${statementKeyword})`;
const hexNumber = "\\b(?<!\\$)0(?:x|X)[0-9a-fA-F][0-9a-fA-F_]*(n)?\\b(?!\\$)";
const binaryNumber = "\\b(?<!\\$)0(?:b|B)[01][01_]*(n)?\\b(?!\\$)";
const decimalNumber =
  "(?<!\\$)(?:" +
  "(?:\\b[0-9][0-9_]*(\\.)[0-9][0-9_]*[eE][+-]?[0-9][0-9_]*(n)?\\b)|" + // 1.1E+3
  "(?:\\b[0-9][0-9_]*(\\.)[eE][+-]?[0-9][0-9_]*(n)?\\b)|" + // 1.E+3
  "(?:\\B(\\.)[0-9][0-9_]*[eE][+-]?[0-9][0-9_]*(n)?\\b)|" + // .1E+3
  "(?:\\b[0-9][0-9_]*[eE][+-]?[0-9][0-9_]*(n)?\\b)|" + // 1E+3
  "(?:\\b[0-9][0-9_]*(\\.)[0-9][0-9_]*(n)?\\b)|" + // 1.1
  "(?:\\b[0-9][0-9_]*(\\.)(n)?\\B)|" + // 1.
  "(?:\\B(\\.)[0-9][0-9_]*(n)?\\b)|" + // .1
  "(?:\\b[0-9][0-9_]*(n)?\\b(?!\\.))" + // 1
  ")(?!\\$)";
const anyNumber = `(?:${hexNumber}|${binaryNumber}|${decimalNumber})`;

const expression: IncludeRule = {
  key: "expression",
  patterns: [
    /* placeholder filled later due to cycle*/
  ],
};

const statement: IncludeRule = {
  key: "statement",
  patterns: [
    /*placeholder filled later due to cycle*/
  ],
};

const booleanLiteral: MatchRule = {
  key: "boolean-literal",
  scope: "constant.language.adl",
  match: `\\b(true|false)\\b`,
};

const escapeChar: MatchRule = {
  key: "escape-character",
  scope: "constant.character.escape.adl",
  match: "\\\\.",
};

// TODO: Triple-quoted """X""" currently matches as three string literals
// ("" "X" "") but should be its own thing.
const stringLiteral: BeginEndRule = {
  key: "string-literal",
  scope: "string.quoted.double.adl",
  begin: '"',
  end: '"',
  patterns: [escapeChar],
};

const numericLiteral: MatchRule = {
  key: "numeric-literal",
  scope: "constant.numeric.adl",
  match: anyNumber,
};

const lineComment: MatchRule = {
  key: "line-comment",
  scope: "comment.line.double-slash.adl",
  match: "//.*$",
};

const blockComment: BeginEndRule = {
  key: "block-comment",
  scope: "comment.block.adl",
  begin: "/\\*",
  end: "\\*/",
};

// Tokens that match standing alone in any context: literals and comments
const token: IncludeRule = {
  key: "token",
  patterns: [lineComment, blockComment, stringLiteral, booleanLiteral, numericLiteral],
};

const parenthesizedExpression: BeginEndRule = {
  key: "parenthesized-expression",
  scope: meta,
  begin: "\\(",
  end: "\\)",
  patterns: [expression],
};

const decorator: BeginEndRule = {
  key: "decorator",
  scope: meta,
  begin: `@(${identifier})`,
  beginCaptures: {
    "1": { scope: "entity.name.function.adl" },
  },
  end: `${beforeIdentifier}|${universalEnd}`,
  patterns: [token, parenthesizedExpression],
};

const identifierExpression: MatchRule = {
  key: "type-name",
  scope: "entity.name.type.adl",
  match: identifier,
};

const typeArguments: BeginEndRule = {
  key: "type-arguments",
  scope: meta,
  begin: "<",
  end: ">",
  patterns: [expression],
};

const tupleExpression: BeginEndRule = {
  key: "tuple-expression",
  scope: meta,
  begin: "\\[",
  end: "\\]",
  patterns: [expression],
};

const typeAnnotation: BeginEndRule = {
  key: "type-annotation",
  scope: meta,
  begin: "\\s*:",
  end: universalEnd,
  patterns: [expression],
};

const modelProperty: BeginEndRule = {
  key: "model-property",
  scope: meta,
  begin: `(?:(${identifier})|(${stringPattern}))`,
  beginCaptures: {
    "1": { scope: "variable.name.adl" },
    "2": { scope: "string.quoted.double.adl" },
  },
  end: universalEnd,
  patterns: [token, typeAnnotation],
};

const modelSpreadProperty: BeginEndRule = {
  key: "model-spread-property",
  scope: meta,
  begin: "\\.\\.\\.",
  end: universalEnd,
  patterns: [expression],
};

const modelExpression: BeginEndRule = {
  key: "model-expression",
  scope: meta,
  begin: "\\{",
  end: "\\}",
  patterns: [token, decorator, modelProperty, modelSpreadProperty],
};

const modelHeritage: BeginEndRule = {
  key: "model-heritage",
  scope: meta,
  begin: "\\b(extends)\\b",
  beginCaptures: {
    "1": { scope: "keyword.other.adl" },
  },
  end: universalEnd,
  patterns: [expression],
};

const modelStatement: BeginEndRule = {
  key: "model-statement",
  scope: meta,
  begin: "\\b(model)\\b",
  beginCaptures: {
    "1": { scope: "keyword.other.adl" },
  },
  end: `(?<=\\})|${universalEnd}`,
  patterns: [
    token,
    modelHeritage, // before expression or `extends` will look like type name
    expression, // enough to match name, type parameters, and body and assignment.
  ],
};

const namespaceName: BeginEndRule = {
  key: "namespace-name",
  scope: meta,
  begin: beforeIdentifier,
  end: `((?=\\{)|${universalEnd})`,
  patterns: [token, identifierExpression],
};

const namespaceBody: BeginEndRule = {
  key: "namespace-body",
  scope: meta,
  begin: "\\{",
  end: "\\}",
  patterns: [statement],
};

const namespaceStatement: BeginEndRule = {
  key: "namespace-statement",
  scope: meta,
  begin: "\\b(namespace)\\b",
  beginCaptures: {
    "1": { scope: "keyword.other.adl" },
  },
  end: `((?<=\\})|${universalEnd})`,
  patterns: [token, namespaceName, namespaceBody],
};

const functionName: MatchRule = {
  key: "function-name",
  scope: "entity.name.function.adl",
  match: identifier,
};

const operationName: BeginEndRule = {
  key: "operation-name",
  scope: meta,
  begin: beforeIdentifier,
  end: `((?=\\()|${universalEnd})`,
  patterns: [token, functionName],
};

const operationParameters: BeginEndRule = {
  key: "operation-parameters",
  scope: meta,
  begin: "\\(",
  end: "\\)",
  patterns: [token, decorator, modelProperty, modelSpreadProperty],
};

const operationStatement: BeginEndRule = {
  key: "operation-statement",
  scope: meta,
  begin: "\\b(op)\\b",
  beginCaptures: {
    "1": { scope: "keyword.other.adl" },
  },
  end: universalEnd,
  patterns: [
    token,
    operationName,
    operationParameters,
    typeAnnotation, // return type
  ],
};

const importStatement: BeginEndRule = {
  key: "import-statement",
  scope: meta,
  begin: "\\b(import)\\b",
  beginCaptures: {
    "1": { scope: "keyword.other.adl" },
  },
  end: universalEnd,
  patterns: [token],
};

const usingStatement: BeginEndRule = {
  key: "using-statement",
  scope: meta,
  begin: "\\b(using)\\b",
  beginCaptures: {
    "1": { scope: "keyword.other.adl" },
  },
  end: universalEnd,
  patterns: [token, identifierExpression],
};

// NOTE: We don't actually classify all the different expression types and their
// punctuation yet. For now, at least, we only deal with the ones that would
// break coloring due to breaking out of context inappropriately with parens/
// braces/brackets that weren't handled with appropriate precedence. The other
// expressions color acceptably as unclassified punctuation around those we do
// handle here.
expression.patterns = [
  token,
  parenthesizedExpression,
  typeArguments,
  tupleExpression,
  modelExpression,
  identifierExpression,
];

statement.patterns = [
  token,
  decorator,
  modelStatement,
  namespaceStatement,
  operationStatement,
  importStatement,
  usingStatement,
];

const grammar: Grammar = {
  $schema: tm.schema,
  name: "ADL",
  scopeName: "source.adl",
  fileTypes: [".adl"],
  patterns: [statement],
};

export async function main() {
  const plist = await tm.emitPList(grammar, {
    errorSourceFilePath: resolve("./src/tmlanguage.ts"),
  });
  await fs.writeFile("./dist/adl.tmLanguage", plist);
}
