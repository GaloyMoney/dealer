import "@testing-library/jest-dom/extend-expect"

import appRoutes from "../server/routes"
import { render } from "@testing-library/react"

import Root from "./root"

describe("Root", () => {
  it("renders Home and matches snapshot", () => {
    const { asFragment } = render(<Root initialData={{ appRoutes, path: "/" }} />)
    expect(asFragment()).toMatchSnapshot()
  })
  it("renders Login and matches snapshot", () => {
    const { asFragment } = render(<Root initialData={{ appRoutes, path: "/login" }} />)
    expect(asFragment()).toMatchSnapshot()
  })
})
