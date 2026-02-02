# UniAdmit CRM - System Architecture

## 🏗️ Application Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND (React)                        │
│                     http://localhost:5173                       │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ├── User Authentication
                                ├── Role-Based Access Control
                                ├── JWT Token Management
                                └── API Communication (Axios)
                                │
                    ┌───────────┴───────────┐
                    │                       │
            ┌───────▼──────┐       ┌───────▼──────┐
            │   UI Layer   │       │  State Layer │
            │  (Components)│       │   (Redux)    │
            └──────────────┘       └──────────────┘
                    │                       │
                    └───────┬───────────────┘
                            │
                    ┌───────▼──────┐
                    │ Service Layer│
                    │   (Axios)    │
                    └──────┬───────┘
                           │
                ┌──────────▼──────────┐
                │   Backend API       │
                │ (To Be Implemented) │
                └─────────────────────┘
```

---

## 📁 Directory Structure

```
d:/Agent-crm/
│
├── public/                      # Static assets
│
├── src/
│   ├── components/              # React components
│   │   ├── common/              # Reusable UI components
│   │   │   ├── Button.jsx       # Button with variants
│   │   │   ├── Input.jsx        # Form input
│   │   │   ├── Select.jsx       # Dropdown
│   │   │   ├── Textarea.jsx     # Text area
│   │   │   ├── Badge.jsx        # Status badge
│   │   │   ├── Card.jsx         # Container card
│   │   │   ├── Modal.jsx        # Popup modal
│   │   │   ├── Table.jsx        # Data table
│   │   │   ├── Pagination.jsx   # Page navigation
│   │   │   ├── Alert.jsx        # Alert messages
│   │   │   ├── Loading.jsx      # Loading spinner
│   │   │   ├── EmptyState.jsx   # No data state
│   │   │   ├── Breadcrumb.jsx   # Navigation breadcrumb
│   │   │   ├── FileUpload.jsx   # File upload
│   │   │   └── index.js         # Export all
│   │   │
│   │   ├── layout/              # Layout components
│   │   │   ├── Sidebar.jsx      # Navigation sidebar
│   │   │   ├── Navbar.jsx       # Top navigation
│   │   │   └── DashboardLayout.jsx # Page wrapper
│   │   │
│   │   └── route/               # Route guards
│   │       └── ProtectedRoute.jsx # Auth protection
│   │
│   ├── pages/                   # Page components
│   │   ├── auth/                # Authentication
│   │   │   ├── Login.jsx
│   │   │   ├── RegisterAgent.jsx
│   │   │   ├── RegisterStudent.jsx
│   │   │   ├── ForgotPassword.jsx
│   │   │   └── ResetPassword.jsx
│   │   │
│   │   ├── dashboard/           # Dashboards
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── AgentDashboard.jsx
│   │   │   └── StudentDashboard.jsx
│   │   │
│   │   ├── agents/              # Agent management
│   │   │   ├── AgentList.jsx
│   │   │   ├── AgentDetails.jsx
│   │   │   └── PendingAgents.jsx
│   │   │
│   │   ├── universities/        # University management
│   │   │   ├── UniversityList.jsx
│   │   │   ├── UniversityForm.jsx
│   │   │   └── UniversityDetails.jsx
│   │   │
│   │   ├── courses/             # Course management
│   │   │   ├── CourseList.jsx
│   │   │   ├── CourseForm.jsx
│   │   │   └── CourseDetails.jsx
│   │   │
│   │   ├── students/            # Student management
│   │   │   ├── StudentList.jsx
│   │   │   ├── StudentForm.jsx
│   │   │   └── StudentDetails.jsx
│   │   │
│   │   ├── applications/        # Application management
│   │   │   ├── ApplicationList.jsx
│   │   │   ├── ApplicationForm.jsx
│   │   │   └── ApplicationDetails.jsx
│   │   │
│   │   ├── commissions/         # Commission management
│   │   │   ├── CommissionList.jsx
│   │   │   └── CommissionForm.jsx
│   │   │
│   │   ├── payouts/             # Payout management
│   │   │   ├── PayoutList.jsx
│   │   │   ├── PayoutRequests.jsx
│   │   │   └── AgentEarnings.jsx
│   │   │
│   │   ├── audit-logs/          # Audit logging
│   │   │   └── AuditLogList.jsx
│   │   │
│   │   ├── Profile.jsx          # User profile
│   │   ├── Settings.jsx         # App settings
│   │   ├── Unauthorized.jsx     # 403 page
│   │   ├── NotFound.jsx         # 404 page
│   │   └── ComponentShowcase.jsx # UI demo
│   │
│   ├── services/                # API service layer
│   │   ├── apiClient.js         # Axios instance
│   │   ├── authService.js       # Auth APIs
│   │   ├── agentService.js      # Agent APIs
│   │   ├── universityService.js # University APIs
│   │   ├── courseService.js     # Course APIs
│   │   ├── studentService.js    # Student APIs
│   │   ├── applicationService.js # Application APIs
│   │   ├── commissionService.js # Commission APIs
│   │   ├── payoutService.js     # Payout APIs
│   │   ├── dashboardService.js  # Dashboard APIs
│   │   └── auditLogService.js   # Audit log APIs
│   │
│   ├── store/                   # Redux state
│   │   ├── index.js             # Store config
│   │   └── slices/              # Redux slices
│   │       ├── authSlice.js
│   │       ├── agentSlice.js
│   │       ├── universitySlice.js
│   │       ├── courseSlice.js
│   │       ├── studentSlice.js
│   │       ├── applicationSlice.js
│   │       ├── commissionSlice.js
│   │       ├── payoutSlice.js
│   │       ├── dashboardSlice.js
│   │       └── auditLogSlice.js
│   │
│   ├── utils/                   # Utilities
│   │   ├── constants.js         # App constants
│   │   └── helpers.js           # Helper functions
│   │
│   ├── App.jsx                  # Main app component
│   ├── main.jsx                 # Entry point
│   └── index.css                # Global styles
│
├── .env                         # Environment variables
├── tailwind.config.js           # Tailwind config
├── postcss.config.js            # PostCSS config
├── vite.config.js               # Vite config
├── package.json                 # Dependencies
│
└── Documentation/
    ├── README.md                # Project overview
    ├── PROJECT_STATUS.md        # Implementation status
    ├── QUICKSTART.md            # Getting started
    ├── DELIVERY_SUMMARY.md      # Delivery summary
    └── ARCHITECTURE.md          # This file
```

---

## 🔄 Data Flow

### 1. User Interaction → UI Update

```
User clicks button
    ↓
Component handles event
    ↓
Dispatches Redux action
    ↓
Reducer updates state
    ↓
Component re-renders with new data
```

### 2. API Call Flow

```
Component needs data
    ↓
Calls service function (e.g., agentService.getAgents())
    ↓
Service makes Axios request
    ↓
Axios interceptor adds JWT token
    ↓
Request sent to backend
    ↓
Response received
    ↓
Data dispatched to Redux
    ↓
Component displays data
```

### 3. Authentication Flow

```
User submits login form
    ↓
authService.login(credentials)
    ↓
Backend validates & returns JWT
    ↓
Token stored in localStorage
    ↓
Redux state updated with user data
    ↓
User redirected to dashboard
    ↓
All subsequent requests include token
```

---

## 🎨 Component Hierarchy

```
App (Redux Provider)
 │
 ├── BrowserRouter
 │    │
 │    ├── Public Routes
 │    │    ├── Login
 │    │    ├── RegisterAgent
 │    │    ├── RegisterStudent
 │    │    ├── ForgotPassword
 │    │    └── ResetPassword
 │    │
 │    └── Protected Routes (ProtectedRoute wrapper)
 │         │
 │         └── DashboardLayout
 │              │
 │              ├── Sidebar (role-based menu)
 │              ├── Navbar (user menu, notifications)
 │              │
 │              └── Outlet (page content)
 │                   ├── Dashboard (AdminDashboard / AgentDashboard / StudentDashboard)
 │                   ├── Agent Pages (List / Details / Pending)
 │                   ├── University Pages (List / Form / Details)
 │                   ├── Course Pages (List / Form / Details)
 │                   ├── Student Pages (List / Form / Details)
 │                   ├── Application Pages (List / Form / Details)
 │                   ├── Commission Pages (List / Form)
 │                   ├── Payout Pages (List / Requests / Earnings)
 │                   ├── Audit Logs
 │                   ├── Profile
 │                   └── Settings
```

---

## 🔐 Security Architecture

### Token-Based Authentication

```
┌──────────────┐
│ User Login   │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ JWT Token    │ ──────► Stored in localStorage
│ Generated    │
└──────┬───────┘
       │
       ▼
┌──────────────────────┐
│ All API Requests     │
│ Include Token        │ ──────► Authorization: Bearer <token>
└──────┬───────────────┘
       │
       ├─► Valid Token ──────► Request Processed
       │
       └─► Invalid/Expired ──► 401 Response ──► Auto Logout
```

### Role-Based Access Control

```
User logs in
   │
   ├── Role: Super Admin
   │    └── Access: All routes
   │
   ├── Role: Admin
   │    └── Access: All except Admin Management & Audit Logs
   │
   ├── Role: Agent
   │    └── Access: Dashboard, Students, Applications, Earnings
   │
   └── Role: Student
        └── Access: Dashboard, My Applications, Profile
```

---

## 📊 State Management (Redux)

### Store Structure

```javascript
{
  auth: {
    user: { id, name, email, role },
    token: "jwt-token",
    isAuthenticated: true,
    loading: false,
    error: null
  },
  
  agent: {
    agents: [...],
    currentAgent: {...},
    pendingAgents: [...],
    pagination: { page, limit, total },
    loading: false,
    error: null
  },
  
  university: {
    universities: [...],
    currentUniversity: {...},
    filters: { search, country, status },
    pagination: {...},
    loading: false,
    error: null
  },
  
  // Similar structure for:
  // - course
  // - student
  // - application
  // - commission
  // - payout
  // - dashboard
  // - auditLog
}
```

---

## 🌐 API Endpoints (Expected)

### Authentication
- `POST /api/auth/login`
- `POST /api/auth/register/agent`
- `POST /api/auth/register/student`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`
- `POST /api/auth/verify-otp`
- `GET /api/auth/me`
- `PUT /api/auth/profile`
- `POST /api/auth/logout`

### Agents
- `GET /api/agents` - List agents
- `GET /api/agents/pending` - Pending approvals
- `GET /api/agents/:id` - Get agent
- `POST /api/agents` - Create agent
- `PUT /api/agents/:id` - Update agent
- `DELETE /api/agents/:id` - Delete agent
- `POST /api/agents/:id/approve` - Approve agent
- `POST /api/agents/:id/reject` - Reject agent

### Universities
- `GET /api/universities`
- `POST /api/universities`
- `GET /api/universities/:id`
- `PUT /api/universities/:id`
- `DELETE /api/universities/:id`
- `POST /api/universities/:id/logo`

### Courses
- `GET /api/courses`
- `POST /api/courses`
- `GET /api/courses/:id`
- `PUT /api/courses/:id`
- `DELETE /api/courses/:id`

### Students
- `GET /api/students`
- `POST /api/students`
- `GET /api/students/:id`
- `PUT /api/students/:id`
- `DELETE /api/students/:id`
- `POST /api/students/:id/documents`

### Applications
- `GET /api/applications`
- `POST /api/applications`
- `GET /api/applications/:id`
- `PUT /api/applications/:id`
- `DELETE /api/applications/:id`
- `POST /api/applications/:id/submit`
- `PUT /api/applications/:id/status`
- `GET /api/applications/:id/history`

### Commissions
- `GET /api/commissions`
- `POST /api/commissions`
- `PUT /api/commissions/:id`
- `DELETE /api/commissions/:id`
- `POST /api/commissions/calculate`

### Payouts
- `GET /api/payouts`
- `GET /api/payouts/requests`
- `POST /api/payouts/request`
- `POST /api/payouts/:id/approve`
- `POST /api/payouts/:id/reject`
- `GET /api/payouts/earnings/:agentId`

### Dashboard
- `GET /api/dashboard/stats`
- `GET /api/dashboard/admin`
- `GET /api/dashboard/agent/:agentId`
- `GET /api/dashboard/student/:studentId`

### Audit Logs
- `GET /api/audit-logs`
- `GET /api/audit-logs/:id`
- `GET /api/audit-logs/export`

---

## 🎨 Design System

### Color System (Tailwind)
```javascript
primary: {
  50: '#eff6ff',   // Very light blue
  500: '#3b82f6',  // Main blue (navbar, buttons)
  600: '#2563eb',  // Darker blue (hover)
  900: '#1e3a8a'   // Very dark blue
}

secondary: {
  500: '#22c55e',  // Main green (success, approved)
  600: '#16a34a'   // Darker green (hover)
}

accent: {
  500: '#6366f1',  // Main indigo (active, highlights)
  600: '#4f46e5'   // Darker indigo (hover)
}
```

### Typography
- **Headings**: Bold, hierarchical (h1: 3xl, h2: 2xl, h3: xl)
- **Body**: Regular, 14px base
- **Small**: 12px for captions

### Spacing
- **Padding**: 4px, 8px, 12px, 16px, 24px
- **Margin**: 4px, 8px, 16px, 24px, 32px
- **Gap**: 12px, 16px, 24px

### Shadows
- **Card**: shadow-sm (subtle)
- **Modal**: shadow-xl (prominent)
- **Dropdown**: shadow-lg (medium)

---

## 🚀 Build & Deployment

### Development
```bash
npm run dev
# Runs on http://localhost:5173
# Hot module reload enabled
```

### Production Build
```bash
npm run build
# Creates optimized bundle in /dist
# Minified, tree-shaken, optimized
```

### Preview Production
```bash
npm run preview
# Serves production build locally
```

---

## 📈 Performance Optimizations

### Code Splitting
- Route-based lazy loading (ready for implementation)
- Component lazy loading where needed

### Bundle Optimization
- Vite's automatic code splitting
- Tree shaking
- Minification
- Asset optimization

### Runtime Optimization
- React.memo for expensive components
- useMemo for computed values
- useCallback for stable function references
- Virtual scrolling for large lists (can be added)

---

## 🧪 Testing Strategy (Recommended)

### Unit Tests
- Component rendering
- Redux reducers
- Utility functions
- Service layer

### Integration Tests
- API integration
- Form submissions
- Navigation flows
- Authentication

### E2E Tests
- Complete user journeys
- Role-based access
- Critical workflows

---

## 📦 Dependencies

### Core
- react: ^18.3.1
- react-dom: ^18.3.1
- react-router-dom: ^6.x
- @reduxjs/toolkit: ^2.x
- react-redux: ^9.x

### UI & Styling
- tailwindcss: ^3.x
- react-icons: ^5.x
- recharts: ^2.x

### Utilities
- axios: ^1.x
- date-fns: ^4.x

### Dev Tools
- vite: ^7.x
- @vitejs/plugin-react: ^4.x
- autoprefixer: ^10.x
- postcss: ^8.x

---

## 🔧 Configuration Files

### Environment Variables (.env)
```env
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=UniAdmit CRM
```

### Tailwind Config (tailwind.config.js)
- Custom color palette
- Extended theme
- Content paths configured

### Vite Config (vite.config.js)
- React plugin
- Build optimization
- Server configuration

---

## 📝 Coding Standards

### File Naming
- Components: PascalCase (e.g., `Button.jsx`)
- Services: camelCase (e.g., `authService.js`)
- Utilities: camelCase (e.g., `helpers.js`)

### Component Structure
```javascript
// 1. Imports
import React, { useState } from 'react';

// 2. Component
const MyComponent = ({ prop1, prop2 }) => {
  // 3. State & hooks
  const [state, setState] = useState();
  
  // 4. Functions
  const handleClick = () => {};
  
  // 5. Render
  return (...);
};

// 6. Export
export default MyComponent;
```

---

**This architecture provides a solid, scalable foundation for your University Admission CRM platform.**
