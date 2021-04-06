import { Program, Type, throwDiagnostic } from "@azure-tools/adl";
import { useRef } from "@azure-tools/adl-openapi";

export function getArmTypesPath(program: Program): string | undefined {
  return (
    program.getOption("arm-types-path") ||
    "../../../../../common-types/resource-management/v2/types.json"
  );
}

export function armCommonDefinition(program: Program, entity: Type, definitionName?: string): void {
  if (entity.kind !== "Model") {
    throwDiagnostic("The @armCommonDefinition decorator can only be applied to models.", entity);
  }

  // Use the name of the model type if not specified
  if (!definitionName) {
    definitionName = entity.name;
  }

  useRef(program, entity, `${getArmTypesPath(program)}#/definitions/${definitionName}`);
}

export function armCommonParameter(program: Program, entity: Type, parameterName?: string): void {
  if (entity.kind !== "ModelProperty") {
    throwDiagnostic(
      "The @armCommonParameter decorator can only be applied to model properties and operation parameters.",
      entity
    );
  }

  // Use the name of the model type if not specified
  if (!parameterName) {
    parameterName = entity.name;
  }

  useRef(program, entity, `${getArmTypesPath(program)}#/parameters/${parameterName}`);
}
