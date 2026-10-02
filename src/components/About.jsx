import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "framer-motion";
import { ArrowUpRight, Check, Code2, GitBranch, Terminal } from "lucide-react";
import { Reveal, SectionHeading } from "./UI";
import Team from "./Team";

function Counter() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const reduced = useReducedMotion();
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!inView) return;
    if (reduced) {
      setValue(10);
      return;
    }
    let frame;
    const start = performance.now();
    const tick = (now) => {
      const progress = Math.min((now - start) / 1100, 1);
      setValue(Math.floor(10 * (1 - Math.pow(1 - progress, 3))));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView, reduced]);
  return <span ref={ref}>{value}+</span>;
}

export default function About() {
  return (
    <section id="about" className="section about-section">
      <div className="container">
        <div className="about-grid">
          <Reveal className="about-visual">
            <div className="workspace-ring" />
            <div className="workspace-label">
              <span className="status-dot" />A LITTLE CREATIVITY. A LOT OF
              CRAFT.
            </div>
            <div className="workspace-window">
              <div className="workspace-bar">
                <div className="window-dots">
                  <i />
                  <i />
                  <i />
                </div>
                <span>netcode / our-philosophy.tsx</span>
                <Code2 size={14} />
              </div>
              <div className="workspace-body">
                <div className="workspace-sidebar">
                  <Code2 size={21} />
                  <GitBranch size={19} />
                  <Terminal size={19} />
                </div>
                <div className="workspace-code">
                  <div>
                    <span>1</span>
                    <b>function</b> <em>buildSomethingGreat</em>() {"{"}
                  </div>
                  <div>
                    <span>2</span> <b>const</b> foundation = {"{"}
                  </div>
                  <div>
                    <span>3</span> purpose: <i>"People first"</i>,
                  </div>
                  <div>
                    <span>4</span> quality: <i>"Every detail matters"</i>,
                  </div>
                  <div>
                    <span>5</span> mindset: <i>"Always improving"</i>
                  </div>
                  <div>
                    <span>6</span> {"}"};
                  </div>
                  <div>
                    <span>7</span>
                  </div>
                  <div>
                    <span>8</span> <b>return</b> <em>craft</em>(yourIdea,
                    foundation);
                  </div>
                  <div>
                    <span>9</span>
                    {"}"}
                  </div>
                  <div className="code-caret">
                    <span>10</span>▌
                  </div>
                </div>
              </div>
              <div className="workspace-bottom">
                <span>
                  <GitBranch size={12} />
                  main
                </span>
                <span>
                  <Check size={12} />
                  All systems thoughtfully built
                </span>
                <span>TypeScript</span>
              </div>
            </div>
            <div className="workspace-badge">
              <span className="workspace-badge-icon">
                <Check size={18} />
              </span>
              <div>
                Made with purpose.<span>Built to make a difference.</span>
              </div>
            </div>
          </Reveal>
          <div className="about-copy">
            <SectionHeading
              number="03"
              label="THE PEOPLE BEHIND THE CODE"
              title={
                <>
                  About NetCode<span className="accent-period">.</span>
                  <br />
                  <span className="muted-heading">
                    Your vision. Our purpose.
                  </span>
                </>
              }
            />
            <span className="small-section-title">About NetCode</span>
            <Reveal>
              <p>
                NetCode Software Development Services is focused on transforming
                ideas into reliable and innovative digital solutions. We develop
                modern websites, web applications, customized systems, and
                software solutions designed around the needs of our clients.
              </p>
              <p>
                Our goal is to combine technology, creativity, and practical
                problem-solving to develop solutions that are functional,
                scalable, secure, and easy to use.
              </p>
              <a href="#team" className="arrow-link">
                Meet Our Team
                <ArrowUpRight size={17} />
              </a>
            </Reveal>
          </div>
        </div>
        <Reveal className="stats-row">
          <div className="stat">
            <strong>
              <Counter />
            </strong>
            <span>Projects Completed</span>
          </div>
          <div className="stat">
            <strong>
              Future-ready<span className="stat-dot">.</span>
            </strong>
            <span>Modern Technologies</span>
          </div>
          <div className="stat">
            <strong>
              Every screen<span className="stat-dot">.</span>
            </strong>
            <span>Responsive Solutions</span>
          </div>
          <div className="stat">
            <strong>
              You, first<span className="stat-dot">.</span>
            </strong>
            <span>Client-Focused Development</span>
          </div>
        </Reveal>
        <Team />
      </div>
    </section>
  );
}
