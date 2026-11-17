# @dirstack/utils

A lightweight set of TypeScript utilities, published to npm as `@dirstack/utils`. Each module lives in `src/<module>/` with its tests beside it. The README lists the commands for development.

## Releasing

Releases use Changesets. Pushing to `main` never publishes on its own.

1. **A PR that changes what the package ships carries a changeset.** Run `bunx changeset`, choose the bump and write the entry for the people who use the package. It lands in `CHANGELOG.md` and in the GitHub Release. The package ships `src/`, `package.json` and the build from `tsdown.config.ts`.
2. **Pick the bump by its effect on existing users.** A fix is a patch. A new helper or option is a minor. A removed or renamed export, a changed signature or a changed return value is a major, and it also needs a section in the README migration guide.
3. **A change that ships nothing needs no changeset.** That covers tests, the README and the CI workflows. CI checks this with `bunx changeset status --since=origin/main` and fails a PR that changes a shipped file without a changeset. When a shipped file changes but users see no difference, such as a devDependency bump, add `bunx changeset --empty`.
4. **`release.yml` versions and publishes.** While changesets are pending, it opens or updates the "Version Packages" PR. Merging that PR bumps the version, and the release job publishes it with `kodeks publish` from `@dirstack/kodeks`.

Rules:

- **Never publish by hand.** npm accepts only trusted publishing from this repository's `release.yml`, and tokens are disallowed. Renaming `release.yml` breaks publishing until the trusted publisher on npmjs.com is updated.
- **Kodeks is pinned exactly.** `release.yml` calls its workflows at the commit SHA of a Kodeks release, and `package.json` takes its exact version. Bump them together.
