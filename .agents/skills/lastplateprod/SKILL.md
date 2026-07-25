```markdown
# lastplateprod Development Patterns

> Auto-generated skill from repository analysis

## Overview
This skill teaches best practices and conventions for contributing to the `lastplateprod` repository, a TypeScript project built with the Vite framework. You'll learn the project's file organization, code style, import/export patterns, and how to write and run tests. While no automated workflows were detected, this guide provides suggested commands and step-by-step instructions for common development tasks.

## Coding Conventions

### File Naming
- Use **snake_case** for all file names.
  - Example:  
    ```
    user_profile.ts
    order_service.test.ts
    ```

### Import Style
- Use **alias imports** for modules.
  - Example:
    ```typescript
    import { getUser } from '@services/user_service';
    ```

### Export Style
- Use **named exports** for all modules.
  - Example:
    ```typescript
    // In user_service.ts
    export function getUser(id: string) { ... }
    export function updateUser(user: User) { ... }
    ```

### Commit Messages
- Freeform style, often with a short prefix.
- Average commit message length: ~45 characters.
  - Example:
    ```
    fix: correct user profile image loading
    add order summary endpoint
    ```

## Workflows

### Start Development Server
**Trigger:** When you want to run the app locally for development.  
**Command:** `/dev`

1. Open your terminal in the project root.
2. Run the Vite development server:
    ```
    npm run dev
    ```
3. Visit the local URL provided (typically http://localhost:5173).

---

### Build for Production
**Trigger:** When you need to create an optimized production build.  
**Command:** `/build`

1. Open your terminal in the project root.
2. Run the build command:
    ```
    npm run build
    ```
3. The output will appear in the `dist/` directory.

---

### Run Tests
**Trigger:** When you want to execute the test suite.  
**Command:** `/test`

1. Open your terminal in the project root.
2. Run the test command (replace with actual test runner if known):
    ```
    npm test
    ```
   or, if using a specific runner:
    ```
    npx vitest
    ```
3. Review the output for passing and failing tests.

---

### Add a New Module
**Trigger:** When you need to create a new feature or service module.  
**Command:** `/add-module`

1. Create a new file using snake_case, e.g., `new_feature.ts`.
2. Use named exports for all functions or classes.
    ```typescript
    export function newFeature() { ... }
    ```
3. Import using the appropriate alias in other files.
    ```typescript
    import { newFeature } from '@features/new_feature';
    ```

## Testing Patterns

- Test files use the pattern: `*.test.*`
  - Example: `user_service.test.ts`
- The specific testing framework is unknown; however, test files are colocated with source or in a `tests` directory.
- Example test file structure:
    ```typescript
    import { getUser } from '@services/user_service';

    describe('getUser', () => {
      it('returns user data for valid ID', () => {
        // test implementation
      });
    });
    ```

## Commands
| Command      | Purpose                                      |
|--------------|----------------------------------------------|
| /dev         | Start the Vite development server            |
| /build       | Build the project for production             |
| /test        | Run the test suite                           |
| /add-module  | Scaffold a new module with conventions       |
```
