import { ChangeEvent, useEffect, useState } from "react"

import { translate } from "@galoymoney/client"
import { Icon } from "@galoymoney/react"

import storage from "store/local-storage"
import { ColorTheme, colorThemeLabels, setColorTheme } from "store/theme"
import { NoPropsFCT } from "store/types"

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
        <Icon name="colors" />
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
