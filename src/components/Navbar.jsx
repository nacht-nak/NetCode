import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { navigation } from "../data";
import { Logo } from "./UI";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState("home");
  const [open, setOpen] = useState(false);
  const reduced = useReducedMotion();
  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 30);
      const position = window.scrollY + window.innerHeight * 0.3;
      let current = "home";
      navigation.forEach(([id]) => {
        const section = document.getElementById(id);
        if (section && section.offsetTop <= position) current = id;
      });
      setActive(current);
    };
    const onResize = () => {
      if (window.innerWidth > 1000) setOpen(false);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, []);
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);
  const links = navigation.map(([id, label]) => (
    <a
      key={id}
      href={`#${id}`}
      aria-current={active === id ? "location" : undefined}
      className={active === id ? "active" : ""}
      onClick={() => setOpen(false)}
    >
      {label}
    </a>
  ));
  return (
    <header className={`navbar ${scrolled ? "navbar-scrolled" : ""}`}>
      <div className="container nav-inner">
        <Logo />
        <nav className="desktop-nav" aria-label="Main navigation">
          {links}
        </nav>
        <a className="nav-cta" href="#contact">
          Let's talk
          <ArrowUpRight size={16} />
        </a>
        <button
          className="menu-button icon-button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="mobile-navigation"
          onClick={() => setOpen(!open)}
        >
          {open ? <X /> : <Menu />}
        </button>
      </div>
      <AnimatePresence>
        {open && (
          <motion.nav
            id="mobile-navigation"
            aria-label="Mobile navigation"
            className="mobile-nav"
            initial={reduced ? false : { opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            {links}
            <a
              href="#contact"
              onClick={() => setOpen(false)}
              className="mobile-talk"
            >
              Start a conversation <ArrowUpRight size={18} />
            </a>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
