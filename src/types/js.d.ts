// eslint-disable-next-line @typescript-eslint/no-unused-vars
declare interface ReadonlyArray<T> {
  includes<S, R extends `${Extract<S, string>}`>(
    this: ReadonlyArray<R>,
    searchElement: S,
    fromIndex?: number,
  ): searchElement is R & S
}
