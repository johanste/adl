import { QuestionTokenableNode, ts, TypedNode } from 'ts-morph';
import { TypeSyntax } from '../../support/codegen';
import { addImportsTo, createImportsFor } from '../../support/typescript';
import { TypeReference } from '../schema/type';
import { NamedElement, NamedElementNode } from './named-element';

export type TypedElementNode = NamedElementNode & TypedNode & QuestionTokenableNode;

export class TypedElement<TNode extends TypedElementNode> extends NamedElement<TNode> {
  get type(): TypeReference {
    return {
      declaration: new TypeSyntax(this.node.getTypeNode()?.compilerNode ?? ts.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword)),
      requiredReferences: [] // todo
    };
  }
  set type(value: TypeReference) {
    this.node.setType(value.declaration.text);
    const file = this.node.getSourceFile();
    addImportsTo(file, createImportsFor(file, value));
  }

  get required() {
    return !this.node.hasQuestionToken();
  }

  set required(value: boolean) {
    this.node.setHasQuestionToken(!value);
  }
}
