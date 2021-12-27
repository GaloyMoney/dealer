import "@testing-library/jest-dom/extend-expect"

import { render } from "@testing-library/react"
import { MockedProvider } from "@apollo/client/testing"

import Root from "./root"

describe("Root", () => {
  it("renders Home and matches snapshot", () => {
    const { asFragment } = render(
      <MockedProvider>
        <Root initialState={{ path: "/" }} />
      </MockedProvider>,
    )
    expect(asFragment()).toMatchSnapshot()
  })
  it("renders Login and matches snapshot", () => {
    const { asFragment } = render(
      <MockedProvider>
        <Root initialState={{ path: "/login" }} />
      </MockedProvider>,
    )
    expect(asFragment()).toMatchSnapshot()
  })
})
