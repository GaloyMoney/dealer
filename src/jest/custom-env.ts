import Environment from "jest-environment-jsdom"
import { TextEncoder } from "util"

class CustomTestEnvironment extends Environment {
  async setup() {
    await super.setup()
    if (typeof this.global.TextEncoder === "undefined") {
      this.global.TextEncoder = TextEncoder
    }
  }
}

export default CustomTestEnvironment
