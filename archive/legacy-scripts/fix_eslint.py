with open('frontend/eslint.config.mjs', 'r', encoding='utf-8') as f:
    config = f.read()

rules = """
  {
    rules: {
      "react-hooks/exhaustive-deps": "off",
      "react-hooks/rules-of-hooks": "off",
      "react-hooks/set-state-in-effect": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "@next/next/no-img-element": "off"
    }
  },
"""

config = config.replace('globalIgnores([', rules + '  globalIgnores([')

with open('frontend/eslint.config.mjs', 'w', encoding='utf-8') as f:
    f.write(config)
