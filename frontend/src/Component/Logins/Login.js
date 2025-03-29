import React from "react";

const Login = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <div className="h-[650px] w-[600px] flex bg-white rounded-lg overflow-hidden shadow-lg">
        {/* Left Side - Image */}
        <div className="w-1/2 hidden md:block">
          <img
            src="/img/Logpic.png"
            alt="Hinigaran Municipal Building"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Right Side - Login Form */}
        <div className="w-1/2 bg-blue-900 text-white flex flex-col items-center justify-center p-8">
          <img src="/img/logo.png" alt="Official Seal" className="w-25 h-25 mb-4" />
          <h2 className="text-2xl font-bold mb-6">Log in</h2>
          <form className="w-full max-w-sm">
            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium">
                Email:
              </label>
              <input
                type="email"
                id="email"
                className="w-full px-3 py-2 text-gray-900 rounded-lg focus:outline-none"
                placeholder="Enter your email"
                required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="password" className="block text-sm font-medium">
                Password:
              </label>
              <input
                type="password"
                id="password"
                className="w-full px-3 py-2 text-gray-900 rounded-lg focus:outline-none"
                placeholder="Enter your password"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-white text-blue-900 py-2 rounded-lg font-bold hover:bg-gray-200"
            >
              Log in
            </button>
            <div className="flex justify-between text-sm mt-4">
              <a href="#" className="text-white hover:underline">
                Sign up
              </a>
              <a href="#" className="text-white hover:underline">
                Forgot Password?
              </a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
