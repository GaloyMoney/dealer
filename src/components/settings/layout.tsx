import Header from "components/header"

const SettingsLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="settings">
      <Header page="settings" />
      {children}
    </div>
  )
}

export default SettingsLayout
