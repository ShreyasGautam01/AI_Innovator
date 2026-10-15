(() => {
  "use strict";
  const form = document.getElementById("interest-form");
  const submitButton = document.getElementById("submit-button");
  const submitLabel = document.getElementById("submit-label");
  const submitArrow = document.getElementById("submit-arrow");
  const status = document.getElementById("form-status");
  const successPanel = document.getElementById("success-panel");
  const reason = document.getElementById("fit_reason");
  const reasonCount = document.getElementById("reason-count");
  const consent = document.getElementById("consent");
  const config = window.APP_CONFIG || {};
  const fields = ["full_name", "email", "phone", "profile_url", "current_position", "fit_reason"];
  let submitting = false;

  function setStatus(message, type) {
    status.textContent = message;
    status.className = "form-status is-visible " + (type === "error" ? "is-error" : "is-info");
  }
  function clearStatus() { status.textContent = ""; status.className = "form-status"; }
  function showError(name, message) {
    const input = form.elements.namedItem(name);
    const output = document.getElementById(name + "-error");
    if (input && output) { input.setAttribute("aria-invalid", message ? "true" : "false"); output.textContent = message || ""; }
  }
  function validate(name) {
    const input = form.elements.namedItem(name);
    const value = input.value.trim();
    let message = "";
    if (!value) message = "This field is required.";
    else if (name === "full_name" && value.length < 2) message = "Please enter your full name.";
    else if (name === "email" && (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value) || value.length > 254)) message = "Enter a valid email address.";
    else if (name === "phone") {
      const digits = value.replace(/\D/g, "");
      if (!/^[+0-9() .-]+$/.test(value) || digits.length < 8 || digits.length > 15) message = "Enter a valid phone number, including country code if applicable.";
    } else if (name === "profile_url") {
      try { const url = new URL(value); if (!["https:", "http:"].includes(url.protocol) || !url.hostname.includes(".")) message = "Enter a complete LinkedIn or portfolio URL."; }
      catch (_) { message = "Enter a complete link starting with https://."; }
    } else if (name === "current_position" && value.length < 2) message = "Please tell us your current role.";
    else if (name === "fit_reason" && value.length < 30) message = "Please add a little more detail (at least 30 characters).";
    showError(name, message);
    return !message;
  }
  fields.forEach(name => {
    const input = form.elements.namedItem(name);
    input.addEventListener("blur", () => validate(name));
    input.addEventListener("input", () => { if (input.getAttribute("aria-invalid") === "true") validate(name); clearStatus(); });
  });
  reason.addEventListener("input", () => { reasonCount.textContent = reason.value.length + " / 2000"; });
  consent.addEventListener("change", () => {
    consent.setAttribute("aria-invalid", consent.checked ? "false" : "true");
    document.getElementById("consent-error").textContent = consent.checked ? "" : "Please confirm before submitting.";
    clearStatus();
  });
  function setSubmitting(value) {
    submitting = value; submitButton.disabled = value;
    submitLabel.textContent = value ? "Submitting…" : "Submit your interest";
    submitArrow.textContent = value ? "…" : "↗";
  }
  document.getElementById("another-response").addEventListener("click", () => {
    form.reset(); fields.forEach(name => showError(name, ""));
    consent.setAttribute("aria-invalid", "false"); document.getElementById("consent-error").textContent = "";
    reasonCount.textContent = "0 / 2000"; clearStatus(); successPanel.hidden = true; form.hidden = false;
    document.getElementById("full_name").focus();
  });

  form.addEventListener("submit", async event => {
    event.preventDefault();
    if (submitting) return;
    clearStatus();
    if (form.elements.namedItem("website").value.trim()) {
      form.hidden = true; successPanel.hidden = false; return;
    }
    let valid = true, firstInvalid = null;
    fields.forEach(name => { if (!validate(name)) { valid = false; firstInvalid ||= form.elements.namedItem(name); } });
    if (!consent.checked) {
      consent.setAttribute("aria-invalid", "true");
      document.getElementById("consent-error").textContent = "Please confirm before submitting.";
      valid = false; firstInvalid ||= consent;
    }
    if (!valid) { setStatus("Please check the highlighted fields and try again.", "error"); firstInvalid?.focus(); return; }
    if (!config.supabaseUrl || !config.supabasePublishableKey) { setStatus("The form is not configured yet. Please try again later.", "error"); return; }

    const payload = {
      full_name: form.elements.namedItem("full_name").value.trim(),
      email: form.elements.namedItem("email").value.trim().toLowerCase(),
      phone: form.elements.namedItem("phone").value.trim(),
      profile_url: form.elements.namedItem("profile_url").value.trim(),
      current_position: form.elements.namedItem("current_position").value.trim(),
      fit_reason: form.elements.namedItem("fit_reason").value.trim()
    };
    setSubmitting(true); setStatus("Sending your details securely…", "info");
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 12000);
    try {
      const url = config.supabaseUrl.replace(/\/$/, "") + "/rest/v1/innovator_interest_submissions";
      const response = await fetch(url, {
        method: "POST",
        headers: { "apikey": config.supabasePublishableKey, "Content-Type": "application/json", "Prefer": "return=minimal" },
        body: JSON.stringify(payload), signal: controller.signal
      });
      if (response.ok) {
        form.hidden = true; clearStatus(); successPanel.hidden = false;
        successPanel.setAttribute("tabindex", "-1"); successPanel.focus(); return;
      }
      let body = {}; try { body = await response.json(); } catch (_) {}
      if (response.status === 409 || body.code === "23505") setStatus("An interest form with this email has already been received. Please check the email address or contact the hiring team if you think this is an error.", "error");
      else if (response.status === 400) setStatus("Some details could not be accepted. Please review the fields and try again.", "error");
      else if (response.status === 401 || response.status === 403) setStatus("The submission service is not accepting requests right now. Please try again later.", "error");
      else setStatus("We couldn’t submit your details right now. Your entries are still here—please try again.", "error");
    } catch (error) {
      setStatus(error.name === "AbortError" ? "The request took too long. Please check your connection and retry. Your entries are still here." : "We couldn’t reach the submission service. Check your connection and try again; your entries are still here.", "error");
    } finally { window.clearTimeout(timeout); setSubmitting(false); }
  });
})();