---
description: # Validation Structure Rule
---

## Mandatory Rule

All validations must NOT be written inside pages or components.

They must follow this structure:

utils/ validation/ {model}/ {formFile}.js

## Example

-   utils/validation/agent/agentRegistrationForm.js
-   utils/validation/agent/agentEditForm.js
-   utils/validation/student/studentCreateForm.js

## Strict Guidelines

-   No inline validation inside components
-   No direct regex inside pages
-   No duplicated validation logic
-   Always import validation from utils
-   Keep validation modular and reusable