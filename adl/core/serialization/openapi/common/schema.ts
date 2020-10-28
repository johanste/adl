import { IntegerFormat, NumberFormat, v2, v3, XMSEnumValue } from '@azure-tools/openapi';
import { anonymous, nameOf } from '@azure-tools/sourcemap';
import { createTypeAlias } from '../../../model/schema/alias';
import { addDefault } from '../../../model/schema/default';
import { addEncoding, EncodingReference } from '../../../model/schema/encoding';
import { createEnum, EnumValue } from '../../../model/schema/enum';
import { SchemaTypeReference, TypeReference } from '../../../model/schema/type';
import { Context, OAIModel } from '../../../support/visitor';


export const arrayProperties = <Array<keyof v2.Schema&v3.Schema>>['maxItems', 'minItems', 'uniqueItems'];
export const numberProperties = <Array<keyof v2.Schema & v3.Schema>>['multipleOf', 'maximum', 'exclusiveMaximum', 'minimum', 'exclusiveMinimum',];
export const stringProperties = <Array<keyof v2.Schema & v3.Schema>>['maxLength', 'minLength', 'pattern',];
export const objectProperties = <Array<keyof v2.Schema & v3.Schema>>['properties', 'discriminator', 'additionalProperties', 'minProperties', 'maxProperties'];
export const notPrimitiveProperties = <Array<keyof v2.Schema & v3.Schema>>[...stringProperties, ...objectProperties, ...arrayProperties, ...numberProperties];
export const notObject = [...arrayProperties, ...numberProperties, ...stringProperties];

/** Schema processing options */
export type Options = Partial<{
  /** this is an inline-declared anonymous schema; the name is not intended to be used as the final name */
  isAnonymous: boolean;

  /** processes the schema just as the target type, and not oneOf/allOf/anyOf/object/enum */
  justTargetType: boolean;

  /** note that this is a property declaration while processing this schema */
  isProperty: boolean;

  /** note that this is a parameter declaration while processing this schema */
  isParameter: boolean;
}>;

export function commonProperties(schema: v3.Schema|v2.Schema) {
  return {
    description: schema.description,
    summary: schema.title,
    clientName: (<any>schema)['x-ms-client-name'],

    // todo: I'm not fond of having this in schema -- we should strongly consider refactoring this so the consumer gets it (ie, the property)
    nullable: (<any>schema).nullable || schema['x-nullable'],
    readOnly: (<any>schema).readOnly,
  };
}

export function versionInfo<T extends OAIModel>($: Context<T>, versionedElement: any) {
  return {
    since: $.apiVersion,
    deprecated: versionedElement.deprecated ? $.apiVersion : undefined,
  };
}

export async function processCharSchema<T extends OAIModel>(schema: v3.Schema | v2.Schema, $: Context<T>): Promise<SchemaTypeReference> {
  $.assertNoForbiddenProperties(schema, ...<any>notPrimitiveProperties);

  return wrapWithAliasIfNeeded(schema, $.api.primitives.char, $);
}


export async function processDateSchema<T extends OAIModel>(schema: v3.Schema|v2.Schema, $: Context<T>): Promise<SchemaTypeReference> {
  $.assertNoForbiddenProperties(schema, ...<any>notPrimitiveProperties);

  return wrapWithAliasIfNeeded(schema, $.api.primitives.date, $);
}

export async function processTimeSchema<T extends OAIModel>(schema: v3.Schema|v2.Schema, $: Context<T>): Promise<SchemaTypeReference> {
  $.assertNoForbiddenProperties(schema, ...<any>notPrimitiveProperties);

  return wrapWithAliasIfNeeded(schema, $.api.primitives.time, $);
}

export async function processDateTimeSchema<T extends OAIModel>(schema: v3.Schema|v2.Schema, $: Context<T>, encoding?: EncodingReference): Promise<SchemaTypeReference> {
  $.assertNoForbiddenProperties(schema, ...<any>notPrimitiveProperties);

  return wrapWithAliasIfNeeded(schema, $.api.primitives.datetime, $, encoding);
}

export async function processDurationSchema<T extends OAIModel>(schema: v3.Schema|v2.Schema, $: Context<T>): Promise<SchemaTypeReference> {
  $.assertNoForbiddenProperties(schema, ...<any>notPrimitiveProperties);

  return wrapWithAliasIfNeeded(schema, $.api.primitives.duration, $);
}

export async function processUuidSchema<T extends OAIModel>(schema: v3.Schema|v2.Schema, $: Context<T>): Promise<SchemaTypeReference> {
  $.assertNoForbiddenProperties(schema, ...<any>notPrimitiveProperties);

  return wrapWithAliasIfNeeded(schema, $.api.primitives.uuid, $);
}

export async function processUriSchema<T extends OAIModel>(schema: v3.Schema|v2.Schema, $: Context<T>): Promise<SchemaTypeReference> {
  $.assertNoForbiddenProperties(schema, ...<any>notPrimitiveProperties);

  return wrapWithAliasIfNeeded(schema, $.api.primitives.uri, $);
}

export async function processPasswordSchema<T extends OAIModel>(schema: v3.Schema|v2.Schema, $: Context<T>): Promise<SchemaTypeReference> {
  $.assertNoForbiddenProperties(schema, ...<any>notPrimitiveProperties);

  return wrapWithAliasIfNeeded(schema, $.api.primitives.password, $);
}

export async function processOdataSchema<T extends OAIModel>(schema: v3.Schema|v2.Schema, $: Context<T>): Promise<SchemaTypeReference> {
  $.assertNoForbiddenProperties(schema, ...<any>notPrimitiveProperties);

  return wrapWithAliasIfNeeded(schema, $.api.primitives.odata, $);
}

export async function processBooleanSchema<T extends OAIModel>(schema: v3.Schema | v2.Schema, $: Context<T>, options?: Options): Promise<SchemaTypeReference> {
  $.assertNoForbiddenProperties(schema, ...<any>notPrimitiveProperties);

  return wrapWithAliasIfNeeded(schema, $.api.primitives.boolean, $);
}

export async function processByteArraySchema<T extends OAIModel>(schema: v3.Schema | v2.Schema, $: Context<T>): Promise<SchemaTypeReference> {
  // throws on error.
  $.assertNoForbiddenProperties(schema, ...<any>stringProperties, ...<any>objectProperties, ...<any>numberProperties);

  return $.api.primitives.byteArray;
}

export function wrapWithAliasIfNeeded<T extends OAIModel>(schema: v3.Schema | v2.Schema, type: SchemaTypeReference, $: Context<T>, encoding?: EncodingReference) {
  if (schema.default || schema.description || schema.title || (<any>schema).nullable || schema['x-nullable'] || (<any>schema).readOnly || encoding) {
    let alias = createTypeAlias($.api, anonymous(nameOf(schema)), type, commonProperties(schema));

    if (encoding) {
      alias = addEncoding(alias, encoding);
    }

    if (schema.default) {
      alias = addDefault(alias, schema.default);
    }

    if ((<any>schema).readOnly) {
      //todo?
    }

    if ((<any>schema).nullable || schema['x-nullable']) {
      //todo?
    }
    return alias;
  }
  return type;
}

export async function processNumberSchema<T extends OAIModel>(schema: v2.Schema|v3.Schema, $: Context<T>, options?: Options): Promise<SchemaTypeReference> {
  $.assertNoForbiddenProperties(schema, ...<any>stringProperties, ...<any>objectProperties, ...<any>arrayProperties);

  switch (schema.format) {
    case NumberFormat.Float:
      return $.api.primitives.float;

    case undefined:
    case NumberFormat.Double:
      return $.api.primitives.double;

    default:
      throw new Error(`Unexpected number format: ${schema.format}`);
  }
}


export async function processIntegerSchema<T extends OAIModel>(schema: v2.Schema | v3.Schema, $: Context<T>, options?: Options): Promise<SchemaTypeReference> {
  $.assertNoForbiddenProperties(schema, ...<any>stringProperties, ...<any>objectProperties, ...<any>arrayProperties);

  switch (schema.format) {
    case IntegerFormat.Int32:
      return $.api.primitives.int32;

    case undefined:
    case IntegerFormat.Int64:
      return $.api.primitives.int64;

    case IntegerFormat.UnixTime:
      return $.api.primitives.time;

    default:
      throw new Error(`Unexpected integer format: ${schema.format}`);
  }
}

export async function processFileSchema<T extends OAIModel>(schema: v3.Schema | v2.Schema, $: Context<T>, options?: Options): Promise<TypeReference> {
  return $.api.primitives.file;
}

export async function processAnySchema<T extends OAIModel>(schema: v3.Schema|v2.Schema, $: Context<T>): Promise<TypeReference> {
  return $.api.primitives.any;
}

export async function processEnumSchema<T extends OAIModel>(schema: v3.Schema | v2.Schema, $: Context<T>, options?: Options): Promise<SchemaTypeReference> {
  const schemaEnum = schema.enum || [];
  const xmsEnum = schema['x-ms-enum'] || {};
  const xmsValues: Array<XMSEnumValue> = xmsEnum.values || schemaEnum.map(value => ({ value }));
  const name = xmsEnum.name || (options?.isAnonymous ? anonymous('enum') : nameOf(schema));
  const extensible = xmsEnum.modelAsString;

  const values: Array<EnumValue> = xmsValues.map(value => ({
    value: value.value,
    name: value.name,
    summary: value.description,
  }));

  const result = createEnum($.api, name, values, {
    extensible,
    ...commonProperties(schema),
    ...versionInfo($, schema),
  });

  return result;
}