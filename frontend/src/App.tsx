import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import DashboardLayout from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import PrivateRoute from './components/PrivateRoute';
import Dashboard from './pages/Dashboard';
import Recipes from './pages/Recipes';
import RecipeDetail from './pages/RecipeDetail';
import Ingredients from './pages/Ingredients';
import Orders from './pages/Orders';
import Import from './pages/Import';
import Profile from './pages/Profile';
import Pricing from './pages/Pricing';
import Calendar from './pages/Calendar';
import Expenses from './pages/Expenses';
import Mileage from './pages/Mileage';
import Reports from './pages/Reports';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<PrivateRoute />}>
            <Route path="/" element={<DashboardLayout />}>
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="recipes" element={<Recipes />} />
              <Route path="recipes/:id" element={<RecipeDetail />} />
              <Route path="ingredients" element={<Ingredients />} />
              <Route path="orders" element={<Orders />} />
              <Route path="import" element={<Import />} />
              <Route path="pricing" element={<Pricing />} />
              <Route path="calendar" element={<Calendar />} />
              <Route path="expenses" element={<Expenses />} />
              <Route path="mileage" element={<Mileage />} />
              <Route path="reports" element={<Reports />} />
              <Route path="profile" element={<Profile />} />
              <Route index element={<Navigate to="/dashboard" replace />} />
            </Route>
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}
