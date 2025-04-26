import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import FoodHome from './foodHome';
import DriverRegister from './DriverRegister';
import CustomerRegister from './CustomerRegister';
import CustomerLogin from './CustomerLogin';
import RestaurantRegister from './restaurantregister';
import RestaurantLogin from './restaurantLogin';
import FoodItemsPage from './foodItemsPage';
import OrdersPage from './OrdersPage';
import DriversHomePage from './DriversHomePage';
import DriverLogin from './DriverLogin';

import PaymentWithStripe from './payment';

import CustomerHome from './CustomerHome';
import Orders from './customernavigationpages/Orders';
import ViewOrders from './customernavigationpages/ViewOrders';
import EditProfile from './customernavigationpages/EditProfile';
import Viewitems from './customernavigationpages/viewitems';

import Foodadd2 from './Foodadd2';











function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<FoodHome />} />
        <Route path="/driver-register" element={<DriverRegister />} />
        <Route path="/restaurant-register" element={<RestaurantRegister />} />
        <Route path="/restaurant-login" element={<RestaurantLogin />} />
        <Route path="/food-items" element={<FoodItemsPage />} />
        <Route path="/orderpage" element={<OrdersPage />} />
        <Route path="/driver-home" element={<DriversHomePage />} />
        <Route path="/driver-login" element={<DriverLogin />} />

        <Route path="/checkout"  element={<PaymentWithStripe orderId="12345" amount={1000} />} />

        <Route path="/customerRegister" element={<CustomerRegister />} />
        <Route path="/customerlogin" element={<CustomerLogin />} />
        <Route path="/customerregister" element={<CustomerRegister />} />
        <Route path="/customerHome/*" element={<CustomerHome />} />
        <Route path="/orderss" element={<Orders />} />
        <Route path="/viewOrders" element={<ViewOrders />} />
        <Route path="/editProfile/*" element={<EditProfile />} />
        <Route path="/foodadd2" element={<Foodadd2 />} />
        <Route path="/viewitems" element={<Viewitems />} />








      </Routes>
    </Router>
  );
}

export default App;
