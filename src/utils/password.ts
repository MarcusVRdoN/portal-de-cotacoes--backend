import { createHash, timingSafeEqual } from "crypto";

/**
 * Hashes a given password using the SHA-256 algorithm.
 *
 * @param {string} password - The password to be hashed.
 * @return {string} The hashed password.
 *
 * @example
 * hashPassword('123456'); // 8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92
 */
export const hashPassword = (password: string): string => {
  return createHash("sha256").update(password).digest("hex");
};

/**
 * Verifies a given password against a hashed password using the SHA-256 algorithm.
 *
 * @param {string} password - The password to be verified.
 * @param {string} hashedPassword - The hashed password to be compared with.
 * @return {boolean} Returns true if the password is valid, otherwise returns false.
 *
 * @example
 * verifyPassword('123456', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92'); // true
 */
export const verifyPassword = (password: string, hashedPassword: string): boolean => {
  const hashedPasswordReceived = hashPassword(password);
  const hashedPasswordReceivedBuffer = Buffer.from(hashedPasswordReceived, "hex");
  const hashedPasswordBuffer = Buffer.from(hashedPassword, "hex");

  if (hashedPasswordBuffer.length !== hashedPasswordReceivedBuffer.length) {
    return false;
  }

  return timingSafeEqual(hashedPasswordBuffer, hashedPasswordReceivedBuffer);
};