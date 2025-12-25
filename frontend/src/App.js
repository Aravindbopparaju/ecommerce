import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./Components/Navbar/Navbar";
import Shop from "./Pages/Shop";
import ShopCategory from "./Pages/ShopCategory";
import Product from "./Pages/Product";
import Cart from "./Pages/Cart";
import LoginSignup from "./Pages/LoginSignup";
import Footer from "./Components/Footer/Footer";

// 🌍 BACKEND URL + CURRENCY
export const backend_url = "https://ecommerce-backend-kitz.onrender.com";
export const currency = "₹";

const App = () => {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Shop />} />
        <Route path="/men" element={<ShopCategory category="men" />} />
        <Route path="/women" element={<ShopCategory category="women" />} />
        <Route path="/kids" element={<ShopCategory category="kid" />} />
        <Route path="/product/:productId" element={<Product />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/login" element={<LoginSignup />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  );
};

export default App;
