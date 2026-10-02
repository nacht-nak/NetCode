import { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight, X } from "lucide-react";

export function Logo({ footer = false, href = "#home" }) {
  return (
    <a
      className={`logo ${footer ? "footer-logo" : ""}`}
      href={href}
      aria-label="NetCode home"
    >
      <span className="logo-mark" aria-hidden="true">
        <img src="/Nc.png" alt="" width="72" height="48" />
      </span>
      <span>
        NetCode<span className="logo-dot">.</span>
      </span>
    </a>
  );
}

export function Reveal({ children, className = "", delay = 0, ...props }) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduced ? false : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function SectionHeading({
  number,
  label,
  title,
  children,
  light = false,
}) {
  return (
    <Reveal className={`section-heading ${light ? "light-heading" : ""}`}>
      <div className="eyebrow">
        <span className="section-number">{number}</span>
        {label}
      </div>
      <h2>{title}</h2>
      {children && <p>{children}</p>}
    </Reveal>
  );
}

export function ArrowLink({
  children,
  href,
  onClick,
  className = "",
  ...props
}) {
  const Tag = href ? "a" : "button";
  return (
    <Tag
      href={href}
      onClick={onClick}
      className={`arrow-link ${className}`}
      {...props}
    >
      {children}
      <ArrowUpRight size={17} />
    </Tag>
  );
}

export function Modal({ title, children, onClose, className = "", focusKey }) {
  const ref = useRef(null);
  const id = useId();
  const reduced = useReducedMotion();
  useEffect(() => {
    const previous = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleKey = (event) => {
      if (event.key === "Escape") onClose();
      if (event.key === "Tab") {
        const focusables = [
          ...ref.current.querySelectorAll(
            'button, a[href], input, select, textarea, [tabindex="0"]',
          ),
        ].filter((el) => !el.disabled && el.getClientRects().length);
        const first = focusables[0],
          last = focusables.at(-1);
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        }
        if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }
    };
    document.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKey);
      previous?.focus({ preventScroll: true });
    };
  }, [onClose]);
  useEffect(() => {
    ref.current?.querySelector("button")?.focus();
  }, [focusKey]);
  return createPortal(
    <motion.div
      className="modal-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby={id}
        ref={ref}
        className={`modal ${className}`}
        initial={reduced ? false : { opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10 }}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="modal-header">
          <h2 id={id}>{title}</h2>
          <button
            className="icon-button"
            aria-label="Close dialog"
            onClick={onClose}
          >
            <X size={22} />
          </button>
        </div>
        {children}
      </motion.div>
    </motion.div>,
    document.body,
  );
}
