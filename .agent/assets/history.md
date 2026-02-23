---
description: ## Daily History System
---

-   Every chat session must generate a history file.
-   History must be stored in the root `history` folder.
-   Folder structure:

    /history
       /frontend
           21-02-26.md
       /backend
           21-02-26.md

-   Date format: `DD-MM-YY.md`
-   Every day must have a separate file.
-   Do NOT overwrite previous dates.

------------------------------------------------------------------------

## 2. Frontend Rules

-   All frontend changes must be written inside:
    `/history/frontend/{date}.md`
-   Clearly mention:
    -   What was changed
    -   What was added
    -   What was fixed
    -   Which files were created
    -   Which files were updated
    -   Which files were moved
    -   Which files were archived (delete folder)

------------------------------------------------------------------------

## 3. Backend Rules

-   All backend changes must be written inside:
    `/history/backend/{date}.md`
-   Clearly mention:
    -   API changes
    -   Database changes
    -   Logic updates
    -   Bug fixes
    -   Which files were created
    -   Which files were updated
    -   Which files were moved
    -   Which files were archived (delete folder)

------------------------------------------------------------------------

## 4. File Operation Tracking (Mandatory)

Every operation must be logged, including:

-   File Created
-   File Updated
-   File Moved
-   File Renamed
-   File Archived (moved to delete folder)

No file operation should go undocumented.

------------------------------------------------------------------------

## 5. Important Rules

-   Maintain strict separation between frontend and backend logs.
-   Create a new file every day.
-   Keep logs short, clear, and structured.
-   Never mix frontend and backend changes in the same file.
-   Logging is mandatory for every operation.