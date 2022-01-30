import "@testing-library/jest-dom/extend-expect"

import { render } from "@testing-library/react"
import { MockedProvider } from "@galoymoney/client"

import RootComponent from "./root-component"

describe("Root", () => {
  it("renders Home and matches snapshot", () => {
    const { asFragment } = render(
      <MockedProvider>
        <RootComponent path="/" />
      </MockedProvider>,
    )
    expect(asFragment()).toMatchSnapshot()
  })
  it("renders Login and matches snapshot", () => {
    const { asFragment } = render(
      <MockedProvider>
        <RootComponent path="/login" />
      </MockedProvider>,
    )
    expect(asFragment()).toMatchSnapshot()
  })
})
