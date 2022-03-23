import "@testing-library/jest-dom/extend-expect"

import { render } from "@testing-library/react"
import { MockedProvider } from "@galoymoney/client"

import RootComponent from "./root-component"

const mockDataPromise = () => Promise.resolve({ data: undefined })

jest.mock("../kratos", () => ({
  ...jest.requireActual("../kratos"),
  KratosSdk: () => ({
    initializeSelfServiceRegistrationFlowForBrowsers: mockDataPromise,
    initializeSelfServiceLoginFlowForBrowsers: mockDataPromise,
    initializeSelfServiceRecoveryFlowForBrowsers: mockDataPromise,
    initializeSelfServiceSettingsFlowForBrowsers: mockDataPromise,
  }),
}))

describe("Root appRoutes", () => {
  it("renders Home and matches snapshot", () => {
    const { asFragment } = render(
      <MockedProvider>
        <RootComponent path="/" />
      </MockedProvider>,
    )
    expect(asFragment()).toMatchSnapshot()
  })

  it("renders Send and matches snapshot", () => {
    const { asFragment } = render(
      <MockedProvider>
        <RootComponent path="/send" />
      </MockedProvider>,
    )
    expect(asFragment()).toMatchSnapshot()
  })

  it("renders Send with a destination and matches snapshot", () => {
    const { asFragment } = render(
      <MockedProvider>
        <RootComponent path="/send" to="user0" />
      </MockedProvider>,
    )
    expect(asFragment()).toMatchSnapshot()
  })

  it("renders Receive and matches snapshot", () => {
    const { asFragment } = render(
      <MockedProvider>
        <RootComponent path="/receive" />
      </MockedProvider>,
    )
    expect(asFragment()).toMatchSnapshot()
  })

  it("renders Contacts and matches snapshot", () => {
    const { asFragment } = render(
      <MockedProvider>
        <RootComponent path="/contacts" />
      </MockedProvider>,
    )
    expect(asFragment()).toMatchSnapshot()
  })

  it("renders Transactions and matches snapshot", () => {
    const { asFragment } = render(
      <MockedProvider>
        <RootComponent path="/transactions" username="user0" />
      </MockedProvider>,
    )
    expect(asFragment()).toMatchSnapshot()
  })

  it("renders Settings and matches snapshot", () => {
    const { asFragment } = render(
      <MockedProvider>
        <RootComponent path="/settings" />
      </MockedProvider>,
    )
    expect(asFragment()).toMatchSnapshot()
  })
})

describe("Root authRoutes", () => {
  it("renders Login and matches snapshot", () => {
    const { asFragment } = render(
      <MockedProvider>
        <RootComponent path="/login" />
      </MockedProvider>,
    )
    expect(asFragment()).toMatchSnapshot()
  })

  it("renders Register and matches snapshot", () => {
    const { asFragment } = render(
      <MockedProvider>
        <RootComponent path="/register" />
      </MockedProvider>,
    )
    expect(asFragment()).toMatchSnapshot()
  })

  it("renders Recorver and matches snapshot", () => {
    const { asFragment } = render(
      <MockedProvider>
        <RootComponent path="/recovery" />
      </MockedProvider>,
    )
    expect(asFragment()).toMatchSnapshot()
  })
})
