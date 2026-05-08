import { Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Home from "./components/homePage";
import Movies from "./components/Movies";
import { MovieSection } from "./components/MovieSection";

import "./App.css";

function App() {
  return (
    <Routes>

      {/* HOME PAGE */}
      <Route
        path="/"
        element={
          <>
            <Navbar />

            <div className="mt-10 flex justify-center">
              <div className="w-full max-w-[1300px] px-6">
                <Home />
                <Movies />
              </div>
            </div>
          </>
        }
      />

      {/* MOVIES PAGE */}
      <Route
        path="/movies"
        element={
          <>
            <Navbar />

            <div className="mt-10">
              <MovieSection />
            </div>
          </>
        }
      />

    </Routes>
  );
}

export default App;