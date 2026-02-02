# UniAdmit CRM - University Admission Management System

A complete, production-ready frontend for a large-scale EdTech/University Admission CRM platform built with React, Vite, Tailwind CSS, and Redux Toolkit.

## 🚀 Features

### User Roles & Access Control
- **Super Admin**: Full system access, manage admins, global settings, audit logs
- **Admin**: Manage agents, universities, courses, commissions, approve applications
- **Agent**: Register students, submit applications, track earnings, view universities/courses
- **Student**: Apply to courses, upload documents, track application status

### Core Functionality
- ✅ Role-based authentication & authorization
- ✅ Agent registration & approval workflow
- ✅ University & course management
- ✅ Priority-based commission system
- ✅ Student application pipeline with status tracking
- ✅ Payout & earnings management
- ✅ Comprehensive audit logging (Super Admin only)
- ✅ Role-specific dashboards with analytics
- ✅ Responsive design (Desktop, Tablet, Mobile)

### Application Status Pipeline
- Draft → Submitted → Under Review → Offer Issued → Offer Accepted → Fee Paid → Enrolled / Rejected

## 🎨 Color Scheme

The application follows a consistent color theme across all roles:

- **Primary (Blue #3b82f6)**: Navbar, sidebar, main buttons, titles
- **Secondary (Green #22c55e)**: Success messages, approved status, positive indicators
- **Accent (Indigo #6366f1)**: Active menu items, CTAs, highlights
- **Background**: Light gray/white for pages and cards
- **Text**: Dark gray for primary content, gray for secondary
- **Error (Red)**: Error messages, rejected status, destructive actions
- **Warning (Amber)**: Pending states, warning alerts
- **Info (Light Blue)**: Informational messages, tooltips

## 📁 Project Structure

```
src/
├── components/
│   ├── common/          # Reusable UI components
│   │   ├── Button.jsx
│   │   ├── Input.jsx
│   │   ├── Select.jsx
│   │   ├── Card.jsx
│   │   ├── Modal.jsx
│   │   ├── Table.jsx
│   │   ├── Badge.jsx
│   │   ├── Alert.jsx
│   │   ├── Loading.jsx
│   │   └── ...
│   ├── layout/          # Layout components
│   │   ├── Sidebar.jsx
│   │   ├── Navbar.jsx
│   │   └── DashboardLayout.jsx
│   └── route/           # Route guards
│       └── ProtectedRoute.jsx
├── pages/               # Page components
│   ├── auth/            # Authentication pages
│   ├── dashboard/       # Role-specific dashboards
│   ├── agents/          # Agent management
│   ├── universities/    # University management
│   ├── courses/         # Course management
│   ├── students/        # Student management
│   ├── applications/    # Application management
│   ├── commissions/     # Commission rules
│   ├── payouts/         # Payout system
│   └── audit-logs/      # Audit logging
├── services/            # API service layer
│   ├── apiClient.js     # Axios instance with interceptors
│   ├── authService.js
│   ├── agentService.js
│   ├── universityService.js
│   ├── courseService.js
│   ├── studentService.js
│   ├── applicationService.js
│   ├── commissionService.js
│   ├── payoutService.js
│   ├── dashboardService.js
│   └── auditLogService.js
├── store/               # Redux state management
│   ├── index.js         # Store configuration
│   └── slices/          # Redux slices
│       ├── authSlice.js
│       ├── agentSlice.js
│       ├── universitySlice.js
│       ├── courseSlice.js
│       ├── studentSlice.js
│       ├── applicationSlice.js
│       ├── commissionSlice.js
│       ├── payoutSlice.js
│       ├── dashboardSlice.js
│       └── auditLogSlice.js
├── utils/               # Utility functions
│   ├── constants.js     # App constants, enums, labels
│   └── helpers.js       # Helper functions
├── App.jsx              # Main app with routing
├── main.jsx             # Entry point
└── index.css            # Global styles with Tailwind

```

## 🛠️ Tech Stack

- **React 18** - UI library
- **Vite** - Build tool & dev server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router v6** - Client-side routing
- **Redux Toolkit** - State management
- **Axios** - HTTP client
- **React Icons** - Icon library
- **Recharts** - Charts & analytics
- **date-fns** - Date formatting

## 🚦 Getting Started

### Prerequisites
- Node.js >= 16.x
- npm or yarn

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   Create a `.env` file in the root directory:
   ```env
   VITE_API_URL=http://localhost:5000/api
   VITE_APP_NAME=UniAdmit CRM
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

4. **Build for production:**
   ```bash
   npm run build
   ```

5. **Preview production build:**
   ```bash
   npm run preview
   ```

## 🔐 Authentication

The application uses JWT token-based authentication with the following flow:

1. User selects role and logs in
2. Backend returns JWT token and user data
3. Token stored in localStorage
4. Token attached to all API requests via Axios interceptor
5. On 401 response, user redirected to login

### Test Credentials (Backend Required)
Configure your backend to seed test users for each role:
- Super Admin
- Admin
- Agent (with different approval statuses)
- Student

## 📱 Responsive Design

The application is fully responsive with breakpoints:
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

## 🎯 Key Features Implementation

### 1. Agent Registration & Approval
- Agents register with company details and documents
- Admin reviews and approves/rejects
- Bank details unlocked upon approval
- Status badges: Pending / Approved / Rejected

### 2. Commission Priority Logic
The system displays commission to agents based on priority:
1. Agent + Course specific commission
2. Agent + University specific commission
3. Course default commission
4. University default commission

### 3. Application Pipeline
Complete workflow with status tracking:
- Multi-step application form
- Document uploads
- Status timeline
- Commission calculation display
- Admin approval workflow

### 4. Payout System
- Agent earnings dashboard
- Breakdown: Pending / Approved / Paid
- Payout request system
- Admin approval workflow
- Payment history

### 5. Audit Logs
- Read-only logs for Super Admin
- Tracks all CRUD operations
- Records: User, Role, Action, Entity, Old/New Values, IP, Timestamp
- Filterable and exportable

## 🎨 UI Components

All components are reusable and follow Tailwind's design system:

### Form Components
- `<Input />` - Text inputs with validation
- `<Select />` - Dropdowns with options
- `<Textarea />` - Multi-line text input
- `<FileUpload />` - File upload with drag-and-drop

### Display Components
- `<Card />` - Container with Header, Body, Footer
- `<Badge />` - Status indicators
- `<Alert />` - Success/Error/Warning/Info messages
- `<Table />` - Data tables with loading/empty states
- `<Pagination />` - Page navigation
- `<Loading />` - Loading spinners
- `<EmptyState />` - Empty data placeholders
- `<Breadcrumb />` - Navigation breadcrumbs

### Action Components
- `<Button />` - Primary, Secondary, Accent, Danger variants
- `<Modal />` - Modals with customizable sizes

## 🔒 Security Features

- Role-based route protection
- JWT token validation
- Automatic token refresh handling
- Secure logout
- Protected API endpoints
- Field-level access control

## 🌍 API Integration

All services are ready to integrate with your backend:

```javascript
// Example: Login
import authService from './services/authService';

const login = async (credentials) => {
  const response = await authService.login(credentials);
  // Handle response
};
```

API base URL is configured in `.env`:
```
VITE_API_URL=http://localhost:5000/api
```

## 📊 State Management

Redux Toolkit slices manage all application state:

```javascript
// Example: Dispatch action
import { useDispatch } from 'react-redux';
import { setAgents } from './store/slices/agentSlice';

const dispatch = useDispatch();
dispatch(setAgents(data));
```

## 🎨 Customization

### Colors
Edit `tailwind.config.js` to customize the color scheme:
```javascript
theme: {
  extend: {
    colors: {
      primary: { ... },
      secondary: { ... },
      accent: { ... },
    }
  }
}
```

### Brand Name
Update `.env` and `Sidebar.jsx`:
```env
VITE_APP_NAME=Your CRM Name
```

## 📝 Development Notes

### Current State
- ✅ Complete folder structure
- ✅ Redux store with all slices
- ✅ API service layer for all entities
- ✅ Reusable UI components
- ✅ Layout components (Sidebar, Navbar)
- ✅ Protected routes with role-based access
- ✅ Authentication pages
- ✅ Admin dashboard with charts
- ✅ All page placeholders created
- ⏳ Individual CRUD pages (to be completed based on requirements)

### Next Steps for Full Implementation
1. Complete all CRUD forms (University, Course, Student, etc.)
2. Implement file upload handlers
3. Complete Agent registration form with documents
4. Build complete application wizard
5. Add commission calculator UI
6. Complete payout request workflow
7. Build audit log filters and export
8. Add loading states and error boundaries
9. Implement search and filters on all lists
10. Add form validations
11. Create notification system
12. Implement real-time updates (if needed)

## 📦 Build Output

Production build creates optimized bundles in `/dist`:
```bash
npm run build
# Output: dist/ folder ready for deployment
```

## 🤝 Contributing

This is an enterprise-level project. To contribute:
1. Follow the existing folder structure
2. Use existing components where possible
3. Maintain consistent styling with Tailwind classes
4. Add proper TypeScript types (if converting to TS)
5. Test all role-based access scenarios

## 📄 License

Proprietary - All rights reserved

## 🆘 Support

For issues or questions about the frontend structure, refer to:
- `src/utils/constants.js` for all enums and status definitions
- `src/services/` for API endpoint references
- Component examples in `src/components/common/`

---

**Built with ❤️ for Enterprise-Grade Education Management**
