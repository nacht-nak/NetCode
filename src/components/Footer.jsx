import { Mail, MapPin, Phone } from "lucide-react";
import { services } from "../data";
import { siteConfig } from "../config";
import { Logo } from "./UI";
import { SocialLinks } from "./Contact";

export default function Footer({ homeHref = "" }) {
  const contactHref = `${homeHref}#contact`;
  const columns = [
    {
      title: "Services",
      links: services
        .slice(0, 4)
        .map((service) => [
          service.title
            .replace("Application Development", "Applications")
            .replace("Custom Software Development", "Custom Software"),
          `${homeHref}#service-${service.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
        ]),
    },
    {
      title: "Company",
      links: [
        ["About Us", `${homeHref}#about`],
        ["Our Team", `${homeHref}#team`],
        ["Services", `${homeHref}#services`],
        ["Contact", contactHref],
      ],
    },
    {
      title: "Resources",
      links: [
        ["All Projects", "./projects.html"],
        ["Technologies", `${homeHref}#technologies`],
        ["Our Process", `${homeHref}#process`],
        ["Why Choose Us", `${homeHref}#why-us`],
      ],
    },
  ];
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-main">
          <div className="footer-brand">
            <Logo footer href={`${homeHref}#home`} />
            <p>
              Crafting modern websites, applications, and custom software that
              help businesses move forward.
            </p>
            <address className="footer-contact">
              <a
                href={
                  siteConfig.email ? `mailto:${siteConfig.email}` : contactHref
                }
              >
                <Mail size={15} aria-hidden="true" />
                <span>{siteConfig.email || "Start a conversation"}</span>
              </a>
              {siteConfig.phone && (
                <a href={`tel:${siteConfig.phone.replace(/[^\d+]/g, "")}`}>
                  <Phone size={15} aria-hidden="true" />
                  <span>{siteConfig.phone}</span>
                </a>
              )}
              {siteConfig.location && (
                <span>
                  <MapPin size={15} aria-hidden="true" />
                  <span>{siteConfig.location}</span>
                </span>
              )}
            </address>
          </div>
          {columns.map(({ title, links }) => (
            <div className="footer-links" key={title}>
              <h3>{title}</h3>
              <nav aria-label={`Footer ${title.toLowerCase()}`}>
                {links.map(([label, href]) => (
                  <a href={href} key={label}>
                    {label}
                  </a>
                ))}
              </nav>
            </div>
          ))}
        </div>
        <div className="footer-bottom">
          <p>
            © 2026 NetCode Software Development Services. All rights reserved.
          </p>
          <SocialLinks contactHref={contactHref} />
        </div>
      </div>
    </footer>
  );
}
