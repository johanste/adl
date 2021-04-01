import { Type, SyntaxKind, NamespaceType } from "../compiler/types.js";
import { Program } from "../compiler/program";
import { consumes, produces, resource, _setServiceNamespace } from "./rest.js";
import { throwDiagnostic } from "../compiler/diagnostics.js";
import { _addSecurityDefinition, _addSecurityRequirement } from "./openapi.js";

// TODO: We can't name this ArmTrackedResource because that name
//       is already taken.  Consider having decorators occupy a
//       different namespace than types.
export function TrackedResource(
  program: Program,
  target: Type,
  resourceSubPath: string,
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
    // Ensure that there is a parent namespace
    if (!target.namespace) {
      throwDiagnostic(
        `The @TrackedResource decorator cannot be used on a namespace that does not have a parent.
Consider adding a file-level namespace declaration.`,
        target
      );
    }

    // Locate the ARM namespace in the namespace hierarchy
    let armNamespace = getArmNamespace(target);
    if (!armNamespace) {
      throwDiagnostic(
        "The @armNamespace must be used to define the ARM namespace of the service.  This is best applied to the file-level namespace.",
        target
      );
    }

    // Get the fully-qualified parent namespace
    let parentNamespace = checker.getNamespaceString(target.namespace);

    if (propertyType.kind === "Model") {
      // We require the property type to follow a naming convention of being the
      // desired resource type name with "Properties" appended so that we can
      // easily determine the core resource type name.  The plural version of
      // the name should be entered by the user as the namespace upon which
      // `@TrackedResource` is applied.  This ensures that the user has given
      // us both the singular and plural versions of the resource type name
      // without any automatic pluralization on our side.
      if (!propertyType.name.endsWith("Properties")) {
        throwDiagnostic(
          `The property model type provided to @TrackedResource must end with the word "Properties".`,
          propertyType
        );
      }

      // Create the resource model type and evaluate it
      const resourceName = propertyType.name.substring(0, propertyType.name.indexOf("Properties"));
      const resourceRoot = `${armNamespace}/${resourceSubPath}`;
      const resourceModelName = `${resourceName}Resource`;
      const resourceListName = `${resourceModelName}ListResult`;
      const operationGroup = target.name;

      program.evalAdlScript(`
         namespace ${parentNamespace} {
           @extension("x-ms-azure-resource", true) \
           model ${resourceModelName} = ArmTrackedResource<${propertyTypeName}>;

           @doc "The response of a ${resourceModelName} list operation."
           model ${resourceListName} = Page<${resourceModelName}>;

           @tag "${operationGroup}"
           @resource("/subscriptions/{subscriptionId}/providers/${resourceRoot}")
           namespace ${target.name}ListBySubscription {
             @operationId "${operationGroup}_ListBySubscription"
             @list @get op listBySubscription(@path subscriptionId: string): ArmResponse<${resourceListName}> | ErrorResponse;
           }

           @tag "${operationGroup}"
           @resource("/subscriptions/{subscriptionId}/resourceGroups/{resourceGroup}/providers/${resourceRoot}")
           namespace ${target.name}List {
             @operationId "${operationGroup}_ListByResourceGroup"
             @list @get op listByResourceGroup(@path subscriptionId: string, @path resourceGroup: string): ArmResponse<${resourceListName}> | ErrorResponse;
           }

           namespace ${target.name} {
             @tag "${operationGroup}"
             @get op Get(@path subscriptionId: string, @path resourceGroup: string, @path name: string): ArmResponse<${resourceModelName}> | ErrorResponse;

             @tag "${operationGroup}"
             @put op CreateOrUpdate(@path subscriptionId: string, @path resourceGroup: string, @path name: string, @body resource: ${resourceModelName}): ArmResponse<${resourceModelName}> | ErrorResponse;

             @tag "${operationGroup}"
             @patch op Update(@path subscriptionId: string, @path resourceGroup: string, @path name: string, @body resource: ${resourceModelName}): ArmResponse<${resourceModelName}> | ErrorResponse;

             @tag "${operationGroup}"
             @_delete op Delete(@path subscriptionId: string, @path resourceGroup: string, @path name: string): ArmResponse<{}> | ErrorResponse;
           }
         }
      `);

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

export function armNamespace(program: Program, entity: Type, namespace?: string) {
  if (entity.kind !== "Namespace") {
    throw new Error("The @armNamespace decorator can only be applied to namespaces.");
  }

  // armNamespace will set the service namespace if it's not done already
  _setServiceNamespace(entity);

  // 'namespace' is optional, use the actual namespace string if omitted
  if (!namespace) {
    namespace = program.checker!.getNamespaceString(entity);
  }

  armNamespaces.set(entity, namespace);

  // ARM services need to have "application/json" set on produces/consumes
  produces(program, entity, "application/json");
  consumes(program, entity, "application/json");

  // Set default security definitions
  _addSecurityRequirement(entity, "azure_auth", ["user_impersonation"]);
  _addSecurityDefinition(entity, "azure_auth", {
    type: "oauth2",
    authorizationUrl: "https://login.microsoftonline.com/common/oauth2/authorize",
    flow: "implicit",
    description: "Azure Active Directory OAuth2 Flow.",
    scopes: {
      user_impersonation: "impersonate your user account",
    },
  });
}

export function getArmNamespace(namespace: NamespaceType): string | undefined {
  let currentNamespace: NamespaceType | undefined = namespace;
  let armNamespace: string | undefined;
  while (currentNamespace) {
    armNamespace = armNamespaces.get(currentNamespace);
    if (armNamespace) {
      return armNamespace;
    }

    currentNamespace = currentNamespace.namespace;
  }

  return undefined;
}
