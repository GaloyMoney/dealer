import Environment from "jest-environment-node"
import type {EnvironmentContext} from '@jest/environment'
import { ProjectConfig } from "@jest/types/build/Config"

class CleanEnvironment extends Environment {
  constructor(config: ProjectConfig, _context: EnvironmentContext) {
    super(config, _context)
  }
  async setup() {
    await super.setup()
    this.global.stopMongoose = true
  }
}

module.exports = CleanEnvironment
