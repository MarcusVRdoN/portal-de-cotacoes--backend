/**
 * Checks if `value` is a valid array-like length.
 *
 * @param {*} value - The value to check.
 * @returns {boolean} Returns `true` if `value` is a valid length, else `false`.
 * @example
 *
 * isLength(3); // true
 * isLength(Number.MIN_VALUE); // false
 * isLength(Infinity); // false
 * isLength('3'); // false
 */
export const isLength = (value: any): boolean => {
  return typeof value === "number" && value > -1 && value % 1 == 0 && value <= Number.MAX_SAFE_INTEGER;
};

/**
 * Checks if `value` is array-like.
 *
 * A value is considered array-like if it's not a function and has a
 * `value.length` that's an integer greater than or equal to `0` and
 * less than or equal to `Number.MAX_SAFE_INTEGER`.
 *
 * @param {*} value - The value to check.
 * @returns {boolean} Returns `true` if `value` is array-like, else `false`.
 * @example
 *
 * isArrayLike([1, 2, 3]); // true
 * isArrayLike(document.body.children); // true
 * isArrayLike('abc'); // true
 * isArrayLike([]); // true
 * isArrayLike(null); // false
 * isArrayLike({ 'a': 1 }); // false
 * isArrayLike(() => {}); // false
 */
export const isArrayLike = (value: any): boolean => {
  return value != null && typeof value !== "function" && isLength(value.length);
};

/**
 * Checks if `value` is likely a prototype object.
 *
 * @param {unknown} value - The value to check.
 * @returns {boolean} Returns `true` if `value` is a prototype, else `false`.
 */
export const isPrototype = (value?: unknown) => {
  const constructor = value?.constructor;
  const proto = (typeof constructor === "function" && constructor.prototype) || Object.prototype;

  return value === proto;
};

/**
 * Checks if `value` is an empty object, collection, map, or set.
 *
 * Objects are considered empty if they have no own enumerable string keyed
 * properties.
 *
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is empty, else `false`.
 * @example
 *
 * isEmpty(); // true
 * isEmpty(null); // true
 * isEmpty(undefined); // true
 * isEmpty(""); // true
 * isEmpty({}); // true
 * isEmpty([]); // true
 * isEmpty(() => {}); // true
 * isEmpty([1, 2, 3]); // false
 * isEmpty({ 'a': 1 }); // false
 * isEmpty('abc'); // false
 * isEmpty(true); // false
 * isEmpty(false); // false
 * isEmpty(1); // false
 * isEmpty(0); // false
 * isEmpty(-1) // false
 * isEmpty(Infinity) // false
 * isEmpty(NaN) // false
 */
export const isEmpty = (value?: any): boolean => {
  if (value == null) {
    return true;
  }

  if (isArrayLike(value) && (Array.isArray(value) || typeof value === "string" || typeof value.splice === "function")) {
    return !value.length;
  }

  if (typeof value === "boolean" || typeof value === "number") {
    return false;
  }

  if (isPrototype(value)) {
    return !Object.keys(value).length;
  }

  for (const key in value) {
    if (Object.hasOwn(value, key)) {
      return false;
    }
  }

  return true;
};

/**
 * Checks if a given value is a string.
 *
 * @param {unknown} string - The value to be checked.
 * @return {boolean} Returns true if the value is a string, otherwise returns false.
 *
 * @example
 * isString('abc'); // true
 * isString(123); // false
 * isString({}); // false
 * isString([]); // false
 */
export const isString = (string: unknown): boolean => typeof string === "string";

/**
 * Checks if a given string is a valid JSON.
 *
 * @param {string} string - The string to be checked.
 * @return {boolean} Returns true if the string is a valid JSON, otherwise returns false.
 *
 * @example
 * isJSON('{ "key": "value" }'); // true
 * isJSON('{ key: "value" }'); // false
 * isJSON(''); // false
 * isJSON({}); // false
 * isJSON(null); // false
 */
export const isJSON = (string: string): boolean => {
  if (!isString(string)) return false;

  try {
    JSON.parse(string);
    return true;
  } catch (error) {
    return false;
  }
};