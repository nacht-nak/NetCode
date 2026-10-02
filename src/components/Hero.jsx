import { Component, lazy, Suspense, useEffect, useState } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import {
  ArrowDown,
  ArrowUpRight,
  Check,
  Code2,
  Github,
  Sparkles,
} from "lucide-react";
import { Reveal } from "./UI";

const ThreeDScene = lazy(() => import("./ThreeDScene"));
class SceneBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.props.onError?.();
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

export function CubeFallback() {
  return (
    <div className="cube-fallback" aria-hidden="true">
      <div className="css-cube">
        <div className="cube-face front" />
        <div className="cube-face right" />
        <div className="cube-face top" />
        <div className="cube-face back" />
        <div className="cube-face left" />
        <div className="cube-face bottom" />
      </div>
    </div>
  );
}

export default function Hero() {
  const reduced = useReducedMotion();
  const { scrollY } = useScroll();
  const auraY = useTransform(scrollY, [0, 850], [0, 180]);
  const visualY = useTransform(scrollY, [0, 850], [-12, 65]);
  const [canRender, setCanRender] = useState(false);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const query = window.matchMedia("(min-width: 768px)");
    const update = () => {
      if (reduced || !query.matches) {
        setCanRender(false);
        setReady(false);
        return;
      }
      try {
        const canvas = document.createElement("canvas");
        const context =
          canvas.getContext("webgl2") || canvas.getContext("webgl");
        setCanRender(Boolean(context));
        context?.getExtension("WEBGL_lose_context")?.loseContext();
      } catch {
        setCanRender(false);
      }
    };
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, [reduced]);
  return (
    <section id="home" className="hero">
      <div className="hero-grid" aria-hidden="true" />
      <motion.div
        className="hero-aura"
        aria-hidden="true"
        style={{ y: reduced ? 0 : auraY }}
      />
      <div className="container hero-main">
        <div className="hero-copy">
          <Reveal>
            <div className="availability">
              <span className="status-dot" />A small team. A world of
              possibilities.
              <ArrowUpRight size={13} />
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <h1>
              NetCode
              <span>
                Software Development
                <br className="desktop-break" /> Services
                <span className="accent-period">.</span>
              </span>
            </h1>
          </Reveal>
          <Reveal delay={0.18}>
            <h2>
              Building Digital Solutions.
              <br />
              Crafting Better Experiences.
            </h2>
            <p className="hero-description">
              We turn ambitious ideas into reliable, scalable software.
              Thoughtfully designed. Expertly developed. Built around you.
            </p>
          </Reveal>
          <Reveal className="hero-actions" delay={0.25}>
            <a href="#project" className="button button-primary">
              Explore Our Projects
              <ArrowUpRight size={18} />
            </a>
            <a href="#contact" className="button button-secondary">
              Contact Us
              <ArrowUpRight size={18} />
            </a>
          </Reveal>
          <Reveal className="hero-assurances" delay={0.32}>
            <span>
              <Check size={13} />
              Built for your business
            </span>
            <span>
              <Check size={13} />
              Designed for real people
            </span>
          </Reveal>
        </div>
        <motion.div
          className="hero-visual"
          style={{ y: reduced ? 0 : visualY }}
          initial={reduced ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          role="img"
          aria-label="An interactive, floating three-dimensional coding cube surrounded by technology panels"
        >
          <div className="visual-orbit orbit-one" />
          <div className="visual-orbit orbit-two" />
          <div
            className={`fallback-layer ${ready && canRender ? "scene-ready" : ""}`}
          >
            <CubeFallback />
          </div>
          {canRender && (
            <SceneBoundary onError={() => setReady(false)}>
              <Suspense fallback={null}>
                <ThreeDScene onReady={() => setReady(true)} />
              </Suspense>
            </SceneBoundary>
          )}
          <div className="floating-chip react-chip">
            <span className="react-symbol">⚛</span>
            <span>
              React<span className="chip-caption">Built for interaction</span>
            </span>
          </div>
          <div className="floating-chip code-chip">
            <Code2 size={18} />
            <span>Ideas → reality</span>
            <span className="mini-dot" />
          </div>
          <div className="floating-chip stack-chip">
            <span className="stack-icon laravel">L</span>
            <span className="stack-icon javascript">JS</span>
            <span className="stack-icon python">Py</span>
            <span className="stack-icon php">php</span>
            <span className="stack-icon mysql">My</span>
            <Github size={19} />
          </div>
          <div className="floating-terminal">
            <div className="terminal-top">
              <div className="window-dots">
                <i />
                <i />
                <i />
              </div>
              <span>the-next-big-thing.js</span>
              <Code2 size={13} />
            </div>
            <div className="terminal-code">
              <span className="line-number">01</span>
              <span>
                <b>const</b> idea = <em>yourVision</em>;
              </span>
              <span className="line-number">02</span>
              <span>
                <b>const</b> solution = <em>craft</em>(idea);
              </span>
              <span className="line-number">03</span>
              <span>
                <i>// Let's build something great.</i>
              </span>
            </div>
            <div className="terminal-status">
              <span className="status-dot" />
              Ready to bring ideas to life
              <Sparkles size={12} />
            </div>
          </div>
          <div className="visual-caption">
            <span className="tiny-cross">+</span>PRECISION IN EVERY PIXEL
            <span className="tiny-cross">+</span>
          </div>
        </motion.div>
      </div>
      <div className="container hero-bottom">
        <a href="#services" className="scroll-cue">
          <span className="scroll-circle">
            <ArrowDown size={16} />
          </span>
          Scroll to explore
        </a>
        <span className="hero-bottom-note">
          From the first idea to the final line of code.
        </span>
        <span className="hero-coordinate">DESIGN. DEVELOP. DELIVER.</span>
      </div>
    </section>
  );
}
