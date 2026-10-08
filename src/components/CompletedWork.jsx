import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { workGallery } from "../workGallery";
import WorkImage from "./WorkImage";

export default function CompletedWork() {
  const carousel = useRef(null);
  const reduced = useReducedMotion();
  const [repeats, setRepeats] = useState(1);
  const [inView, setInView] = useState(false);
  const [visible, setVisible] = useState(() => !document.hidden);

  useEffect(() => {
    const element = carousel.current;
    if (!element || reduced) return;
    const slide = element.querySelector(".completed-work-slide");
    const group = element.querySelector(".completed-work-group");
    // Each half must fill the viewport for a gap-free animation loop.
    const measure = () => {
      const gap = parseFloat(getComputedStyle(group).columnGap) || 0;
      const collectionWidth =
        (slide.getBoundingClientRect().width + gap) * workGallery.length;
      setRepeats(Math.max(1, Math.ceil(element.clientWidth / collectionWidth)));
    };
    measure();
    const resizeObserver = new ResizeObserver(measure);
    resizeObserver.observe(element);
    resizeObserver.observe(slide);
    const intersectionObserver = new IntersectionObserver(([entry]) => {
      setInView(entry.isIntersecting);
    });
    intersectionObserver.observe(element);
    return () => {
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
    };
  }, [reduced]);

  useEffect(() => {
    const update = () => setVisible(!document.hidden);
    document.addEventListener("visibilitychange", update);
    return () => document.removeEventListener("visibilitychange", update);
  }, []);

  if (workGallery.length === 0) return null;

  const copies = reduced ? 1 : repeats;
  return (
    <section id="completed-work" className="completed-work-section">
<div className="container completed-work-actions">
  <a
    href="./gallery.html"
    style={{ textDecoration: "none" }}
    className="gallery-link"
  >
    See All Gallery •  </a>
</div>
      <div
        ref={carousel}
        role="region"
        aria-label="Completed projects"
        tabIndex={0}
        className={`completed-work-carousel ${reduced ? "completed-work-static" : ""} ${!inView || !visible ? "completed-work-paused" : ""}`}
        style={{ "--gallery-duration": `${workGallery.length * copies * 8}s` }}
      >
        <div className="completed-work-track">
          {Array.from({ length: reduced ? 1 : 2 }, (_, groupIndex) => (
            <div
              className="completed-work-group"
              key={groupIndex}
              aria-hidden={groupIndex > 0 ? true : undefined}
            >
              {Array.from({ length: copies }, (_, copyIndex) =>
                workGallery.map((item, index) => (
                  <div
                    className="completed-work-slide"
                    key={`${copyIndex}-${item.id ?? index}`}
                    aria-hidden={copyIndex > 0 ? true : undefined}
                  >
                    <WorkImage item={item} index={index} />
                  </div>
                )),
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
