import { advantages } from "../data";
import { Reveal, SectionHeading } from "./UI";

export default function WhyChooseUs() {
  return (
    <section id="why-us" className="section why-section">
      <div className="container">
        <SectionHeading
          number="05"
          label="THE NETCODE DIFFERENCE"
          title={
            <>
              Why Choose
              <br />
              <span className="muted-heading">NetCode?</span>
            </>
          }
        >
          Why Choose NetCode? Because how we build matters just as much as what
          we build.
        </SectionHeading>
        <div className="advantage-grid">
          {advantages.map(([Icon, title, description], index) => (
            <Reveal key={title} delay={(index % 4) * 0.06}>
              <article className="advantage-card">
                <div className="advantage-icon">
                  <Icon size={20} strokeWidth={1.75} />
                </div>
                <h3>{title}</h3>
                <p>{description}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
