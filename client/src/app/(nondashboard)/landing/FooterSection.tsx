"use client";
import Link from "next/link";
import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFacebook,
  faInstagram,
  faTwitter,
  faLinkedin,
  faYoutube,
} from "@fortawesome/free-brands-svg-icons";

const FooterSection = () => {
  return (
    <footer className="bg-black text-gray-300 py-16">
      <div className="max-w-6xl mx-auto px-6 sm:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center border-b border-gray-700 pb-6">
          <div className="mb-4 md:mb-0">
            <Link href="/" className="text-xl font-semibold hover:text-white" scroll={false}>
              RENTAL
            </Link>
          </div>

          <nav className="mb-4 md:mb-0">
            <ul className="flex flex-wrap justify-center md:justify-start space-x-4 md:space-x-6 text-sm">
              <li>
                <Link href="https://portfolio-kxhf.onrender.com/" className="hover:text-white">About Us</Link>
              </li>
              <li>
                <Link href="https://portfolio-kxhf.onrender.com/" className="hover:text-white">Contact Us</Link>
              </li>
              <li>
                <Link href="/" className="hover:text-white">FAQ</Link>
              </li>
              <li>
                <Link href="/" className="hover:text-white">Terms</Link>
              </li>
              <li>
                <Link href="/" className="hover:text-white">Privacy</Link>
              </li>
            </ul>
          </nav>

          <div className="flex space-x-4 mb-4 md:mb-0">
            <a href="#" aria-label="Facebook" className="hover:text-white transition-colors">
              <FontAwesomeIcon icon={faFacebook} className="h-5 w-5" />
            </a>
            <a href="#" aria-label="Instagram" className="hover:text-white transition-colors">
              <FontAwesomeIcon icon={faInstagram} className="h-5 w-5" />
            </a>
            <a href="#" aria-label="Twitter" className="hover:text-white transition-colors">
              <FontAwesomeIcon icon={faTwitter} className="h-5 w-5" />
            </a>
            <a href="#" aria-label="Linkedin" className="hover:text-white transition-colors">
              <FontAwesomeIcon icon={faLinkedin} className="h-5 w-5" />
            </a>
            <a href="#" aria-label="Youtube" className="hover:text-white transition-colors">
              <FontAwesomeIcon icon={faYoutube} className="h-5 w-5" />
            </a>
          </div>
        </div>

        <div className="mt-6 text-center text-xs sm:text-sm flex flex-col sm:flex-row justify-center items-center gap-2 sm:gap-4 text-gray-400">
          <span>© RENTAL. All rights reserved.</span>
          <Link href="/privacy" className="hover:text-white">Privacy Policy</Link>
          <Link href="/terms" className="hover:text-white">Terms of Service</Link>
          <Link href="/cookies" className="hover:text-white">Cookie Policy</Link>
        </div>
      </div>
    </footer>
  );
};

export default FooterSection;
