import { useState } from "react";
import NavBar from "./components/Navbar";
import Hero from "./components/Hero";
import About from "./components/About";
import Features from "./components/Features";
import Story from "./components/Story";
import Contact from "./components/Contact";
import Footer from "./components/Footer";
import Designer from "./components/Designer";

function App() {
  const [showDesigner, setShowDesigner] = useState(false);

  return (
    <main className="relative min-h-screen w-screen overflow-x-hidden bg-black text-white">
      <NavBar />

      {showDesigner ? (
        <Designer onClose={() => setShowDesigner(false)} />
      ) : (
        <>
          <Hero onOpenDesigner={() => setShowDesigner(true)} />
          <About />
          <Features />
          <Story />

          <Contact />
          <Footer />
        </>
      )}
    </main>
  );
}

export default App;

