const tsconfig = require("./tsconfig.json")
const moduleNameMapper = require("tsconfig-paths-jest")(tsconfig)

module.exports = {
  moduleFileExtensions: ["js", "json", "ts"],
  rootDir: "./src",
  testRegex: "src\/server\/e2e.*.e2e-spec.ts$",
  transform: {
    "^.+\\.(t|j)s$": "ts-jest"
  },
  moduleNameMapper,
  coverageDirectory: "../coverage"
}
