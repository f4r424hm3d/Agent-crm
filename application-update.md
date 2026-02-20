# Program Application Module – Final Functional Specification (v3)

## System Structure

The Program Application module consists of:

1. Applications List Page (Overview)
2. Application Detail Page

No additional intermediate pages.

---

# 1️⃣ Applications List Page (Overview)

Displays all applications of a student in table format.

## Table Columns

- S.N.
- App #
- Program (Program Name + University Name)
- More (Level, Duration, Category, Specialization)
- Status (Clickable)
- Stage (Clickable)
- Payment Date
- Send Mail (Button)
- Sent List (Status Indicator)
- Action (Delete / Pay)

---

# 2️⃣ Status Update (Modal)

## Trigger
Click on **Status**

## Options
- Not-Paid
- Paid
- Cancel

## Behavior

- On Save → status updates instantly.
- Status update date is stored.
- Status history entry is created.

### Important Rule

If Status = **Paid**:
- Delete button must NOT be visible.
- Delete functionality must be disabled.
- Paid applications cannot be deleted under any condition.

---

# 3️⃣ Stage Update (Modal)

## Trigger
Click on **Stage**

## Options

- Pre-Payment
- Pre-Submission
- Submission
- Post-Submission
- Admission
- Visa Application
- Pre-Arrival
- Post-Arrival
- Arrival

## Behavior

- On Save → stage updates instantly.
- Stage update date stored.
- Stage history entry created.
- Progress bar must update automatically on Detail Page.

---

# 4️⃣ Send Mail Functionality

## Trigger
Click on **Send Mail** button in list.

## Behavior

A modal will open for sending email.

---

## Mail Modal Fields

- Send To (Email Input)
- CC
- Greeting
- Recipient Name
- Message Body (Editable Textarea)
- Sender Name (Dropdown)
- Document Selection Section (Checkbox List)
- Send Button

---

## Document Attachment Logic

At the bottom of the modal:

- Display all documents uploaded by the student.
- Each document must appear with a checkbox.
- User can select multiple documents.
- Selected documents will be attached to the email.
- Only selected documents are sent.

---

## After Mail Is Sent

- Email is successfully sent.
- In the Applications List page:
  - "Sent List" column must update to show: **Sent**
- Mail entry must be added to Mail History in Application Detail Page.
- Store:
  - Date & Time
  - Sent By
  - Attached Documents
  - Recipient Email

---

# 5️⃣ Application Detail Page

## Route
`/applications/:applicationId`

---

## Sections Required

- Student Information
- Program Information
- University Information
- Status Information
- Stage Information
- Payment Information
- Uploaded Documents
- Mail History
- Activity Timeline

---

# 6️⃣ Progress Tracking System

## A. Stage Progress Bar

Display visual progress bar with steps:

Pre-Payment → Pre-Submission → Submission → Post-Submission → Admission → Visa Application → Pre-Arrival → Post-Arrival → Arrival

Rules:
- Completed stages highlighted.
- Current stage active.
- Future stages inactive.
- Auto-sync with latest stage.

---

## B. Status & Stage History Timeline

Show history in this format:

12 Jan, 2026 – 06:22 PM  
Status changed to: Paid  

12 Jan, 2026 – 06:13 PM  
Stage changed to: Pre-Submission  

Each entry must store:
- Action Type (Status / Stage / Mail)
- Updated Value
- Date & Time
- Updated By

---

# 7️⃣ Critical Business Rules

- Paid applications cannot be deleted.
- Delete button must be hidden when status = Paid.
- All status changes must create history.
- All stage changes must create history.
- All mails must create history.
- Sent List column must update after successful mail send.
- No full page reload required (preferred).
- Role-based permissions must apply.

---

# Final Flow

Applications List Page  
        ↓  
Click App #  
        ↓  
Application Detail Page  
        ↓  
Progress Bar + Timeline + Mail History Visible