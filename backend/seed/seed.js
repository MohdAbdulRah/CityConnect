// seedStuff.js
const mongoose = require("mongoose");
const Stuff = require("../models/Stuff"); // adjust path if needed
require("dotenv").config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/CityConnect")
  .then(() => console.log("MongoDB Connected for seeding"))
  .catch(err => console.error("Connection error:", err));

// Your real donor IDs
const donor1 = "69315043e7dee1adaaa36d97";
const donor2 = "6931507ce7dee1adaaa36d9d";

// Alternate between the two donors
const freeItems = [
  {
    title: "Old Study Table",
    description: "Solid teak wood study table, minor scratches, perfect for students",
    image: "https://images.unsplash.com/photo-1594623930572-300a401b4d2e?w=800",
    location: "Andheri West, Mumbai",
    owner: donor1,
  },
  {
    title: "Baby Stroller (6 months old)",
    description: "Chicco stroller in excellent condition, includes rain cover and mosquito net",
    image: "https://images.unsplash.com/photo-1616433992780-4f70e0b2f017?w=800",
    location: "Bandra East, Mumbai",
    owner: donor2,
  },
  {
    title: "Ikea Bookshelf",
    description: "White Billy bookcase 80x202cm, assembled, no damage",
    image: "https://images.unsplash.com/photo-1591122929797-efc302b00e61?w=800",
    location: "Juhu, Mumbai",
    owner: donor1,
  },
  {
    title: "Fridge (Working Condition)",
    description: "LG 260L double door frost-free fridge, 3 years old, works perfectly",
    image: "https://images.unsplash.com/photo-1571175443880-0c71d24a0c6d?w=800",
    location: "Powai, Mumbai",
    owner: donor2,
  },
  {
    title: "Kids Bicycle (Age 5-8)",
    description: "Hero Blast cycle with training wheels and bell, red color",
    image: "https://images.unsplash.com/photo-1558618666-f7e6e1c4e9df?w=800",
    location: "Malad West, Mumbai",
    owner: donor1,
  },
];

async function seed() {
  try {
    // Optional: Remove old seed data (uncomment if you want fresh start)
    // await Stuff.deleteMany({ title: { $in: freeItems.map(i => i.title) } });
    // console.log("Old seed data cleared");

    const created = await Stuff.insertMany(freeItems);
    console.log("5 items seeded successfully!");
    created.forEach(item => {
      console.log(`"${item.title}" → ${item.location} (Owner: ${item.owner})`);
    });
  } catch (error) {
    console.error("Seeding failed:", error.message);
  } finally {
    mongoose.connection.close();
    console.log("Seed complete & connection closed");
  }
}

seed();