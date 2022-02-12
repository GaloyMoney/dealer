import { setLocale, translate, useMutation } from "@galoymoney/client"
import { Icon } from "@galoymoney/react"
import { ChangeEvent } from "react"
import useMainQuery from "../../hooks/use-main-query"
import { useAppState } from "../../store"
import ErrorMessage from "../error-message"

import Header from "../header"

const languageLabels = {
  "DEFAULT": "Default (OS)",
  "en-US": "English",
  "es-SV": "Spanish",
} as const

const Settings = () => {
  const { username, language } = useMainQuery()
  const { defaultLanguage } = useAppState()

  const [updateLanguage, { loading, errorsMessage }] = useMutation.userUpdateLanguage({
    onCompleted: (completed) => {
      setLocale(completed?.userUpdateLanguage.user?.language || defaultLanguage)
    },
  })

  const handleLanguageChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const newLanguage = event.currentTarget.value
    updateLanguage({ variables: { input: { language: newLanguage } } })
  }

  return (
    <div className="settings">
      <Header page="settings" />
      <div className="page-title">{translate("Settings")}</div>

      {errorsMessage && <ErrorMessage message={errorsMessage} />}

      <div className="list">
        <div className="setting">
          <div className="icon">
            <Icon name="person" />
          </div>
          <div className="name">
            {translate("Username")}
            <div className="sub">{username}</div>
          </div>
          <div className="action">
            <Icon name="lock" />
          </div>
        </div>

        <div className="setting">
          <div className="icon">
            <Icon name="language" />
          </div>
          <div className="name">
            {translate("Language")}
            <div className="sub">{translate(languageLabels[language || "DEFAULT"])}</div>
          </div>
          <div className="action">
            <select
              name="language"
              value={language}
              onChange={handleLanguageChange}
              disabled={loading}
            >
              {Object.entries(languageLabels).map(([key, label]) => {
                return (
                  <option key={key} value={key}>
                    {translate(label)}
                  </option>
                )
              })}
            </select>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Settings
