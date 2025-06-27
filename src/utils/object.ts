import { isJSON, isString } from "@/utils/helpers";

export const serialize = (object: unknown): string => {
  return JSON.stringify(object, null, 2);
};

export const deserialize = <T = Record<string, unknown>>(object: unknown): T => {
  return (typeof object === "string" && object.trim() ? JSON.parse(object) : object) as T;
};

/**
 * Parses an object and returns a new object with a specified key and value.
 *
 * @param {unknown} object - The object to parse.
 * @param {string} key - The key to add to the new object.
 * @return {Record<string, unknown>} - The new object with the specified key and value.
 *
 * @example
 * parseObjectKey({ key: "value" }, "key2"); // { key: "value" }
 * parseObjectKey("Lorem ipsum dolor sit amet", "key"); // { key: "Lorem ipsum dolor sit amet" }
 * parseObjectKey({ key1: "value1", key2: "value2" }, "key3"); // { key1: "value1", key2: "value2" }
 */
export const parseObjectKey = (object: unknown, key: string) => {
  if (isString(object)) {
    return isJSON(object as string) ? deserialize(object) : { [key]: object };
  }

  return deserialize(object);
};