import { AxiosError } from "axios"
import { History } from "history"

// A small function to help us deal with errors coming from fetching a flow.
export const handleFlowError = ({
  history,
  resetFlow,
}: {
  history: History
  resetFlow: () => void
}) => {
  return async (err: AxiosError) => {
    console.debug("[Kratos error]", err, err.response?.data.error)

    switch (err.response?.data.error?.id) {
      case "session_aal2_required":
        // 2FA is enabled and enforced, but user did not perform 2fa yet!
        window.location.href = err.response?.data.redirect_browser_to
        return
      case "session_already_available":
        // User is already signed in, let's redirect them home!
        await history.push("/")
        return
      case "session_refresh_required":
        // We need to re-authenticate to perform this action
        window.location.href = err.response?.data.redirect_browser_to
        return
      case "self_service_flow_return_to_forbidden":
        // The flow expired, let's request a new one.
        resetFlow()
        return
      case "self_service_flow_expired":
        // The flow expired, let's request a new one.
        resetFlow()
        return
      case "security_csrf_violation":
        // A CSRF violation occurred. Best to just refresh the flow!
        resetFlow()
        return
      case "security_identity_mismatch":
        // The requested item was intended for someone else. Let's request a new flow...
        resetFlow()
        return
      case "browser_location_change_required":
        // Ory Kratos asked us to point the user to this URL.
        window.location.href = err.response.data.redirect_browser_to
        return
    }

    switch (err.response?.status) {
      case 410:
        // The flow expired, let's request a new one.
        resetFlow()
        return
    }

    // We are not able to handle the error? Return it.
    return Promise.reject(err)
  }
}
