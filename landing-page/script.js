const waitlistForms = document.querySelectorAll("[data-waitlist-form]");

function saveWaitlistEmail(email) {
  const savedEmails = JSON.parse(localStorage.getItem("quintWaitlist") || "[]");
  const normalizedEmail = email.trim().toLowerCase();

  if (!savedEmails.includes(normalizedEmail)) {
    savedEmails.push(normalizedEmail);
    localStorage.setItem("quintWaitlist", JSON.stringify(savedEmails));
  }

  return normalizedEmail;
}

waitlistForms.forEach((form) => {
  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const formData = new FormData(form);
    const email = formData.get("email");
    const status = form.querySelector("[data-form-status]");

    if (!email) {
      return;
    }

    const savedEmail = saveWaitlistEmail(email);
    form.reset();

    if (status) {
      status.textContent = `${savedEmail} is on the waitlist.`;
    }
  });
});
