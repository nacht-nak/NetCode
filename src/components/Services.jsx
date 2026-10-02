import { useCallback, useState } from "react";
import { AnimatePresence, useReducedMotion } from "framer-motion";
import { ArrowUpRight, Check } from "lucide-react";
import { services } from "../data";
import { ArrowLink, Modal, Reveal, SectionHeading } from "./UI";

export default function Services() {
  const [selected, setSelected] = useState(null);
  const reduced = useReducedMotion();
  const close = useCallback(() => setSelected(null), []);
  const tilt = (event) => {
    if (reduced || event.pointerType !== "mouse") return;
    const rect = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty(
      "--rx",
      `${-(event.clientY - rect.top - rect.height / 2) / 70}deg`,
    );
    event.currentTarget.style.setProperty(
      "--ry",
      `${(event.clientX - rect.left - rect.width / 2) / 70}deg`,
    );
    event.currentTarget.style.setProperty(
      "--glow-x",
      `${event.clientX - rect.left}px`,
    );
    event.currentTarget.style.setProperty(
      "--glow-y",
      `${event.clientY - rect.top}px`,
    );
  };
  return (
    <section id="services" className="section services-section">
      <div className="container">
        <div className="section-top">
          <SectionHeading
            number="01"
            label="WHAT WE DO"
            title={
              <>
                Our Services<span className="accent-period">.</span>
                <br />
                <span className="muted-heading">Your next advantage.</span>
              </>
            }
          >
            Digital solutions designed to turn ideas into powerful applications.
          </SectionHeading>
          <Reveal className="section-side-note">
            <span className="small-section-title">Our Services</span>From a
            first impression to your most complex workflow, we make technology
            work for you.
          </Reveal>
        </div>
        <div className="service-grid">
          {services.map((service, index) => (
            <Reveal delay={(index % 3) * 0.08} key={service.title}>
              <article
                id={`service-${service.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
                className="service-card"
                onPointerMove={tilt}
                onPointerLeave={(event) => {
                  event.currentTarget.style.setProperty("--rx", "0deg");
                  event.currentTarget.style.setProperty("--ry", "0deg");
                }}
              >
                <div className="service-card-top">
                  <span className="service-icon">
                    <service.icon size={24} strokeWidth={1.5} />
                  </span>
                  <span className="card-number">0{index + 1}</span>
                </div>
                <h3>{service.title}</h3>
                <p>{service.description}</p>
                <ArrowLink
                  onClick={() => setSelected(service)}
                  aria-label={`Learn more about ${service.title}`}
                >
                  Learn more
                </ArrowLink>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
      <AnimatePresence>
        {selected && (
          <Modal title={selected.title} onClose={close}>
            <div className="detail-icon">
              <selected.icon size={30} />
            </div>
            <p className="modal-description">{selected.detail}</p>
            <ul className="feature-list">
              {selected.features.map((feature) => (
                <li key={feature}>
                  <Check size={16} />
                  {feature}
                </li>
              ))}
            </ul>
            <a
              href="#contact"
              className="button button-primary"
              onClick={close}
            >
              Let's discuss your project
              <ArrowUpRight size={18} />
            </a>
          </Modal>
        )}
      </AnimatePresence>
    </section>
  );
}
