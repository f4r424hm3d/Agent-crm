# Quick Start Guide - UniAdmit CRM

## 🚀 Get Started in 5 Minutes

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Create `.env` file (already created):
```env
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=UniAdmit CRM
```

### 3. Start Development Server
```bash
npm run dev
```

The app will run at: **http://localhost:5173**

---

## 🔑 Default Login (Mock Data)

Since this is frontend-only, you can test the UI by temporarily bypassing authentication:

### Option 1: Use Mock Login
The login page is ready. To test without backend:

1. Open `src/pages/auth/Login.jsx`
2. Temporarily modify the `handleSubmit` function to bypass API:

```javascript
const handleSubmit = async (e) => {
  e.preventDefault();
  
  // Mock successful login
  const mockResponse = {
    user: {
      _id: '1',
      name: 'Admin User',
      email: formData.email,
      role: formData.role,
    },
    token: 'mock-jwt-token-' + Date.now(),
  };
  
  dispatch(loginSuccess(mockResponse));
  navigate('/dashboard');
};
```

### Option 2: Direct Navigation
For quick testing, you can temporarily remove the auth check:

1. Open `src/components/route/ProtectedRoute.jsx`
2. Comment out the authentication check:

```javascript
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  // const { isAuthenticated, user } = useSelector((state) => state.auth);

  // Temporary: Allow all access for testing
  return children;
  
  // if (!isAuthenticated) {
  //   return <Navigate to="/login" replace />;
  // }
  // ...
};
```

---

## 📱 Test Different Roles

Once logged in (or bypassing auth), you can test different role views:

### Super Admin View
- Full access to all modules
- Audit Logs visible
- Admin management

### Admin View
- Manage agents, universities, courses
- Approve applications
- Initiate payouts

### Agent View
- View assigned universities/courses
- Add students
- Submit applications
- Track earnings

### Student View
- View applications
- Track status
- Upload documents

---

## 🎨 Quick UI Testing Checklist

### Navigation
- [ ] Sidebar shows correct menu items per role
- [ ] Navbar includes notifications and user menu
- [ ] Mobile menu works (hamburger icon)

### Pages to Test
- [ ] `/dashboard` - Dashboard with stats and charts
- [ ] `/agents` - Agents list (placeholder)
- [ ] `/universities` - Universities list (placeholder)
- [ ] `/courses` - Courses list (placeholder)
- [ ] `/students` - Students list (placeholder)
- [ ] `/applications` - Applications list (placeholder)
- [ ] `/profile` - User profile

### Components
Test the component library at any page by importing and using them:

```javascript
import { Button, Input, Card, Modal, Badge, Alert } from '../components/common';

// Example usage
<Button variant="primary">Click Me</Button>
<Badge variant="success">Approved</Badge>
<Alert type="info" message="This is an info alert" />
```

---

## 🛠️ Quick Customization

### Change Brand Name
1. Edit `.env`:
```env
VITE_APP_NAME=Your Company Name
```

2. Edit `src/components/layout/Sidebar.jsx`:
```jsx
<h1 className="text-xl font-bold">Your Company Name</h1>
```

### Change Colors
Edit `tailwind.config.js`:
```javascript
colors: {
  primary: {
    500: '#your-color', // Main brand color
  },
  // ...
}
```

### Add a New Page

1. Create component in `src/pages/`:
```javascript
// src/pages/MyNewPage.jsx
import React from 'react';

const MyNewPage = () => {
  return (
    <div>
      <h1>My New Page</h1>
    </div>
  );
};

export default MyNewPage;
```

2. Add route in `src/App.jsx`:
```javascript
import MyNewPage from './pages/MyNewPage';

// Inside <Route path="/" element={<DashboardLayout />}>
<Route path="my-new-page" element={<MyNewPage />} />
```

3. Add to Sidebar menu in `src/components/layout/Sidebar.jsx`:
```javascript
const menuItems = [
  // ...
  { path: '/my-new-page', icon: FiStar, label: 'My New Page' },
];
```

---

## 🐛 Common Issues & Solutions

### Issue: "Cannot find module"
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Issue: Tailwind classes not working
```bash
# Restart dev server
# Press Ctrl+C, then:
npm run dev
```

### Issue: Routing not working
- Ensure you're using `<Link>` from react-router-dom, not `<a>` tags
- Check that routes are inside `<BrowserRouter>`

### Issue: Redux state not updating
- Check you're dispatching actions correctly
- Use Redux DevTools browser extension to debug
- Ensure store is wrapped in `<Provider>`

---

## 📚 Next Steps

### To Build Your First Feature:

**Example: Universities List Page**

1. **Create the List Page** (`src/pages/universities/UniversityList.jsx`):

```javascript
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Card, Table, Button, Badge } from '../../components/common';
import universityService from '../../services/universityService';
import { setUniversities, setLoading } from '../../store/slices/universitySlice';

const UniversityList = () => {
  const dispatch = useDispatch();
  const { universities, loading } = useSelector((state) => state.university);

  useEffect(() => {
    fetchUniversities();
  }, []);

  const fetchUniversities = async () => {
    dispatch(setLoading(true));
    try {
      const response = await universityService.getUniversities();
      dispatch(setUniversities(response));
    } catch (error) {
      console.error('Error fetching universities:', error);
    }
  };

  const columns = [
    { header: 'Name', accessor: 'name' },
    { header: 'Country', accessor: 'country' },
    { header: 'City', accessor: 'city' },
    {
      header: 'Status',
      render: (row) => (
        <Badge variant={row.status === 'active' ? 'success' : 'danger'}>
          {row.status}
        </Badge>
      ),
    },
    {
      header: 'Actions',
      render: (row) => (
        <Link to={`/universities/${row._id}`}>
          <Button size="sm">View</Button>
        </Link>
      ),
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1>Universities</h1>
        <Link to="/universities/new">
          <Button variant="primary">Add University</Button>
        </Link>
      </div>

      <Card>
        <Table columns={columns} data={universities} loading={loading} />
      </Card>
    </div>
  );
};

export default UniversityList;
```

2. **Test the page** at http://localhost:5173/universities

3. **Connect to real API** when backend is ready

4. **Add filters, search, pagination** as needed

---

## 🎓 Learn More

### Project Documentation
- `README.md` - Complete project overview
- `PROJECT_STATUS.md` - What's done, what's pending
- `src/utils/constants.js` - All enums and status definitions

### Key Files to Understand
- `src/App.jsx` - Routing structure
- `src/store/index.js` - Redux store
- `src/services/apiClient.js` - API configuration
- `tailwind.config.js` - Design system

### External Resources
- [React Docs](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Redux Toolkit](https://redux-toolkit.js.org)
- [React Router](https://reactrouter.com)
- [Recharts](https://recharts.org)

---

## 🎯 You're Ready!

The application is now running with:
- ✅ Professional UI components
- ✅ Role-based routing
- ✅ Redux state management
- ✅ API service layer
- ✅ Responsive layout
- ✅ Dashboard with charts

**Start building your features and connect to your backend API!**

Happy coding! 🚀
