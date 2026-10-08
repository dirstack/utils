export * from "./array/array.js"
export * from "./batch/batch.js"
export * from "./dom/dom.js"
export * from "./errors/errors.js"
export * from "./events/events.js"
export * from "./files/files.js"
export * from "./format/format.js"
export * from "./helpers/helpers.js"
export * from "./http/http.js"
export * from "./numbers/numbers.js"
export * from "./objects/objects.js"
export * from "./parsers/parsers.js"
export * from "./random/random.js"
export * from "./string/string.js"
export * from "./time/time.js"
export * from "./ui/ui.js"

export type WithOptional<Type, Key extends keyof Type> = Pick<Partial<Type>, Key> & Omit<Type, Key>
export type WithRequired<Type, Key extends keyof Type> = Type & { [Prop in Key]-?: Type[Prop] }

/**
 * The type at a dot-separated path inside `T`, such as `"user.address.city"`.
 */
export type DeepIndex<T, K extends string> = K extends ""
  ? T
  : K extends keyof T
    ? T[K]
    : K extends `${infer K0}.${infer KR}`
      ? K0 extends keyof T
        ? DeepIndex<T[K0], KR>
        : never
      : never

/**
 * @deprecated Use {@link DeepIndex} instead.
 */
export type DeepIdx<T, K extends string> = DeepIndex<T, K>

export type ValidatePath<T, K extends string> = K extends ""
  ? ""
  : K extends keyof T
    ? K
    : K extends `${infer K0}.${infer KR}`
      ? K0 extends keyof T
        ? `${K0}.${ValidatePath<T[K0], KR>}`
        : Extract<keyof T, string>
      : Extract<keyof T, string>

export type NestedPartial<T> = {
  [K in keyof T]?: T[K] extends object ? NestedPartial<T[K]> : T[K]
}

export type NestedRequired<T> = {
  [K in keyof T]-?: T[K] extends object ? NestedRequired<T[K]> : T[K]
}

export type ReplaceNullWithUndefined<T> = T extends null
  ? undefined
  : T extends Date
    ? T
    : {
        [K in keyof T]: T[K] extends (infer U)[]
          ? ReplaceNullWithUndefined<U>[]
          : ReplaceNullWithUndefined<T[K]>
      }
