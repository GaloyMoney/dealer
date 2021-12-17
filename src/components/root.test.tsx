import "@testing-library/jest-dom/extend-expect"

import { render } from "@testing-library/react"

import Root from "./root"

describe("Root", () => {
  it("renders Home and matches snapshot", () => {
    const { asFragment } = render(<Root initialState={{ path: "/" }} />)
    expect(asFragment()).toMatchSnapshot()
  })
  it("renders Login and matches snapshot", () => {
    const { asFragment } = render(<Root initialState={{ path: "/login" }} />)
    expect(asFragment()).toMatchSnapshot()
  })
})
