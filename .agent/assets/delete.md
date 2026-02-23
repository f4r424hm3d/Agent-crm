---
description: ## File Deletion Safety System
---

-   No file should ever be permanently deleted from the project.
-   If a file needs to be removed, it must be moved — not deleted.
-   All removed files must be stored inside the root `delete` folder.
-   The original directory structure must be preserved exactly as it was.

------------------------------------------------------------------------

## 1. Structure Rule (Strict)

The folder path inside `/delete` must mirror the original file path.

If original file path is:

    backend/src/{model}/file.js

Then it must be moved to:

    delete/backend/src/{model}/file.js

If original file path is:

    frontend/src/components/{model}/file.jsx

Then it must be moved to:

    delete/frontend/src/components/{model}/file.jsx

The full relative path must be recreated inside the delete folder.

------------------------------------------------------------------------

## 2. Mandatory Rules

-   Permanent deletion is strictly prohibited.
-   Always move files instead of deleting.
-   Recreate the exact original directory structure.
-   Preserve original file name.
-   Do NOT modify file content while moving.
-   This ensures complete recovery capability in future.

------------------------------------------------------------------------

## 3. Recovery Purpose

The delete folder acts as a safe archive.
Any removed file must remain recoverable with its original path intact.