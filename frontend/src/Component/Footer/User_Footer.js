import React, { useState } from 'react';
import { MapPin, Phone, Mail, } from 'lucide-react';
function UFooter() {
  return (
    <div className="UFooter">
        <footer className="bg-gray-800 text-white py-8 md:py-12">
        <div className="container mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 px-4">
          <div className="mb-6 md:mb-0">
            <h4 className="text-lg md:text-xl font-bold mb-4">Contact Information</h4>
            <div className="space-y-2">
              <p className="flex items-center text-sm md:text-base">
                <MapPin className="mr-2" size={18} /> 
                Brgy 3 Municipal Hinigaran
              </p>
              <p className="flex items-center text-sm md:text-base">
                <Phone className="mr-2" size={18} /> 
                (555) 123-4567
              </p>
              <p className="flex items-center text-sm md:text-base">
                <Mail className="mr-2" size={18} /> 
                contact @Hinigaran Municipal Hall
              </p>
            </div>
          </div>
          <div className="mb-6 md:mb-0">
            <h4 className="text-lg md:text-xl font-bold mb-4">Quick Links</h4>
            <div className="space-y-2">
              <a href="#" className="text-sm md:text-base hover:text-blue-300 block">Home</a>
              <a href="#" className="text-sm md:text-base hover:text-blue-300 block">Request Document</a>
              <a href="#" className="text-sm md:text-base hover:text-blue-300 block">Track Status</a>
              <a href="#" className="text-sm md:text-base hover:text-blue-300 block">Login</a>
            </div>
          </div>
          <div>
            <h4 className="text-lg md:text-xl font-bold mb-4">Follow Us</h4>
            <div className="flex space-x-4">
              
            </div>
          </div>
        </div>
        <div className="text-center mt-6 md:mt-8 border-t border-gray-700 pt-4 text-sm md:text-base">
          © 2025 Municipality Services. All Rights Reserved.
        </div>
      </footer>

    </div>
  );
}

export default UFooter;
