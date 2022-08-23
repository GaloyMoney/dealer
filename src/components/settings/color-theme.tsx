import { ChangeEvent, useEffect, useState } from "react"

import { Icon } from "@galoymoney/react"

import {
  translate,
  ColorTheme,
  colorThemeLabels,
  NoPropsFCT,
  setColorTheme,
  storage,
} from "store/index"

const ColorThemeSetting: NoPropsFCT = () => {
  const [colorTheme, setColorThemeState] = useState<ColorTheme>("DEFAULT")

  const handleColorThemeChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const newColorTheme = event.currentTarget.value as ColorTheme

    // Update localStorage and theme class
    setColorTheme(newColorTheme)

    // Update local state value
    setColorThemeState(newColorTheme)
  }

  useEffect(() => {
    const colorThemeInStorage = storage.get("colorTheme")
    setColorThemeState(
      colorThemeInStorage && colorThemeInStorage in colorThemeLabels
        ? (colorThemeInStorage as ColorTheme)
        : "DEFAULT",
    )
  }, [])

  return (
    <div className="setting">
      <div className="icon">
        <Icon name="opacity" />
      </div>
      <div className="name">
        {translate("Color Theme")}
        <div className="sub">{translate(colorThemeLabels[colorTheme])}</div>
      </div>
      <div className="action">
        <select name="colorTheme" value={colorTheme} onChange={handleColorThemeChange}>
          {Object.entries(colorThemeLabels).map(([key, label]) => {
            return (
              <option key={key} value={key}>
                {translate(label)}
              </option>
            )
          })}
        </select>
      </div>
    </div>
  )
}

export default ColorThemeSetting
