// data/cars.ts
export interface Car {
  id: number;
  name: string;
  description: string;
  image: string;
  priceWithoutDriver: number;
  priceWithDriver: number;
  bookedDates: string[]; // Dates in "YYYY-MM-DD" format
}

export const cars: Car[] = [
  {
    id: 1,
    name: "Toyota Avanza",
    description: "A reliable and spacious MPV, perfect for family trips around the city.",
    image: "/cars/avanza.jpg", // You'll need to add this image to your /public/cars folder
    priceWithoutDriver: 350000,
    priceWithDriver: 500000,
    bookedDates: ["2025-09-15", "2025-09-16", "2025-09-22"],
  },
  {
    id: 2,
    name: "Honda Brio",
    description: "A compact and fuel-efficient city car, ideal for couples or solo travelers.",
    image: "/cars/brio.png", // You'll need to add this image to your /public/cars folder
    priceWithoutDriver: 300000,
    priceWithDriver: 450000,
    bookedDates: ["2025-09-18", "2025-09-19", "2025-09-20"],
  },
  {
    id: 3,
    name: "Mitsubishi Xpander",
    description: "Stylish and comfortable with a modern design, great for a stylish getaway.",
    image: "/cars/xpander.jpg", // You'll need to add this image to your /public/cars folder
    priceWithoutDriver: 400000,
    priceWithDriver: 550000,
    bookedDates: ["2025-09-25", "2025-09-26"],
  },
  {
    id: 4,
    name: "Daihatsu Terios",
    description: "A tough and versatile SUV for exploring both city streets and adventurous terrains.",
    image: "/cars/terios.webp", // You'll need to add this image to your /public/cars folder
    priceWithoutDriver: 450000,
    priceWithDriver: 600000,
    bookedDates: ["2025-10-01", "2025-10-02", "2025-10-03"],
  },
];