import { FunctionTypeNode, InterfaceDeclaration, Node, ParameterDeclaration, ts, TupleTypeNode, TypeAliasDeclaration, TypeLiteralNode, TypeNode, TypeParameterDeclaration, TypeReferenceNode } from 'ts-morph';
import { getDefinition } from '../../support/typescript';
import { Parameter, Response, ResponseCollection, Result } from '../operation';
import { TypeReference } from '../schema/type';
import { NamedElement } from './named-element';
import { TSElement } from './typescript-element';

export function isReference<T>(instance: T | Reference<T>): instance is Reference<T> {
  return instance instanceof Reference;
}

export function isDeclaration<T>(instance: T | Declaration<T>): instance is Declaration<T> {
  return instance instanceof Declaration;
}

export function isInline(typeReference: TypeReference): boolean {
  return ts.isTypeLiteralNode(typeReference.declaration.node);
}

export type NodeType<T> =
  T extends Parameter ? ParameterDeclaration :
  T extends Response ? FunctionTypeNode :
  T extends ResponseCollection ? TupleTypeNode :
  T extends Result ? TypeLiteralNode | InterfaceDeclaration :
  T extends (Response | ResponseCollection) ? (FunctionTypeNode | TupleTypeNode) :
  Node;

export interface ElementClass<T> {
  new(node: NodeType<T>): T;
  isAllowedNode(node: Node): node is NodeType<T>;
}

export interface ElementFactory<T> {
  createElement(node: NodeType<T>): T;
  isAllowedNode(node: Node): node is NodeType<T>;
}

export type ElementConstructor<T> = ElementClass<T> | ElementFactory<T>;

export function isElementFactory<T>(ctor: ElementConstructor<T>): ctor is ElementFactory<T> {
  return !!(<any>ctor).createElement;
}

export function newElement<T>(ctor: ElementConstructor<T>, node: Node) {
  if (!ctor.isAllowedNode(node)) {
    throw new Error(`${node.getKindName()} is invalid in this context`);
  }
  return isElementFactory(ctor) ? ctor.createElement(node) : new ctor(node);
}

export class Declaration<T> extends NamedElement<TypeAliasDeclaration | InterfaceDeclaration> {
  constructor(node: TypeAliasDeclaration | InterfaceDeclaration, private ctor: ElementConstructor<T>) {
    super(node);
  }

  #definition?: T;
  get definition(): T {
    if (this.#definition !== undefined) {
      return this.#definition;
    }

    let node: Node = this.node;
    if (Node.isTypeAliasDeclaration(node)) {
      node = node.getTypeNodeOrThrow();
    }

    return this.#definition = newElement(this.ctor, node);
  }

  get typeParameters(): Array<TypeParameterDeclaration> {
    return this.node.getTypeParameters();
  }
}

export class Reference<T> extends TSElement<TypeReferenceNode> {
  constructor(node: TypeReferenceNode, private ctor: ElementConstructor<T>) {
    super(node);
  }

  #target?: T;
  get target(): T {
    if (this.#target !== undefined) {
      return this.#target;
    }

    let node = getDefinition(this.node);
    if (Node.isTypeAliasDeclaration(node)) {
      node = node.getTypeNodeOrThrow();
    }

    return this.#target = newElement(this.ctor, node);
  }

  get typeName(): string {
    return this.node.getTypeName().getText();
  }

  get typeArguments(): Array<TypeNode> {
    return this.node.getTypeArguments();
  }
}