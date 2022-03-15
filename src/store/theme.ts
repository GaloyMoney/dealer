import storage from "./local-storage"

export const colorThemeLabels = {
  DEFAULT: "Default (OS)",
  dark: "Dark mode",
  light: "Light mode",
} as const

export type ColorTheme = keyof typeof colorThemeLabels

type StorageColorTheme = "dark" | "light"

export const setColorThemeClass = (colorTheme: StorageColorTheme) => {
  document.body.classList.remove("dark", "light")
  document.body.classList.add(colorTheme)
}

export const setDefaultColorTheme = () => {
  const darkModeMediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
  const colorTheme = darkModeMediaQuery.matches ? "dark" : "light"
  setColorThemeClass(colorTheme)
  darkModeMediaQuery.onchange = (event) => {
    setColorThemeClass(event.matches ? "dark" : "light")
  }
}

export const setColorThemeFromStorage = () => {
  const colorThemeInStorage = storage.get("colorTheme")
  const colorTheme =
    colorThemeInStorage && ["dark", "light"].includes(colorThemeInStorage)
      ? (colorThemeInStorage as StorageColorTheme)
      : undefined

  return colorTheme ? setColorThemeClass(colorTheme) : setDefaultColorTheme()
}

export const setColorTheme = (colorTheme: ColorTheme) => {
  if (colorTheme === "DEFAULT") {
    storage.set("colorTheme", undefined)
    setDefaultColorTheme()
  } else {
    storage.set("colorTheme", colorTheme)
    setColorThemeClass(colorTheme)
  }
}
