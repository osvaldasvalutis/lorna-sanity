import { defineMigration, set } from "sanity/migrate"

/**
 * The `prices[].price` field used to be a `number` and is now a `string`
 * (to allow free text like `130-170`). Existing documents still have a
 * number stored, which fails validation against the new schema — this
 * migration rewrites those values to strings.
 */
export default defineMigration({
  title: `Convert prices[].price from number to string`,
  documentTypes: [`service`],

  migrate: {
    number(node, path) {
      const [arrayField, , fieldName] = path
      if (path.length === 3 && arrayField === `prices` && fieldName === `price`) {
        return set(String(node))
      }
    },
  },
})
