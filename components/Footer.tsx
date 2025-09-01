import React from "react";

const Footer: React.FC = () => (
  <footer className="bg-gray-900 text-white py-8">
    <div className="max-w-6xl mx-auto flex flex-wrap justify-between items-start gap-8 px-4">
      {/* Logo + Description */}
      <div>
        <h2 className="text-xl font-bold">TravelMore</h2>
        <p className="mt-2 max-w-xs text-sm">
          Your trusted partner for unforgettable journeys and reliable car
          rentals. Explore the world with ease and comfort!
        </p>
      </div>

      {/* Quick Links */}
      <div>
        <h3 className="mb-2 font-semibold">Quick Links</h3>
        <ul className="space-y-1">
          <li>
            <a href="/destinations" className="hover:underline">
              Destinations
            </a>
          </li>
          <li>
            <a href="/car-rental" className="hover:underline">
              Car Rental
            </a>
          </li>
          <li>
            <a href="/about" className="hover:underline">
              About Us
            </a>
          </li>
          <li>
            <a href="/contact" className="hover:underline">
              Contact
            </a>
          </li>
        </ul>
      </div>



      {/* Contact Info */}
      <div>
        <h3 className="mb-2 font-semibold">Contact Us</h3>
        <p className="text-sm">
          Jl. Magelang - Yogyakarta No.71,
          <br />
          Mulungan Wetan, Sendangadi, Kec. Mlati,
          <br />
          Kabupaten Sleman, Daerah Istimewa Yogyakarta 55285
          <br />
          Phone:{" "}
          <a href="tel:+1234567890" className="hover:underline">
            +1 (234) 567-890
          </a>
          <br />
          Email:{" "}
          <a href="mailto:info@travelmore.com" className="hover:underline">
            info@travelmore.com
          </a>
        </p>
      </div>
    </div>

    {/* Bottom Bar */}
    <div className="border-t border-gray-700 mt-8 text-center py-4 text-sm">
      &copy; {new Date().getFullYear()} travelmore.travel All rights reserved.
    </div>
  </footer>
);

export default Footer;
