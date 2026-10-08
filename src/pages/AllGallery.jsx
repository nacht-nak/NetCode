import { ArrowLeft, Images } from "lucide-react";
import { MotionConfig, useReducedMotion } from "framer-motion";
import { Logo, Reveal } from "../components/UI";
import Footer from "../components/Footer";
import WorkImage from "../components/WorkImage";
import { workGallery } from "../workGallery";

export default function AllGallery() {
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
            <a className="arrow-link" href="./index.html#completed-work">
              <ArrowLeft size={18} aria-hidden="true" /> Back to home
            </a>
          </div>
        </header>
        <main id="main">
          <section className="section all-projects-section">
            <div className="container">
              <Reveal className="project-gallery-heading">
                <div className="eyebrow">OUR IMAGE COLLECTION</div>
                <h1>
                  Gallery<span className="accent-period">.</span>
                </h1>
                <p>
                  Explore our work, achievements, and moments along the way.
                </p>
                <span className="project-collection-count">
                  {workGallery.length}{" "}
                  {workGallery.length === 1 ? "image" : "images"}
                </span>
              </Reveal>
              {workGallery.length > 0 ? (
                <div
                  className="work-gallery-grid"
                  role="list"
                  aria-label="Gallery images"
                >
                  {workGallery.map((item, index) => (
                    <div role="listitem" key={item.id ?? index}>
                      <WorkImage item={item} index={index} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="project-gallery-empty">
                  <Images size={32} aria-hidden="true" />
                  <h2>More moments coming soon.</h2>
                  <p>Check back for new photos and project highlights.</p>
                </div>
              )}
            </div>
          </section>
        </main>
        <Footer homeHref="./index.html" />
      </div>
    </MotionConfig>
  );
}
