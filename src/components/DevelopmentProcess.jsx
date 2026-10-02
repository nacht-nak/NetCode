import { useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import { ArrowRight, Check } from "lucide-react";
import { process } from "../data";
import { Reveal, SectionHeading } from "./UI";

export default function DevelopmentProcess() {
  const [active, setActive] = useState(0);
  const ref = useRef(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 85%", "end 60%"],
  });
  const scaleX = useTransform(scrollYProgress, [0, 1], [0, 1]);
  return (
    <section id="process" ref={ref} className="section process-section">
      <div className="container">
        <div className="section-top">
          <SectionHeading
            number="04"
            label="FROM POSSIBILITY TO PRODUCT"
            title={
              <>
                How We Build<span className="accent-period">.</span>
              </>
            }
          >
            A clear process. Open communication. Better outcomes.
          </SectionHeading>
          <Reveal className="section-side-note">
            Great software doesn't happen by accident. Here's how we make it
            happen, together.
          </Reveal>
        </div>
        <Reveal>
          <div
            className="process-tabs"
            role="tablist"
            aria-label="Development process"
          >
            <div className="process-line">
              <motion.div style={{ scaleX: reduced ? 1 : scaleX }} />
            </div>
            {process.map(([name], index) => (
              <button
                role="tab"
                id={`process-tab-${index}`}
                aria-selected={active === index}
                aria-controls="process-panel"
                tabIndex={active === index ? 0 : -1}
                key={name}
                onClick={() => setActive(index)}
                onKeyDown={(event) => {
                  let next;
                  if (event.key === "ArrowRight")
                    next = (index + 1) % process.length;
                  if (event.key === "ArrowLeft")
                    next = (index + process.length - 1) % process.length;
                  if (event.key === "Home") next = 0;
                  if (event.key === "End") next = process.length - 1;
                  if (next !== undefined) {
                    event.preventDefault();
                    setActive(next);
                    document.getElementById(`process-tab-${next}`)?.focus();
                  }
                }}
                className={`process-tab ${active === index ? "active" : ""}`}
              >
                <span className="step-number">0{index + 1}</span>
                <span>{name}</span>
              </button>
            ))}
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              id="process-panel"
              role="tabpanel"
              aria-labelledby={`process-tab-${active}`}
              className="process-panel"
              key={active}
              initial={reduced ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <div className="process-big-number">
                0{active + 1}
                <span>/ 06</span>
              </div>
              <div className="process-detail">
                <div className="eyebrow">
                  {process[active][0].toUpperCase()}
                </div>
                <h3>{process[active][1]}</h3>
                <p>{process[active][2]}</p>
              </div>
              <div className="process-outcome">
                <span>WHAT YOU GET</span>
                <div>
                  <Check size={17} />
                  {process[active][3]}
                </div>
                <button
                  onClick={() => {
                    const next = (active + 1) % process.length;
                    setActive(next);
                    document.getElementById(`process-tab-${next}`)?.focus();
                  }}
                  className="arrow-link"
                >
                  {active === 5
                    ? "Back to the beginning"
                    : "Explore the next step"}
                  <ArrowRight size={16} />
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        </Reveal>
      </div>
    </section>
  );
}
