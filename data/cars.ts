// data/cars.ts
export interface Car {
  id: number;
  name: string;
  description: string;
  image: string;
  regularPriceWithoutDriver: number;
  exclusivePriceWithoutDriver: number;
  regularPriceWithDriver: number;
  exclusivePriceWithDriver: number;
  bookedDates: string[];
}

export const cars: Car[] = [
  {
    id: 1,
    name: "Toyota Avanza",
    description: "A reliable and spacious MPV, perfect for family trips around the city.",
    image: "/cars/avanza.jpg",
    regularPriceWithoutDriver: 350000,
    exclusivePriceWithoutDriver: 450000,
    regularPriceWithDriver: 500000,
    exclusivePriceWithDriver: 650000,
    bookedDates: ["2025-09-15", "2025-09-16", "2025-09-22"],
  },
  {
    id: 2,
    name: "Honda Brio",
    description: "A compact and fuel-efficient city car, ideal for couples or solo travelers.",
    image: "/cars/brio.png",
    regularPriceWithoutDriver: 300000,
    exclusivePriceWithoutDriver: 400000,
    regularPriceWithDriver: 450000,
    exclusivePriceWithDriver: 600000,
    bookedDates: ["2025-09-18", "2025-09-19", "2025-09-20"],
  },
  // ... other cars updated similarly
];