import React from "react";

const SignUp = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <div className="relative w-[950px] h-[650px] bg-white rounded-lg overflow-hidden flex shadow-lg">
        {/* Left side with Background Image */}
        <div
          className="w-1/2 relative bg-cover bg-center"
          style={{
            backgroundImage: "url('/mnt/data/image.png')",
          }}
        >
          <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        </div>

        {/* Right side - Signup Form */}
        <div className="w-1/2 bg-blue-900 p-8 flex flex-col justify-center">
          <div className="flex justify-center mb-4">
            <img
              src="/img/logo.png"
              alt="Municipal Seal"
              className="w-[300px] h-[200px]"
            />
          </div>
          <h2 className="text-white text-center text-2xl font-bold mb-6">
            Sign up
          </h2>
          <form>
            <label className="text-white text-sm">Email:</label>
            <input
              type="email"
              className="w-full p-2 rounded-md mb-3 outline-none"
              placeholder="Enter your email"
            />
            <label className="text-white text-sm">Password:</label>
            <input
              type="password"
              className="w-full p-2 rounded-md mb-3 outline-none"
              placeholder="Enter your password"
            />
            <label className="text-white text-sm">Re-enter Password:</label>
            <input
              type="password"
              className="w-full p-2 rounded-md mb-3 outline-none"
              placeholder="Re-enter your password"
            />
            <button
              type="submit"
              className="w-full bg-white text-blue-900 p-2 rounded-md font-semibold hover:bg-gray-200"
            >
              Sign up
            </button>
          </form>
          <p className="text-center text-white text-sm mt-4">
            <a href="#" className="underline">Back to Log in</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
