import { NamespaceType, Program, Type } from "@azure-tools/adl";
import { resource } from "@azure-tools/adl-rest";
import { ArmResourceInfo, getArmResourceInfo, ParameterInfo } from "./resource.js";

type StandardOperationGenerator = (program: Program, target: Type, documentation?: string) => void;

const standardOperationFunctions: { [key: string]: StandardOperationGenerator } = {
  read: armStandardRead,
  create: armStandardCreate,
  update: armStandardUpdate,
  delete: armStandardDelete,
  list: armStandardList,
};

const resourceOperationNamespaces = new Map<NamespaceType, Type>();

export function armResourceOperations(program: Program, target: Type, resourceType: Type): void {
  if (target.kind !== "Namespace") {
    program.reportDiagnostic(
      `The @armResourceOperations decorator can only be applied to namespaces.`,
      target
    );
    return;
  }

  // Verify that this is a registered resource
  const armResourceInfo = getArmResourceInfo(program, resourceType);
  if (!armResourceInfo) {
    return;
  }

  if (!armResourceInfo.resourcePath) {
    program.reportDiagnostic(
      `The @armResourceOperations decorator can only be used for resource types that have an @armResourcePath configured.`,
      target
    );
    return;
  }

  // Set the resource path
  resource(program, target, armResourceInfo.resourcePath.path);

  // Remember this namespace
  resourceOperationNamespaces.set(target, resourceType);
}

export function armResourceParams(program: Program, operation: Type): void {
  if (operation.kind !== "Operation") {
    program.reportDiagnostic(
      `The @armOperation decorator can only be applied to operations.`,
      operation
    );
    return;
  }

  if (!operation.namespace) {
    program.reportDiagnostic(
      `The @armOperation decorator can only be applied to an operation that is defined inside of a namespace.`,
      operation
    );
    return;
  }

  const resourceType = resourceOperationNamespaces.get(operation.namespace);
  if (!resourceType) {
    program.reportDiagnostic(
      `The @armOperation decorator can only be applied to an operation that is defined inside of a namespace marked with @armResourceOperations.`,
      operation
    );
    return;
  }

  // TODO: Automatically add base parameters
}

const apiVersionParameter: ParameterInfo = {
  name: "apiVersion",
  typeName: "ApiVersionParameter",
};

function getOperationPathArguments(pathParameters: ParameterInfo[]): string {
  return [apiVersionParameter, ...pathParameters].map((param) => `...${param.typeName}`).join(", ");
}

function prepareOperationInfo(
  program: Program,
  decoratorName: string,
  resourceType: Type,
  operationGroup?: string
) {
  const armResourceInfo = getArmResourceInfo(program, resourceType);
  if (!armResourceInfo) {
    return;
  }
  if (!armResourceInfo.resourcePath) {
    program.reportDiagnostic(
      `The @${decoratorName} decorator can only be applied to a resource type with a resource path.`,
      resourceType
    );
    return;
  }

  const nameParamList = armResourceInfo.resourceNameParam
    ? [armResourceInfo.resourceNameParam]
    : [];

  const operationParams = [...armResourceInfo.resourcePath.parameters, ...nameParamList];

  operationGroup = operationGroup ?? armResourceInfo.collectionName;

  return {
    armResourceInfo,
    operationParams,
    namespace: `${armResourceInfo.parentNamespace}.${operationGroup}`,
  };
}

function evalInNamespace(program: Program, namespace: string, adlScript: string): void {
  program.evalAdlScript(`
    namespace ${namespace} {
      ${adlScript}
    }
  `);
}

export function armStandardRead(program: Program, target: Type, documentation?: string): void {
  const info = prepareOperationInfo(program, "armStandardRead", target);

  if (!info) {
    return;
  }

  const { armResourceInfo, operationParams, namespace } = info;
  if (!documentation) {
    documentation = `Get a ${armResourceInfo.resourceModelName}`;
  }

  evalInNamespace(
    program,
    namespace,
    `@doc("${documentation}")
     @get op Get(${getOperationPathArguments(operationParams)}): ArmResponse<${
      armResourceInfo.resourceModelName
    }> | ErrorResponse;`
  );
}

export function armStandardCreate(program: Program, target: Type, documentation?: string): void {
  const info = prepareOperationInfo(program, "armStandardCreate", target);

  if (!info) {
    return;
  }

  const { armResourceInfo, operationParams, namespace } = info;
  if (!documentation) {
    documentation = `Create a ${armResourceInfo.resourceModelName}`;
  }

  evalInNamespace(
    program,
    namespace,
    `@doc("${documentation}")
     @put op CreateOrUpdate(${getOperationPathArguments(operationParams)}, @body resource: ${
      armResourceInfo.resourceModelName
    }): ArmResponse<${armResourceInfo.resourceModelName}> | ErrorResponse;`
  );
}

export function armStandardUpdate(program: Program, target: Type, documentation?: string): void {
  const info = prepareOperationInfo(program, "armStandardUpdate", target);

  if (!info) {
    return;
  }

  const { armResourceInfo, operationParams, namespace } = info;
  if (!documentation) {
    documentation = `Update a ${armResourceInfo.resourceModelName}`;
  }

  // Generate a special "Update" model type using the resource's properties type
  let updateModelName = `${armResourceInfo.resourceModelName}`;
  if (armResourceInfo.propertiesType) {
    // If the properties type has a name generate a property that uses a copy of
    // that type with all properties made optional.  If it has no name, we have no
    // way to reference it so this approach won't work in that case.
    const propertiesString =
      armResourceInfo.propertiesType.name !== ""
        ? `properties?: { ...OptionalProperties<${armResourceInfo.propertiesType.name}> };`
        : "";

    // Only TrackedResources have a tags property
    const tagsString = armResourceInfo.resourceKind === "Tracked" ? "...ArmTagsProperty;" : "";

    updateModelName = `${armResourceInfo.resourceModelName}Update`;
    evalInNamespace(
      program,
      armResourceInfo.parentNamespace,
      `model ${updateModelName} {
         ${tagsString}
         ${propertiesString}
       }`
    );
  }

  evalInNamespace(
    program,
    namespace,
    `@doc("${documentation}")
     @patch op Update(${getOperationPathArguments(
       operationParams
     )}, @body resource: ${updateModelName}): ArmResponse<${
      armResourceInfo.resourceModelName
    }> | ErrorResponse;`
  );
}

export function armStandardDelete(program: Program, target: Type, documentation?: string): void {
  const info = prepareOperationInfo(program, "armStandardDelete", target);

  if (!info) {
    return;
  }

  const { armResourceInfo, operationParams, namespace } = info;
  if (!documentation) {
    documentation = `Delete a ${armResourceInfo.resourceModelName}`;
  }

  evalInNamespace(
    program,
    namespace,
    `@doc("${documentation}")
     @_delete op Delete(${getOperationPathArguments(
       operationParams
     )}): ArmDeletedResponse | ArmDeleteAcceptedResponse | ArmDeletedNoContentResponse | ErrorResponse;`
  );
}

export function armStandardList(program: Program, target: Type, documentation?: string): void {
  const info = prepareOperationInfo(program, "armStandardList", target);

  if (!info) {
    return;
  }

  const { armResourceInfo, operationParams, namespace } = info;
  if (armResourceInfo.resourceKind === "Tracked") {
    armListByInternal(
      program,
      target,
      armResourceInfo,
      "SubscriptionIdParameter",
      "ListBySubscription",
      `List ${armResourceInfo.resourceModelName} resources by subscription ID`
    );

    armListByInternal(
      program,
      target,
      armResourceInfo,
      "ResourceGroupNameParameter",
      "ListByResourceGroup",
      `List ${armResourceInfo.resourceModelName} resources by resource group`
    );
  }
}

export function _generateStandardOperations(
  program: Program,
  resourceType: Type,
  standardOperations: string[]
) {
  for (const op of standardOperations) {
    const generator = standardOperationFunctions[op];
    if (generator) {
      generator(program, resourceType);
    } else {
      program.reportDiagnostic(`The standard operation type '${op}' is unknown.`, resourceType);
    }
  }
}

function armListByInternal(
  program: Program,
  target: Type,
  armResourceInfo: ArmResourceInfo,
  paramTypeName: string,
  operationName: string,
  documentation?: string
) {
  const resourcePath = armResourceInfo.resourcePath;
  if (!resourcePath) {
    program.reportDiagnostic(
      "List operations can only be created for a resource type with a resource path.",
      target
    );
    return;
  }

  // There are two cases here:
  // 1. Parameter comes before the resource type in the path
  // 2. Parameter is the parameter type for this resource
  //
  // In the second case, we interpret this as "list all resources of this type
  // for the provider"

  let pathParams = resourcePath.parameters;
  const paramInfo =
    armResourceInfo.resourceNameParam &&
    armResourceInfo.resourceNameParam.typeName === paramTypeName
      ? armResourceInfo.resourceNameParam
      : pathParams.find((p) => p.typeName === paramTypeName);

  if (!paramInfo) {
    program.reportDiagnostic("Parameter type not a part of the resource", target);
    return;
  }

  let basePath = "";
  const pathParts = resourcePath.path.split("/");

  if (paramInfo !== armResourceInfo.resourceNameParam) {
    if (!documentation) {
      documentation = `List all ${armResourceInfo.resourceModelName} by ${paramInfo.name}`;
    }

    // Remove the later parameters
    const paramIndex = pathParams.findIndex((p) => p.typeName === paramTypeName) + 1;
    pathParams = pathParams.slice(0, paramIndex);

    // Generate the base path
    const pathParam = `{${paramInfo.name}}`;
    basePath = resourcePath.path.substring(
      0,
      resourcePath.path.indexOf(pathParam) + pathParam.length
    );
  } else {
    pathParams = [];
    documentation = `List all ${armResourceInfo.resourceModelName} resources for the ${armResourceInfo.armNamespace} provider`;
  }

  // Insert the provider name again?
  if (basePath.indexOf(armResourceInfo.armNamespace) < 0) {
    basePath = `${basePath}/providers/${armResourceInfo.armNamespace}`;
  }

  const finalPath = basePath + "/" + pathParts[pathParts.length - 1];
  program.evalAdlScript(`
    namespace ${armResourceInfo.parentNamespace} {
      @tag("${armResourceInfo.collectionName}")
      @resource("${finalPath}")
      namespace ${armResourceInfo.collectionName}${operationName} {
        @doc("${documentation}")
        @operationId("${armResourceInfo.collectionName}_${operationName}")
        @list @get op ${operationName}(${getOperationPathArguments(pathParams)}): ArmResponse<${
    armResourceInfo.resourceListModelName
  }> | ErrorResponse;
      }
    }`);
}

export function armListBy(
  program: Program,
  target: Type,
  paramType: Type,
  operationName: string,
  documentation?: string
): void {
  const armResourceInfo = getArmResourceInfo(program, target);
  if (!armResourceInfo) {
    return;
  }
  if (!armResourceInfo.resourcePath) {
    program.reportDiagnostic(
      "The @armListBy decorator can only be applied to a resource type with a resource path.",
      target
    );
    return;
  }

  if (paramType.kind !== "Model") {
    program.reportDiagnostic("Parameter type is not a model", target);
    return;
  }

  armListByInternal(program, target, armResourceInfo, paramType.name, operationName, documentation);
}
