
import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import MenuItem from "./src/models/MenuItem.js";

const menuItems = [
  {
    name: "Espresso",
    description: "Rich freshly brewed espresso.",
    category: "Coffee",
    price: 100,
    image: "https://images.unsplash.com/photo-1510707577719-ae7c14805e3a",
    available: true
  },
  {
    name: "Cafe Latte",
    description: "Smooth espresso with steamed milk.",
    category: "Coffee",
    price: 170,
    image: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735",
    available: true
  },
  {
    name: "Cold Coffee",
    description: "Refreshing chilled creamy coffee.",
    category: "Cold Drinks",
    price: 190,
    image: "https://images.unsplash.com/photo-1517701604599-bb29b565090c",
    available: true
  },
  {
    name: "Masala Chai",
    description: "Indian tea with aromatic spices.",
    category: "Tea",
    price: 80,
    image: "https://images.unsplash.com/photo-1571934811356-5cc061b6821f",
    available: true
  },
  {
    name: "Butter Croissant",
    description: "Freshly baked buttery croissant.",
    category: "Bakery",
    price: 120,
    image: "https://images.unsplash.com/photo-1555507036-ab1f4038808a",
    available: true
  },
  {
    name: "Veg Sandwich",
    description: "Grilled sandwich with fresh vegetables.",
    category: "Food",
    price: 180,
    image: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af",
    available: true
  },
  {
    name: "Chocolate Brownie",
    description: "Rich chocolate brownie.",
    category: "Dessert",
    price: 150,
    image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c",
    available: true
  },
  {
    name: "Blueberry Cheesecake",
    description: "Creamy cheesecake with blueberry topping.",
    category: "Dessert",
    price: 210,
    image: "https://images.unsplash.com/photo-1533134242443-d4fd215305ad",
    available: true
  }
];

const seedDatabase = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MongoDB connection string missing in .env");
    }

    await mongoose.connect(process.env.MONGODB_URI);

    console.log("MongoDB connected successfully!");

    const existingItems = await MenuItem.find({}, "name");

    const existingNames = new Set(
      existingItems.map(item => item.name.toLowerCase())
    );

    const newItems = menuItems.filter(
      item => !existingNames.has(item.name.toLowerCase())
    );

    if (newItems.length === 0) {
      console.log("All menu items already exist!");
      return;
    }

    const result = await MenuItem.insertMany(newItems);

    console.log(`${result.length} menu items inserted successfully!`);

  } catch (error) {
    console.error("Error:", error.message);
    process.exitCode = 1;

  } finally {
    await mongoose.disconnect();
  }
};

seedDatabase();
