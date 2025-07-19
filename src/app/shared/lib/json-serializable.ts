/**
 * Interface to allow implementations to serialize from JSON.
 */
export interface IJSONSerializable {
  toJSON(): unknown;
}
