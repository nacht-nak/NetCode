import { useReducedMotion } from "framer-motion";
import { technologies } from "../data";
import { Reveal } from "./UI";

export default function Technologies() {
  const reduced = useReducedMotion();
  const cards = (duplicate = false) =>
    technologies.map(([name, glyph, color]) => (
      <div
        className="technology-card"
        key={name}
        aria-hidden={duplicate || undefined}
      >
        <span
          className={`technology-glyph tech-${name.toLowerCase().replaceAll(" ", "-")}`}
          style={{ "--tech-color": color }}
        >
          {glyph}
        </span>
        <span>{name}</span>
      </div>
    ));
  return (
    <section
      id="technologies"
      className="technologies-section"
      aria-labelledby="technology-heading"
    >
      <div className="container technology-heading">
        <Reveal>
          <div className="eyebrow">OUR TOOLKIT</div>
          <h2 id="technology-heading">
            Technologies We Use<span className="accent-period">.</span>
          </h2>
        </Reveal>
        <Reveal>
          <p>
            Modern tools. Solid foundations.
            <br />
            The right technology for your idea.
          </p>
        </Reveal>
      </div>
      <div className={`technology-marquee ${reduced ? "marquee-static" : ""}`}>
        <div className="technology-track">
          {cards()}
          {!reduced && cards(true)}
        </div>
      </div>
    </section>
  );
}
