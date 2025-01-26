import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'


// This is the login page
function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="flex items-center justify-center bg-gray-800 text-white">
      <div className="w-88 p-6 bg-gray-800 rounded-2xl text-center">
        
        {/* Logo */}
        <img 
          src="https://i.ibb.co/Lx1BwNp/move-3-no-bg.png" 
          alt="Move Logo" 
          className="mx-auto w-64 animate-fadeIn"
        />

        {/* Welcome Message */}
        <div className="p-4 bg-gray-700 rounded-lg animate-fadeIn">
          <h2 className="text-lg font-semibold">
            Welcome to <span className="text-purple-200 text-2xl">move</span>
          </h2>
          <p className="text-sm text-gray-300 mt-2">
            The social media app where you can answer the question <br />
            <span className="italic">“what’s the move.”</span>
          </p>
          <p className="text-sm text-gray-400 mt-3">
            Post itineraries of your hangouts or look at others' itineraries for inspiration!
          </p>
        </div>

        {/* Login Button */}
        <button className="w-full mt-6 py-2 bg-black text-white font-bold rounded-lg hover:bg-gray-700 transition animate-fadeIn-2">
          Log In
        </button>

        {/* Sign Up Link */}
        <p className="mt-4 text-sm text-gray-400">
          or <a href="#" className="text-purple-300 underline hover:text-purple-500">Sign Up</a> for a new account
        </p>
      </div>
    </div>
  )
}

export default App
