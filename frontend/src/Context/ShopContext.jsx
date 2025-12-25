import React, { createContext, useEffect, useState } from "react";

export const ShopContext = createContext(null);

// 🌍 LIVE BACKEND URL
const BACKEND_URL = "https://ecommerce-backend-kitz.onrender.com";

const ShopContextProvider = (props) => {
  const [allProducts, setAllProducts] = useState([]);
  const [cartItems, setCartItems] = useState({});

  // ---------------- FETCH ALL PRODUCTS ----------------
  useEffect(() => {
    fetch(`${BACKEND_URL}/allproducts`)
      .then((res) => res.json())
      .then((data) => setAllProducts(data))
      .catch((err) => console.error(err));
  }, []);

  // ---------------- FETCH CART DATA ----------------
  useEffect(() => {
    const token = localStorage.getItem("auth-token");
    if (!token) return;

    fetch(`${BACKEND_URL}/getcart`, {
      method: "POST",
      headers: {
        "auth-token": token,
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => setCartItems(data))
      .catch((err) => console.error(err));
  }, []);

  // ---------------- ADD TO CART ----------------
  const addToCart = (itemId) => {
    setCartItems((prev) => ({
      ...prev,
      [itemId]: (prev[itemId] || 0) + 1,
    }));

    const token = localStorage.getItem("auth-token");
    if (!token) return;

    fetch(`${BACKEND_URL}/addtocart`, {
      method: "POST",
      headers: {
        "auth-token": token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ itemId }),
    });
  };

  // ---------------- REMOVE FROM CART ----------------
  const removeFromCart = (itemId) => {
    setCartItems((prev) => ({
      ...prev,
      [itemId]: prev[itemId] - 1,
    }));

    const token = localStorage.getItem("auth-token");
    if (!token) return;

    fetch(`${BACKEND_URL}/removefromcart`, {
      method: "POST",
      headers: {
        "auth-token": token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ itemId }),
    });
  };

  // ✅ ---------------- TOTAL CART ITEMS (FIX) ----------------
  const getTotalCartItems = () => {
    let total = 0;
    for (const item in cartItems) {
      if (cartItems[item] > 0) {
        total += cartItems[item];
      }
    }
    return total;
  };

  // ---------------- CONTEXT VALUE ----------------
  const contextValue = {
    allProducts,
    cartItems,
    addToCart,
    removeFromCart,
    getTotalCartItems, // ✅ IMPORTANT
  };

  return (
    <ShopContext.Provider value={contextValue}>
      {props.children}
    </ShopContext.Provider>
  );
};

export default ShopContextProvider;
