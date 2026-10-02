import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence } from "framer-motion";
import {
  ArrowUpRight,
  Check,
  Copy,
  Download,
  Facebook,
  Github,
  LoaderCircle,
  Mail,
  Linkedin,
  Twitter,
} from "lucide-react";
import { siteConfig } from "../config";
import { Modal, Reveal, SectionHeading } from "./UI";

export function SocialLinks({ contactHref = "#contact" }) {
  const [show, setShow] = useState(false);
  const close = useCallback(() => setShow(false), []);
  return (
    <>
      <div className="social-links">
        {[
          [Github, "GitHub", siteConfig.github],
          [Facebook, "Facebook", siteConfig.facebook],
          ...(siteConfig.twitter
            ? [[Twitter, "Twitter", siteConfig.twitter]]
            : []),
          ...(siteConfig.linkedin
            ? [[Linkedin, "LinkedIn", siteConfig.linkedin]]
            : []),
        ].map(([Icon, name, url]) =>
          url ? (
            <a
              key={name}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`NetCode on ${name}`}
            >
              <Icon size={18} />
            </a>
          ) : (
            <button
              key={name}
              aria-label={`${name} profile information`}
              onClick={() => setShow(true)}
            >
              <Icon size={18} />
            </button>
          ),
        )}
      </div>
      <AnimatePresence>
        {show && (
          <Modal title="Let's connect" onClose={close}>
            <p className="modal-description">
              Our social profiles are being updated. In the meantime, use the
              project form to tell us what you'd like to build.
            </p>
            <a
              className="button button-primary"
              href={contactHref}
              onClick={close}
            >
              Start a conversation
              <ArrowUpRight size={17} />
            </a>
          </Modal>
        )}
      </AnimatePresence>
    </>
  );
}

const initialValues = {
  name: "",
  email: "",
  company: "",
  type: "",
  message: "",
};
function validate(values) {
  const errors = {};
  if (values.name.trim().length < 2)
    errors.name = "Please enter your name (at least 2 characters).";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim()))
    errors.email = "Please enter a valid email address.";
  if (!values.type) errors.type = "Please select a project type.";
  if (values.message.trim().length < 20)
    errors.message = "Tell us a little more (at least 20 characters).";
  return errors;
}

export default function Contact() {
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const formRef = useRef(null);
  const controller = useRef(null);
  useEffect(() => () => controller.current?.abort(), []);
  const close = useCallback(() => {
    controller.current?.abort("dialog-closed");
    setOpen(false);
    setSubmitting(false);
    setResult(null);
    setCopied(false);
  }, []);
  const brief = `NetCode — Project Inquiry\n\nName: ${values.name.trim()}\nEmail: ${values.email.trim()}\nCompany: ${values.company.trim() || "Not provided"}\nProject type: ${values.type}\n\n${values.message.trim()}`;
  const change = (event) => {
    const { name, value } = event.target;
    setValues((previous) => ({ ...previous, [name]: value }));
    if (errors[name])
      setErrors((previous) => ({ ...previous, [name]: undefined }));
    setSubmitError("");
  };
  const submit = async (event) => {
    event.preventDefault();
    const nextErrors = validate(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      formRef.current.elements[Object.keys(nextErrors)[0]]?.focus();
      return;
    }
    if (!siteConfig.contactEndpoint) {
      setResult("brief");
      return;
    }
    setSubmitting(true);
    setSubmitError("");
    const request = new AbortController();
    controller.current = request;
    const timeout = setTimeout(() => request.abort(), 15000);
    try {
      const response = await fetch(siteConfig.contactEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(
          Object.fromEntries(
            Object.entries(values).map(([key, value]) => [key, value.trim()]),
          ),
        ),
        signal: request.signal,
      });
      if (!response.ok) throw new Error("Unable to send");
      if (!request.signal.aborted) {
        setResult("sent");
        setValues(initialValues);
      }
    } catch {
      if (
        request.signal.reason !== "dialog-closed" &&
        controller.current === request
      ) {
        setSubmitError(
          "Your message could not be sent. Please try again, or save a copy of your brief. Your details are still here.",
        );
      }
    } finally {
      clearTimeout(timeout);
      if (controller.current === request) setSubmitting(false);
    }
  };
  const download = () => {
    const url = URL.createObjectURL(
      new Blob([brief], { type: "text/plain;charset=utf-8" }),
    );
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "netcode-project-brief.txt";
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(brief);
      setCopied(true);
    } catch {
      download();
    }
  };
  const fieldProps = (name) => ({
    id: `contact-${name}`,
    name,
    value: values[name],
    onChange: change,
    "aria-invalid": Boolean(errors[name]),
    "aria-describedby": errors[name] ? `${name}-error` : undefined,
  });
  const error = (name) =>
    errors[name] && (
      <span className="field-error" id={`${name}-error`}>
        {errors[name]}
      </span>
    );
  return (
    <section id="contact" className="section contact-section">
      <div className="contact-glow" aria-hidden="true" />
      <div className="container contact-cta">
        <SectionHeading
          number="06"
          label="YOUR NEXT CHAPTER STARTS HERE"
          title={
            <>
              Let's Build
              <br />
              Something <span className="accent-text">Great.</span>
            </>
          }
        >
          Have an idea for a website, application, or piso wifi? Let's transform
          your idea into a powerful digital solution.
        </SectionHeading>
        <Reveal className="inquire-action">
          <button
            type="button"
            className="button button-primary inquire-button"
            aria-haspopup="dialog"
            onClick={() => setOpen(true)}
          >
            Inquire
            <ArrowUpRight size={20} />
          </button>
          <p className="inquire-note">
            <span className="status-dot" />
            Great things begin with a simple hello.
          </p>
        </Reveal>
      </div>
      <AnimatePresence>
        {open && (
          <Modal
            title={
              result
                ? result === "sent"
                  ? "Thanks for reaching out."
                  : "Your project brief is ready."
                : "Tell us about your idea."
            }
            onClose={close}
            className="inquiry-modal"
            focusKey={result}
          >
            {!result ? (
              <form
                ref={formRef}
                onSubmit={submit}
                noValidate
                className="contact-form"
              >
                <p className="form-intro">
                  A few details are all we need to get started.
                </p>
                <div className="form-row">
                  <div className="field">
                    <label htmlFor="contact-name">
                      Name <span>*</span>
                    </label>
                    <input
                      {...fieldProps("name")}
                      placeholder="Your name"
                      autoComplete="name"
                      required
                      maxLength={100}
                    />
                    {error("name")}
                  </div>
                  <div className="field">
                    <label htmlFor="contact-email">
                      Email <span>*</span>
                    </label>
                    <input
                      {...fieldProps("email")}
                      type="email"
                      placeholder="you@company.com"
                      autoComplete="email"
                      required
                      maxLength={254}
                    />
                    {error("email")}
                  </div>
                </div>
                <div className="field">
                  <label htmlFor="contact-company">
                    Company / Organization{" "}
                    <span className="optional">(optional)</span>
                  </label>
                  <input
                    {...fieldProps("company")}
                    placeholder="Where you make things happen"
                    autoComplete="organization"
                    maxLength={150}
                  />
                </div>
                <div className="field">
                  <label htmlFor="contact-type">
                    Project Type <span>*</span>
                  </label>
                  <select {...fieldProps("type")} required>
                    <option value="" disabled>
                      Select a project type
                    </option>
                    <option>Web Development</option>
                    <option>Web Application Development</option>
                    <option>Custom Software Development</option>
                    <option>UI/UX Design</option>
                    <option>System Development</option>
                    <option>Database Development</option>
                    <option>Something else</option>
                  </select>
                  {error("type")}
                </div>
                <div className="field">
                  <label htmlFor="contact-message">
                    Message <span>*</span>
                  </label>
                  <textarea
                    {...fieldProps("message")}
                    placeholder="What's on your mind? Tell us a little about your project, goals, and ideas…"
                    rows={4}
                    required
                    maxLength={5000}
                  />
                  {error("message")}
                </div>
                {submitError && (
                  <div className="submit-error" role="alert">
                    {submitError}
                    <button type="button" onClick={download}>
                      Save your brief
                      <Download size={15} />
                    </button>
                  </div>
                )}
                <button
                  className="button button-primary submit-button"
                  disabled={submitting}
                  type="submit"
                >
                  {submitting ? (
                    <>
                      Sending
                      <LoaderCircle className="spin" size={18} />
                    </>
                  ) : (
                    <>
                      Send Message
                      <ArrowUpRight size={18} />
                    </>
                  )}
                </button>
                <p className="form-privacy">
                  {siteConfig.contactEndpoint
                    ? "Your details are used only to respond to your inquiry."
                    : "Your details stay in this browser until you choose to share your brief."}
                </p>
              </form>
            ) : (
              <>
                <div className="detail-icon">
                  <Check size={28} />
                </div>
                <p className="modal-description">
                  {result === "sent"
                    ? "Your message has been sent. We're looking forward to learning more about your idea."
                    : "Message delivery is not connected yet, so your details have not been sent. Save your brief to share with NetCode."}
                </p>
                {result === "brief" && (
                  <>
                    <div className="brief-summary">
                      <strong>{values.name}</strong>
                      <span>{values.type}</span>
                      <p>{values.message}</p>
                    </div>
                    <div className="modal-actions">
                      <button
                        className="button button-primary"
                        onClick={download}
                      >
                        Download brief
                        <Download size={17} />
                      </button>
                      <button
                        className="button button-secondary"
                        onClick={copy}
                      >
                        {copied ? "Copied" : "Copy brief"}
                        {copied ? <Check size={16} /> : <Copy size={16} />}
                      </button>
                      {siteConfig.email && (
                        <a
                          className="arrow-link"
                          href={`mailto:${siteConfig.email}?subject=${encodeURIComponent(`Project inquiry: ${values.type}`)}&body=${encodeURIComponent(brief)}`}
                        >
                          Open email draft
                          <Mail size={16} />
                        </a>
                      )}
                    </div>
                  </>
                )}
              </>
            )}
          </Modal>
        )}
      </AnimatePresence>
    </section>
  );
}
