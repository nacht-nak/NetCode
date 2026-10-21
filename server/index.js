import "./env.js";
import express from "express";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createContactApp } from "./app.js";

const dist = fileURLToPath(new URL("../dist/", import.meta.url));
if (!existsSync(`${dist}/index.html`)) {
  throw new Error("Build the website first with npm run build.");
}
const app = createContactApp();
app.use(express.static(dist));
const port = Number(process.env.PORT || 3000);
app.listen(port, "0.0.0.0", () => {
  console.log(`NetCode website and contact API running on port ${port}.`);
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    console.warn(
      "Email delivery needs GMAIL_USER and GMAIL_APP_PASSWORD in the server environment.",
    );
  }
});
