import { useEffect } from "react";
import { MotionConfig, useReducedMotion } from "framer-motion";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Services from "./components/Services";
import Projects from "./components/Projects";
import About from "./components/About";
import CompletedWork from "./components/CompletedWork";
import DevelopmentProcess from "./components/DevelopmentProcess";
import WhyChooseUs from "./components/WhyChooseUs";
import Contact from "./components/Contact";
import Footer from "./components/Footer";

export default function App() {
  const reduced = useReducedMotion();
  useEffect(() => {
    const hash = window.location.hash;
    if (!hash) return;
    let cancelled = false;
    const scrollToSection = () => {
      if (cancelled || window.location.hash !== hash) return;
      document
        .getElementById(hash.slice(1))
        ?.scrollIntoView({ behavior: "instant" });
    };
    // Cross-page anchors can arrive before React has rendered their section.
    scrollToSection();
    document.fonts.ready.then(scrollToSection);
    return () => {
      cancelled = true;
    };
  }, []);
  return (
    <MotionConfig reducedMotion="user">
      <div className={reduced ? "app reduced-motion" : "app"}>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <Navbar />
        <main id="main">
          <Hero />
          <div className="belief-strip">
            <div className="container">
              <span>THOUGHTFUL BY DESIGN. POWERFUL BY DEVELOPMENT.</span>
              <div>
                <span>Ideas</span>
                <i>→</i>
                <span>Experiences</span>
                <i>→</i>
                <span>
                  Impact<span className="accent-period">.</span>
                </span>
              </div>
            </div>
          </div>
          <Services />
          <Projects />
          <About />
          <CompletedWork />
          <DevelopmentProcess />
          <WhyChooseUs />
          <Contact />
        </main>
        <Footer />
      </div>
    </MotionConfig>
  );
}
