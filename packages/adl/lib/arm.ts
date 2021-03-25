import {
  NamespaceStatementNode,
  Type,
  Statement,
  SyntaxKind,
  OperationStatementNode,
} from "../compiler/types.js";
import { Program } from "../compiler/program";
import { parse } from "../compiler/parser.js";
import { consumes, produces, resource } from "./rest.js";

function parseStatement<TNode extends Statement>(adlStatement: string): TNode {
  // We're assuming that the parser will throw on bad input,
  // so no error handling is added at this level
  const script = parse(adlStatement);

  if (script.statements.length === 0) {
    throw new Error("No statements found in parsed input.");
  }

  return script.statements[0] as TNode;
}

// TODO: We can't name this ArmTrackedResource because that name
//       is already taken.  Consider having decorators occupy a
//       different namespace than types.
export function TrackedResource(
  program: Program,
  target: Type,
  resourceRoot: string,
  propertyType: Type
) {
  const checker = program.checker;
  if (checker === undefined) {
    throw new Error("Program does not have a checker assigned");
  }

  if (propertyType.node!.kind !== SyntaxKind.ModelStatement) {
    throw new Error("Property type must be a model.");
  }

  // Get the fully qualified name of the property type
  const propertyTypeName = checker.getTypeName(propertyType);

  if (target.kind === "Namespace") {
    if (propertyType.kind === "Model") {
      // Create the resource model type and evaluate it
      const resourceModelName = `${target.name}Resource`;
      // TODO: How do I put this in a parent namespace?
      program.evalAdlScript(`
         @extension("x-ms-azure-resource", true) \
         model ${resourceModelName} = ArmTrackedResource<${propertyTypeName}>;

         @resource("/subscriptions/{subscriptionId}/providers/${resourceRoot}")
         namespace ${target.name}ListAll {
           @list @get op listAll(@path subscriptionId: string): Page<${resourceModelName}>;
         }

         @resource("/subscriptions/{subscriptionId}/resourceGroups/{resourceGroup}/providers/${resourceRoot}")
         namespace ${target.name}List {
           @list @get op listByResourceGroup(@path subscriptionId: string, @path resourceGroup: string): Page<${resourceModelName}>;
         }
      `);

      // Create a temporary namespace and parse it so
      // that we can harvest its namespace properties
      const resourceNamespaceNode = parseStatement<NamespaceStatementNode>(
        // TODO: Might need to generate dynamic namespace here!
        `namespace Temp { \
          @get op get(@path subscriptionId: string, @path resourceGroup: string, @path name: string): ArmResponse<${resourceModelName}>; \
          @put op createOrUpdate(@path subscriptionId: string, @path resourceGroup: string, @path name: string, @body resource: ${resourceModelName}) : ArmResponse<${resourceModelName}>; \
          @patch op update(@path subscriptionId: string, @path resourceGroup: string, @path name: string, @body resource: ${resourceModelName}): ArmResponse<${resourceModelName}>; \
          @_delete op delete(@path subscriptionId: string, @path resourceGroup: string, @path name: string): ArmResponse<{}>; \
        }`
      );

      const ops = (resourceNamespaceNode.statements as Statement[]).filter(
        (s) => s.kind === SyntaxKind.OperationStatement
      );

      // Add all of the properties from the parsed namespace
      for (const op of ops) {
        target.operations.set(
          (op as OperationStatementNode).id.sv,
          checker.checkOperation(op as OperationStatementNode)
        );
      }

      // Add the @resource decorator
      resource(
        program,
        target,
        `/subscriptions/{subscriptionId}/resourceGroups/{resourceGroup}/providers/${resourceRoot}/{name}`
      );
    } else {
      throw new Error("TrackedResource property type must be a model");
    }
  } else {
    throw new Error("TrackedResource decorator can only be applied to namespaces");
  }
}

// -- ARM-specific decorators -----

// NOTE: This can be considered the entrypoint for marking a service definition as
// an ARM service so that we might enable ARM-specific Swagger emit behavior.

const armNamespaces = new Map<Type, string>();

export function armNamespace(program: Program, entity: Type, namespace: string) {
  if (entity.kind !== "Namespace") {
    throw new Error("The @armNamespace decorator can only be applied to namespaces.");
  }

  armNamespaces.set(entity, namespace);

  // ARM services need to have "application/json" set on produces/consumes
  produces(program, entity, "application/json");
  consumes(program, entity, "application/json");
}
