export * from "./array/array.js"
export * from "./batch/batch.js"
export * from "./errors/errors.js"
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
