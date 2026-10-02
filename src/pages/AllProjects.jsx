import { ArrowLeft } from "lucide-react";
import { MotionConfig, useReducedMotion } from "framer-motion";
import { Logo } from "../components/UI";
import Projects from "../components/Projects";
import Footer from "../components/Footer";

export default function AllProjects() {
  const reduced = useReducedMotion();
  return (
    <MotionConfig reducedMotion="user">
      <div className={reduced ? "app reduced-motion" : "app"}>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <header className="project-gallery-header">
          <div className="container">
            <Logo href="./index.html#home" />
            <a className="arrow-link" href="./index.html#project">
              <ArrowLeft size={18} /> Back to home
            </a>
          </div>
        </header>
        <main id="main">
          <Projects allProjects />
        </main>
        <Footer homeHref="./index.html" />
      </div>
    </MotionConfig>
  );
}
