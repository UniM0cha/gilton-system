# AGENT Guidelines

## Scope
These guidelines apply to all files in this repository.

## Development
- The client resides in `client/` and the server in `server/`.
- When modifying code inside `client/` or `server/`, run the following checks before each commit:
  - `npm run lint` within the changed package directory.
  - `npm test` within the changed package directory if a test script exists.
- New client code should use TypeScript and React.
- README updates are allowed if user instructions require changes that differ from the current README contents.

