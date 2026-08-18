import { Router } from "express";

const router = Router();

/* Registration intake.

   STUBBED ON PURPOSE: submissions are validated and logged, nothing is
   persisted or forwarded. Wiring a real destination (DB, email service, or a
   Google Sheet) is a decision for the client — see the TODO below. */

const TICKET_IDS = ["conference", "conference-gala", "gala", "charter"];

const isEmail = (v) => typeof v === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
const clean = (v) => (typeof v === "string" ? v.trim() : "");

export function validateRegistration(body = {}) {
  const errors = {};

  const firstName = clean(body.firstName);
  const lastName = clean(body.lastName);
  const email = clean(body.email);
  const phone = clean(body.phone);
  const organisation = clean(body.organisation);
  const role = clean(body.role);
  const ticket = clean(body.ticket);

  if (firstName.length < 2) errors.firstName = "Please enter your first name.";
  if (lastName.length < 2) errors.lastName = "Please enter your last name.";
  if (!isEmail(email)) errors.email = "Please enter a valid email address.";
  if (phone && phone.replace(/[^\d]/g, "").length < 7) errors.phone = "Please enter a valid phone number.";
  if (organisation.length < 2) errors.organisation = "Please enter your organisation.";
  if (ticket && !TICKET_IDS.includes(ticket)) errors.ticket = "Unknown ticket type.";
  if (body.consent !== true) errors.consent = "Please accept the privacy notice to continue.";

  return {
    valid: Object.keys(errors).length === 0,
    errors,
    value: { firstName, lastName, email, phone, organisation, role, ticket },
  };
}

router.post("/register", async (req, res) => {
  const { valid, errors, value } = validateRegistration(req.body);

  if (!valid) {
    return res.status(422).json({ ok: false, errors });
  }

  // TODO(backend): forward to the real destination once chosen.
  // Confirm with the client before wiring: DB row, transactional email,
  // or an append to a Google Sheet.
  console.log("[register]", new Date().toISOString(), JSON.stringify(value));

  return res.status(201).json({
    ok: true,
    message: "Thanks — your registration of interest has been received.",
  });
});

router.post("/partnership", async (req, res) => {
  const name = clean(req.body?.name);
  const email = clean(req.body?.email);
  const organisation = clean(req.body?.organisation);
  const errors = {};
  if (name.length < 2) errors.name = "Please enter your name.";
  if (!isEmail(email)) errors.email = "Please enter a valid email address.";
  if (organisation.length < 2) errors.organisation = "Please enter your organisation.";

  if (Object.keys(errors).length) return res.status(422).json({ ok: false, errors });

  // TODO(backend): same destination decision as /register.
  console.log("[partnership]", new Date().toISOString(), JSON.stringify({ name, email, organisation }));
  return res.status(201).json({ ok: true, message: "Thanks — we'll be in touch." });
});

export default router;
