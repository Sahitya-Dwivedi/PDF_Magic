import React from "react";

function About() {
  return (
    <div className="flex-1">
      <div className="container mx-auto px-6 py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold mb-8 text-center">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500">
              About PDF Magic
            </span>
          </h1>

          <div className="bg-gray-800/60 backdrop-blur-sm rounded-xl p-8 shadow-xl mb-12">
            <h2 className="text-2xl font-bold mb-4 text-purple-300">Our Mission</h2>
            <p className="text-gray-300 mb-6 leading-relaxed">
              At PDF Magic, we believe that working with PDFs should be simple, intuitive, 
              and accessible to everyone. Our mission is to provide powerful PDF tools that 
              will make document management effortless, helping you focus on what matters most.
            </p>
            <p className="text-gray-300 leading-relaxed">
              Whether you're a student, professional, or small business owner, our upcoming suite of 
              PDF tools is designed to streamline your workflow and enhance productivity.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <div className="bg-gray-800/60 backdrop-blur-sm rounded-xl p-8 shadow-xl transition-all hover:shadow-purple-500/20">
              <h2 className="text-2xl font-bold mb-4 text-purple-300">Our Story</h2>
              <p className="text-gray-300 leading-relaxed">
                PDF Magic began when I faced my own struggles with 
                complex PDF software. I realized there was a need for intuitive, accessible 
                tools that didn't require technical expertise or premium subscriptions. 
                Born from frustration but built with passion, this project aims to transform 
                how people interact with PDFs. Currently in development, I'm crafting a 
                solution that will make PDF manipulation truly magical.
              </p>
            </div>

            <div className="bg-gray-800/60 backdrop-blur-sm rounded-xl p-8 shadow-xl transition-all hover:shadow-purple-500/20">
              <h2 className="text-2xl font-bold mb-4 text-purple-300">Our Values</h2>
              <ul className="text-gray-300 space-y-2">
                <li className="flex items-start">
                  <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-full p-1 mr-3 mt-1">
                    <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 8 8">
                      <circle cx="4" cy="4" r="3"/>
                    </svg>
                  </div>
                  <span>Simplicity in design and function</span>
                </li>
                <li className="flex items-start">
                  <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-full p-1 mr-3 mt-1">
                    <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 8 8">
                      <circle cx="4" cy="4" r="3"/>
                    </svg>
                  </div>
                  <span>Privacy and security for your documents</span>
                </li>
                <li className="flex items-start">
                  <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-full p-1 mr-3 mt-1">
                    <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 8 8">
                      <circle cx="4" cy="4" r="3"/>
                    </svg>
                  </div>
                  <span>Innovation in PDF technology</span>
                </li>
                <li className="flex items-start">
                  <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-full p-1 mr-3 mt-1">
                    <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 8 8">
                      <circle cx="4" cy="4" r="3"/>
                    </svg>
                  </div>
                  <span>Accessibility for all users</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default About;
