export const projectTypes = [
  "Web Development",
  "Web Application Development",
  "Custom Software Development",
  "UI/UX Design",
  "System Development",
  "Database Development",
  "Internet PisoWifi",
  "Something else",
];

// A single mailbox only: no display names, recipient lists, or header characters.
export function isEmail(value) {
  return (
    typeof value === "string" &&
    value.length <= 254 &&
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?)+$/.test(
      value,
    )
  );
}

export function validateContact(values) {
  const errors = {};
  const name = typeof values.name === "string" ? values.name.trim() : "";
  const email = typeof values.email === "string" ? values.email.trim() : "";
  const message =
    typeof values.message === "string" ? values.message.trim() : "";
  if (name.length < 2 || name.length > 100 || /[\r\n\x00]/.test(name))
    errors.name = "Please enter your name (2–100 characters).";
  if (!isEmail(email)) errors.email = "Please enter a valid email address.";
  if (
    values.company !== undefined &&
    (typeof values.company !== "string" ||
      values.company.trim().length > 150 ||
      /[\r\n\x00]/.test(values.company))
  )
    errors.company = "Please enter a company name of at most 150 characters.";
  if (!projectTypes.includes(values.type))
    errors.type = "Please select a project type.";
  if (message.length < 20 || message.length > 5000 || message.includes("\x00"))
    errors.message = "Tell us a little more (20–5,000 characters).";
  return errors;
}
