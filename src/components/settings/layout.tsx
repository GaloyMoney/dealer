import Header from "components/header"

const SettingsLayout: React.FC = ({ children }) => {
  return (
    <div className="settings">
      <Header page="settings" />
      {children}
    </div>
  )
}

export default SettingsLayout
