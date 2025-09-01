import React from "react";

const about = () => (
  <main className="container mx-auto px-4 py-12">
    <h1 className="text-4xl font-bold mb-4">About TravelMore</h1>
    <p className="text-lg mb-6">
      TravelMore is your companion for discovering new destinations and planning unforgettable journeys. Our mission is to make travel accessible, enjoyable, and memorable for everyone.
    </p>
    <section className="mb-8">
      <h2 className="text-2xl font-semibold mb-2">Our Story</h2>
      <p>
        Founded in 2024, TravelMore was created by passionate travelers who wanted to simplify trip planning and inspire others to explore the world. We believe that travel broadens horizons and connects people.
      </p>
    </section>
    <section>
      <h2 className="text-2xl font-semibold mb-2">Contact Us</h2>
      <p>
        Have questions or feedback? Reach out at <a href="mailto:info@travelmore.com" className="text-blue-600 underline">info@travelmore.com</a>.
      </p>
    </section>
  </main>
);

export default about;