const path = require("path");
const jiti = require(path.join(__dirname, "../node_modules/jiti"))(__filename);
const base = jiti(path.join(__dirname, "../tailwind.config.ts"));
module.exports = {
  ...(base.default || base),
  content: [path.join(__dirname, "../app/life/**/*.tsx"), path.join(__dirname, "../lib/life/**/*.ts"), path.join(__dirname, "web/**/*.tsx")],
};
