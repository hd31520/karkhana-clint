# Karkhana.shop - Frontend

React + Vite frontend for the **Karkhana.shop** business management platform. This application provides modern, role-based dashboards for factories, shops, showrooms, and small-to-medium business operations.

---

## Tech Stack

- **React 19** (with React Compiler)
- **Vite** (build tool)
- **React Router v6** (routing)
- **Tailwind CSS 4** (styling)
- **Radix UI** + **Tailwind Merge** (accessible components)
- **TanStack Query v5** (server state & data fetching)
- **Redux Toolkit** + **RTK Query** (global state)
- **Axios** (HTTP client)
- **Recharts** (data visualization)
- **TypeScript** (type safety)
- **Firebase** (optional - auth, storage, notifications)
- **date-fns** & **react-hot-toast**

---

## Features

### Authentication
- Secure login & registration
- Password reset & recovery flow
- Email verification
- Worker invitation completion (`/complete-registration/:token`)
- Password setup for invited users
- Protected routes with role-based access control

### Role-Based Access
The platform supports **six roles** with granular permissions:

| Role              | Description                              |
|-------------------|------------------------------------------|
| `admin`           | Platform-wide management                 |
| `owner`           | Full company control                     |
| `manager`         | Operational & team management            |
| `group_leader`    | Team supervision                         |
| `sales_executive` | Sales, orders & customer management      |
| `worker`          | Limited access (attendance, tasks)       |

### Core Modules

| Module                  | Key Features |
|-------------------------|--------------|
| **Dashboard**           | Stats cards, charts, quick actions, recent activity |
| **Company Workspace**   | Switch between companies, create new, profile management |
| **Worker Management**   | CRUD, attendance tracking, invitation system |
| **Role Management**     | Custom roles, permission matrix |
| **Products & Inventory**| Catalog, variants, stock in/out, barcode support, low-stock alerts |
| **Sales & POS**         | Fast order entry, memo/bill generation, customer dues |
| **Salary & Payroll**    | Salary calculation, payment register, salary slips |
| **Reports**             | Daily/monthly reports, P&L, export to Excel/PDF |
| **Subscriptions**       | Plan selection, billing history, payment gateway integration |
| **Admin Panel**         | System-wide user & company management |

---

## Project Structure

```bash
client/
├── public/                     # Static assets (favicon, images, etc.)
├── src/
│   ├── assets/                 # Images, icons, svgs
│   ├── components/
│   │   ├── auth/               # Login, Register, Forgot Password, etc.
│   │   ├── layout/             # Sidebar, Header, Navbar, Protected Layout
│   │   ├── ui/                 # Reusable Radix + Tailwind components
│   │   └── [module]/           # Feature-specific components (workers, sales, etc.)
│   ├── contexts/               # AuthContext, CompanyContext
│   ├── hooks/                  # Custom hooks (useAuth, useCompany, usePermission, etc.)
│   ├── lib/
│   │   ├── api.js              # Axios instance
│   │   ├── roleUtils.js        # Role & permission helpers
│   │   └── utils.js            # General utilities
│   ├── pages/                  # Page components (one per major route)
│   ├── store/                  # Redux slices & store configuration
│   ├── styles/                 # Global CSS & Tailwind imports
│   ├── types/                  # TypeScript interfaces & enums
│   ├── App.jsx                 # Root component with routing
│   └── main.jsx
├── index.html
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── .env.example
└── package.json

Route Map
Public Routes






RoutePurpose/Landing / Marketing page/loginUser login/registerNew user registration/forgot-passwordPassword reset request/reset-passwordReset password form/complete-registration/:tokenWorker invitation completion/set-passwordInitial password setup/payments/resultPayment success/failure page
Protected Routes (Role-based)








RoutePurpose/dashboardMain dashboard/dashboard/company-selectCompany switcher / creation/dashboard/profileUser profile & settings/dashboard/workersWorker list & management/dashboard/workers/:id/attendanceIndividual attendance details/dashboard/rolesRole & permission management/dashboard/productsProduct catalog/dashboard/products/:idProduct details/dashboard/inventoryStock management/dashboard/salesSales & POS system/dashboard/customersCustomer management/dashboard/salaryPayroll & salary/dashboard/reportsBusiness reports & analytics/dashboard/settingsCompany settings
Admin Routes (Super Admin only)







RoutePurpose/adminAdmin dashboard/admin/usersPlatform user management/admin/companiesCompany management/admin/settingsSystem settings

Environment Variables
Copy .env.example to .env and fill in the values:
env# Backend API
VITE_API_URL=http://localhost:5000/api

# Firebase (Optional)
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_MEASUREMENT_ID=
VITE_FIREBASE_DATABASE_URL=
VITE_FIREBASE_VAPID_KEY=

# Image Upload
VITE_IMGBB_API_KEY=

# Optional
VITE_APP_NAME=Karkhana.shop
Note: All environment variables must be prefixed with VITE_

Development
Install Dependencies
Bashnpm install
Run Development Server
Bashnpm run dev
Build for Production
Bashnpm run build
Preview Production Build
Bashnpm run preview

Key Dependencies








PackagePurpose@tanstack/react-queryServer state management@reduxjs/toolkitGlobal state managementreact-router-domRoutingaxiosHTTP requestsrechartsCharts & graphs@radix-ui/*Accessible UI primitivestailwindcssStylingdate-fnsDate manipulationreact-hot-toastToast notificationslucide-reactBeautiful icons

API Integration
The frontend uses a centralized Axios instance located at src/lib/api.js.
JavaScriptimport api from '../lib/api';

// Example usage
const response = await api.get('/products');
const response = await api.post('/sales', orderData);
Base URL is taken from VITE_API_URL and falls back to /api in production.

Notes

Role-based navigation and protection is handled via roleUtils.js and ProtectedRoute component.
Current company context is provided globally via CompanyContext.
Firebase services (Auth, Storage, Messaging) are optional and can be disabled.
Image uploads use ImgBB (or your preferred service).
The project follows a clean, scalable architecture suitable for growing business platforms.