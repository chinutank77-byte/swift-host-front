"use client";

import { useState } from "react";
import NeumorphicSelect from "@/components/shared/NeumorphicSelect";

const SUPPORT_EMAIL = "support@swiftmail.com";

const subjectOptions = [
  { value: "Billing", label: "Billing" },
  { value: "Technical", label: "Technical" },
  { value: "Account", label: "Account" },
  { value: "Other", label: "Other" },
];

export default function ContactForm() {
  const [form, setForm] = useState({ name: "", email: "", subject: "Technical", message: "" });

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    const body = `Name: ${form.name}\nEmail: ${form.email}\n\n${form.message}`;
    const mailto = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(form.subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailto;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-text mb-1">Name</label>
        <input id="name" name="name" type="text" required value={form.name} onChange={handleChange}
          className="w-full px-4 py-2.5 nm-input text-text text-sm placeholder:text-muted"
          placeholder="Your name" />
      </div>
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-text mb-1">Email</label>
        <input id="email" name="email" type="email" required value={form.email} onChange={handleChange}
          className="w-full px-4 py-2.5 nm-input text-text text-sm placeholder:text-muted"
          placeholder="you@example.com" />
      </div>
      <div>
        <label className="block text-sm font-medium text-text mb-1">Subject</label>
        <NeumorphicSelect
          options={subjectOptions}
          value={form.subject}
          onChange={(val) => setForm((prev) => ({ ...prev, subject: val }))}
          ariaLabel="Subject"
        />
      </div>
      <div>
        <label htmlFor="message" className="block text-sm font-medium text-text mb-1">Message</label>
        <textarea id="message" name="message" required rows={4} value={form.message} onChange={handleChange}
          className="w-full px-4 py-3 nm-input text-text text-sm placeholder:text-muted resize-none"
          placeholder="How can we help?" />
      </div>

      <button type="submit"
        className="w-full nm-btn-accent py-2.5 px-4 text-sm font-medium">
        Send message
      </button>
    </form>
  );
}
