import I18n from "i18n-js"

import { LANG_ES_MAIN, TranslationKey } from "@galoymoney/client"

I18n.fallbacks = true
I18n.translations = { es: LANG_ES_MAIN }

export type GaloyTranslate = (
  scope: keyof typeof LANG_ES_MAIN,
  options?: I18n.TranslateOptions | undefined,
) => string

export const translate: GaloyTranslate = (scope, options) => {
  const translation = I18n.t(scope, { defaultValue: scope, ...options })
  return translation
}

export type GaloyTranslateUnknown = (
  scope: string,
  options?: I18n.TranslateOptions | undefined,
) => string

export const translateUnknown: GaloyTranslateUnknown = (scope, options) => {
  const translation = I18n.t(scope, { defaultValue: scope, ...options })
  return translation
}

export const setLocale = (language: string | undefined): void => {
  if (language && language !== "DEFAULT" && I18n.locale !== language) {
    I18n.locale = language
  }
}

export const getLocale = (): string => {
  return I18n.locale
}

export { toNumber as toLocaleNumber } from "i18n-js"

export { TranslationKey }
