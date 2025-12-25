import React, { useEffect, useState } from "react";
import "./CSS/ShopCategory.css";
import dropdown_icon from "../Components/Assets/dropdown_icon.png";
import Item from "../Components/Item/Item";
import { backend_url } from "../App";

const ShopCategory = ({ category }) => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetch(`${backend_url}/allproducts`)
      .then(res => res.json())
      .then(data => {
        const filtered = data.filter(item => item.category === category);
        setProducts(filtered);
      });
  }, [category]);

  return (
    <div className="shopcategory">
      <div className="shopcategory-products">
        {products.map((item) => (
          <Item
            key={item.id}
            id={item.id}
            name={item.name}
            image={item.image}
            new_price={item.new_price}
            old_price={item.old_price}
          />
        ))}
      </div>
    </div>
  );
};

export default ShopCategory;
