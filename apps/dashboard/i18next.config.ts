import { defineConfig } from "i18next-cli";

export default defineConfig({
  locales: ["en", "he"],
  extract: {
    input: "src/**/*.{js,jsx,ts,tsx}",
    output: "locals/{{language}}/{{namespace}}.json",
  },
});
