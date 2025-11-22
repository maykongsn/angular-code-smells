import { ParseResult } from "@babel/parser";
import { File, isDecorator, isClassDeclaration } from "@babel/types";
import traverse from "@babel/traverse";
import { SourceLocation } from "../types";

const THRESHOLD = 200;

export const largeComponent = (ast: ParseResult<File>) => {
  const large: SourceLocation[] = [];

  traverse(ast, {
    enter(path) {
      if (!isClassDeclaration(path.node)) return;

      const node = path.node;

      const hasComponentDecorator =
        node.decorators?.some(
          (decorator) =>
            isDecorator(decorator) &&
            decorator.expression.type === "CallExpression" &&
            decorator.expression.callee.type === "Identifier" &&
            decorator.expression.callee.name === "Component"
        ) ?? false;

      if (!hasComponentDecorator) return;

      const lines =
        node.loc?.end.line && node.loc?.start.line
          ? node.loc.end.line - node.loc.start.line
          : 0;

      if (lines > THRESHOLD) {
        large.push({
          start: node.loc?.start.line,
          end: node.loc?.end.line,
          path: node.loc?.filename,
        });
      }
    },
  });

  return large;
};
