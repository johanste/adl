import { serviceTitle, serviceVersion, resource as restresource, getPathParamName } from "@azure-tools/adl-rest";

import { ModelPropertyNode, ModelType, ModelTypeProperty, NamespaceType, BaseType, NoTarget, Program, Type, createProgram } from "@azure-tools/adl";
import { assert } from "console";

// export type CreatePatternType = "PUT" | "POST";

interface AzureServiceConventionParameters {
  version?: string;
  createPattern?: string;
}

interface AzureServiceConvention {
  injectCreateMethod(program: Program, qualname: string, pathParams: string, itemPathParams: string): string;
}

export function doesItWork(program: Program, entity: Type, params: any) {
  program.reportDiagnostic(params, NoTarget);
}

function configureServiceConventions(program: Program, conventions: AzureServiceConventionParameters): AzureServiceConvention {
  let cp;
  switch (conventions.createPattern) {
    case "PUT":
      cp = (program: Program, qualname: string, pathParams: string, itemPathParams: string): string => {
        return `@put("/{name}") op Create(${itemPathParams}, body: ${qualname}): ${qualname};\n`;
      }
      break;
    case "POST": {
      cp = (program: Program, qualname: string, pathParams: string, itemPathParams: string): string => {
        if (pathParams) {
          pathParams += ", ";
        }
        return `@post op Create(${pathParams}body: ${qualname}): CreatedResponse;\n`;
      }
      break;
    }
    default: {
      program.reportDiagnostic("Why did we get a broken create pattern?", NoTarget);
      program.reportDiagnostic(conventions.createPattern || "Unknonwn", NoTarget);
      cp = (program: Program, qualname: string, pathParams: string, itemPathParams: string): string => {
        return `@post("/{name}") op Create(${pathParams}, body: ${qualname}): PostCreateResponse;\n`;
      }
    }
  }
  return {
    injectCreateMethod: cp
  }
}



let configuredServiceConventions: AzureServiceConvention | null = null;

export function azureService(program: Program, entity: Type, title: string, version: string, createPattern: string) {
  serviceTitle(program, entity, title);
  serviceVersion(program, entity, version);
  serviceConventions(program, entity, { createPattern: createPattern })
}

function qualifyModelName(entity: ModelType) {
  let qualifiedName: string = entity.name
  let ns = entity.namespace;
  while (ns) {
    if (ns.name) {
      qualifiedName = `${ns.name}.${qualifiedName}`
    }
    ns = ns.namespace
  }
  return qualifiedName;
}

function extractPathParameters(path: string) {
  let re = /{(.*?)}/g;
  let pathParamList: string = ""

  let m;
  do {
    m = re.exec(path);
    if (m) {
      if (pathParamList) {
        pathParamList += ", "
      }
      pathParamList += `@path ${m[1]}: string`
    }
  } while (m);
  return pathParamList;
}

interface AzureResourceParameters {
  lifetime?: string;
}

function serviceConventions(program: Program, entity: Type, conventions: AzureServiceConventionParameters) {
  if (configuredServiceConventions) {
    program.reportDiagnostic("@serviceConventions applied multiple times", entity)
  }
  configuredServiceConventions = configureServiceConventions(program, conventions)
}

export function azureResource(program: Program, entity: Type, basePath = "", parameters: AzureResourceParameters = {}) {
  if (configuredServiceConventions == null) {
    return;
  }
  let lifetime = parameters.lifetime || "crudl";

  if (entity.kind == "Model") {
    let qualname: string = qualifyModelName(entity);
    let collectionPathParams = extractPathParameters(basePath);
    let operations: string = ""
    let itemPathParams = extractPathParameters(basePath + "/{name}")
    if (lifetime.includes("c")) {
      operations += configuredServiceConventions.injectCreateMethod(program, qualname, collectionPathParams, itemPathParams);
    }
    if (lifetime.includes("r")) {
      operations += `@put("/{name}") op Get(${itemPathParams}, body: ${qualname}): ${qualname};\n`
    }
    if (lifetime.includes("u")) {
      operations += `@patch("/{name}") op Update(${itemPathParams}, body: ${qualname}): ${qualname};\n`
    }
    if (lifetime.includes("d")) {
      operations += `@_delete("/{name}") op Delete(${itemPathParams}): NoContentResponse;\n`
    }
    if (lifetime.includes("l")) {
      operations += `@get op List(${collectionPathParams}): Paged<${qualname}>;\n`
    }
    let adlScript = `
        @resource("${basePath}")
        namespace ${entity.name} {
            ${operations}
        }`
    program.evalAdlScript(adlScript);
  }
  else {
    program.reportDiagnostic(`Why oh why did you try to make a ${entity.kind} an @azureResource? Only models can be azureResources!`, entity)
  }
}
/*
export function getResources(program: Program) {
  return Array.from(program.stateMap(basePathsKey).keys());
}

export function isResource(program: Program, obj: Type) {
  return program.stateMap(basePathsKey).has(obj);
}

export function basePathForResource(program: Program, resource: Type) {
  return program.stateMap(basePathsKey).get(resource);
}

const headerFieldsKey = Symbol();
export function header(program: Program, entity: Type, headerName: string) {
  if (!headerName && entity.kind === "ModelProperty") {
    headerName = entity.name.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
  }
  program.stateMap(headerFieldsKey).set(entity, headerName);
}

export function getHeaderFieldName(program: Program, entity: Type) {
  return program.stateMap(headerFieldsKey).get(entity);
}

const queryFieldsKey = Symbol();
export function query(program: Program, entity: Type, queryKey: string) {
  if (!queryKey && entity.kind === "ModelProperty") {
    queryKey = entity.name;
  }
  program.stateMap(queryFieldsKey).set(entity, queryKey);
}

export function getQueryParamName(program: Program, entity: Type) {
  return program.stateMap(queryFieldsKey).get(entity);
}

const pathFieldsKey = Symbol();
export function path(program: Program, entity: Type, paramName: string) {
  if (!paramName && entity.kind === "ModelProperty") {
    paramName = entity.name;
  }
  program.stateMap(pathFieldsKey).set(entity, paramName);
}

export function getPathParamName(program: Program, entity: Type) {
  return program.stateMap(pathFieldsKey).get(entity);
}

const bodyFieldsKey = Symbol();
export function body(program: Program, entity: Type) {
  program.stateSet(bodyFieldsKey).add(entity);
}

export function isBody(program: Program, entity: Type) {
  return program.stateSet(bodyFieldsKey).has(entity);
}

export type HttpVerb = "get" | "put" | "post" | "patch" | "delete";

interface OperationRoute {
  verb: HttpVerb;
  subPath?: string;
}

const operationRoutesKey = Symbol();

function setOperationRoute(program: Program, entity: Type, verb: OperationRoute) {
  if (entity.kind === "Operation") {
    if (!program.stateMap(operationRoutesKey).has(entity)) {
      program.stateMap(operationRoutesKey).set(entity, verb);
    } else {
      program.reportDiagnostic(`HTTP verb already applied to ${entity.name}`, entity);
    }
  } else {
    program.reportDiagnostic(`Cannot use @${verb} on a ${entity.kind}`, entity);
  }
}

export function getOperationRoute(program: Program, entity: Type): OperationRoute | undefined {
  return program.stateMap(operationRoutesKey).get(entity);
}

export function get(program: Program, entity: Type, subPath?: string) {
  setOperationRoute(program, entity, {
    verb: "get",
    subPath,
  });
}

export function put(program: Program, entity: Type, subPath?: string) {
  setOperationRoute(program, entity, {
    verb: "put",
    subPath,
  });
}

export function post(program: Program, entity: Type, subPath?: string) {
  setOperationRoute(program, entity, {
    verb: "post",
    subPath,
  });
}

export function patch(program: Program, entity: Type, subPath?: string) {
  setOperationRoute(program, entity, {
    verb: "patch",
    subPath,
  });
}

// BUG #243: How do we deal with reserved words?
export function _delete(program: Program, entity: Type, subPath?: string) {
  setOperationRoute(program, entity, {
    verb: "delete",
    subPath,
  });
}

// -- Service-level Metadata

interface ServiceDetails {
  namespace?: NamespaceType;
  title?: string;
  version?: string;
}
const programServiceDetails = new WeakMap<Program, ServiceDetails>();
function getServiceDetails(program: Program) {
  let serviceDetails = programServiceDetails.get(program);
  if (!serviceDetails) {
    serviceDetails = {};
    programServiceDetails.set(program, serviceDetails);
  }

  return serviceDetails;
}

export function _setServiceNamespace(program: Program, namespace: NamespaceType): void {
  const serviceDetails = getServiceDetails(program);
  if (serviceDetails.namespace && serviceDetails.namespace !== namespace) {
    program.reportDiagnostic(
      "Cannot set service namespace more than once in an ADL project.",
      namespace
    );
  }

  serviceDetails.namespace = namespace;
}

export function _checkIfServiceNamespace(program: Program, namespace: NamespaceType): boolean {
  const serviceDetails = getServiceDetails(program);
  return serviceDetails.namespace === namespace;
}

export function serviceTitle(program: Program, entity: Type, title: string) {
  const serviceDetails = getServiceDetails(program);
  if (serviceDetails.title) {
    program.reportDiagnostic("Service title can only be set once per ADL document.", entity);
  }

  if (entity.kind !== "Namespace") {
    program.reportDiagnostic(
      "The @serviceTitle decorator can only be applied to namespaces.",
      entity
    );
    return;
  }

  _setServiceNamespace(program, entity);
  serviceDetails.title = title;
}

export function getServiceTitle(program: Program): string {
  const serviceDetails = getServiceDetails(program);
  return serviceDetails.title || "(title)";
}

export function serviceVersion(program: Program, entity: Type, version: string) {
  const serviceDetails = getServiceDetails(program);
  // TODO: This will need to change once we support multiple service versions
  if (serviceDetails.version) {
    program.reportDiagnostic("Service version can only be set once per ADL document.", entity);
  }

  if (entity.kind !== "Namespace") {
    program.reportDiagnostic(
      "The @serviceVersion decorator can only be applied to namespaces.",
      entity
    );
    return;
  }

  _setServiceNamespace(program, entity);
  serviceDetails.version = version;
}

export function getServiceVersion(program: Program): string {
  const serviceDetails = getServiceDetails(program);
  return serviceDetails.version || "0000-00-00";
}

export function getServiceNamespaceString(program: Program): string | undefined {
  const serviceDetails = getServiceDetails(program);
  return (
    (serviceDetails.namespace && program.checker!.getNamespaceString(serviceDetails.namespace)) ||
    undefined
  );
}

const producesTypesKey = Symbol();

export function produces(program: Program, entity: Type, ...contentTypes: string[]) {
  if (entity.kind !== "Namespace") {
    program.reportDiagnostic("The @produces decorator can only be applied to namespaces.", entity);
  }

  const values = getProduces(program, entity);
  program.stateMap(producesTypesKey).set(entity, values.concat(contentTypes));
}

export function getProduces(program: Program, entity: Type): string[] {
  return program.stateMap(producesTypesKey).get(entity) || [];
}

const consumesTypesKey = Symbol();

export function consumes(program: Program, entity: Type, ...contentTypes: string[]) {
  if (entity.kind !== "Namespace") {
    program.reportDiagnostic("The @consumes decorator can only be applied to namespaces.", entity);
  }

  const values = getConsumes(program, entity);
  program.stateMap(consumesTypesKey).set(entity, values.concat(contentTypes));
}

export function getConsumes(program: Program, entity: Type): string[] {
  return program.stateMap(consumesTypesKey).get(entity) || [];
}
*/
