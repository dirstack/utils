export * from "./colors/colors"
export * from "./dom/dom"
export * from "./errors/errors"
export * from "./events/events"
export * from "./format/format"
export * from "./helpers/helpers"
export * from "./http/http"
export * from "./numbers/numbers"
export * from "./objects/objects"
export * from "./params/params"
export * from "./parsers/parsers"
export * from "./random/random"
export * from "./string/string"
export * from "./time/time"

export type WithOptional<Type, Key extends keyof Type> = Pick<Partial<Type>, Key> & Omit<Type, Key>
export type WithRequired<Type, Key extends keyof Type> = Type & { [Prop in Key]-?: Type[Prop] }

export type DeepIdx<T, K extends string> = K extends ""
  ? T
  : K extends keyof T
    ? T[K]
    : K extends `${infer K0}.${infer KR}`
      ? K0 extends keyof T
        ? DeepIdx<T[K0], KR>
        : never
      : never

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
