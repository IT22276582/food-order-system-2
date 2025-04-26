import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import FoodHome from './foodHome';
import DriverRegister from './DriverRegister';
import CustomerRegister from './CustomerRegister'; // Create this file
import Login from './login'; // Create this file
import RestaurantRegister from './restaurantregister';
import RestaurantLogin from './restaurantLogin';
import FoodItemsPage from './foodItemsPage';
import OrdersPage from './OrdersPage';
import DriversHomePage from './DriversHomePage';
import DriverLogin from './DriverLogin';
import PaymentWithStripe from './payment';





function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<FoodHome />} />
        <Route path="/driver-register" element={<DriverRegister />} />
        <Route path="/Login" element={<Login />} />
        <Route path="/restaurant-register" element={<RestaurantRegister />} />
        <Route path="/restaurant-login" element={<RestaurantLogin />} />
        <Route path="/food-items" element={<FoodItemsPage />} />
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/driver-home" element={<DriversHomePage />} />
        <Route path="/driver-login" element={<DriverLogin />} />
        <Route
            path="/checkout"
            element={<PaymentWithStripe orderId="12345" amount={1000} />}
          />




      </Routes>
    </Router>
  );
}

export default App;
