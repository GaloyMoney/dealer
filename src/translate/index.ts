import i18n from "i18n-js"

import * as en from "./en.json"
import * as es from "./es.json"

i18n.fallbacks = true
i18n.translations = { en, es }

export const translate = (
  scope: i18n.Scope,
  options?: i18n.TranslateOptions | undefined,
): string => {
  const translation = i18n.t(scope, { defaultValue: scope, ...options })
  return translation
}

export const setLocale = (langauge: string | undefined): void => {
  if (langauge && langauge !== "DEFAULT" && i18n.locale !== langauge) {
    i18n.locale = langauge
  }
}
