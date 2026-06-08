const SUPABASE_URL = "YOUR_SUPABASE_URL";
const SUPABASE_ANON_KEY = "YOUR_SUPABASE_ANON_KEY";

const supabaseClient =
  typeof supabase !== "undefined" && SUPABASE_URL !== "YOUR_SUPABASE_URL"
    ? supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
    : null;

async function submitToWaitlist(email) {
  const normalized = email.trim().toLowerCase();

  if (supabaseClient) {
    const { error } = await supabaseClient
      .from("waitlist")
      .insert({ email: normalized });

    if (error) {
      if (error.code === "23505") {
        return { ok: true, alreadyJoined: true };
      }
      throw error;
    }
    return { ok: true, alreadyJoined: false };
  }

  // Fallback: localStorage while Supabase isn't configured yet
  const saved = JSON.parse(localStorage.getItem("quintWaitlist") || "[]");
  const alreadyJoined = saved.includes(normalized);
  if (!alreadyJoined) {
    saved.push(normalized);
    localStorage.setItem("quintWaitlist", JSON.stringify(saved));
  }
  return { ok: true, alreadyJoined };
}

const waitlistForms = document.querySelectorAll("[data-waitlist-form]");

waitlistForms.forEach((form) => {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = new FormData(form).get("email");
    const status = form.querySelector("[data-form-status]");
    const button = form.querySelector("button[type=submit]");

    if (!email) return;

    button.disabled = true;
    button.textContent = "Joining…";

    try {
      const { alreadyJoined } = await submitToWaitlist(email);
      form.reset();
      if (status) {
        status.textContent = alreadyJoined
          ? "You're already on the list — we'll be in touch."
          : `${email.trim().toLowerCase()} is on the waitlist.`;
      }
    } catch {
      if (status) {
        status.textContent = "Something went wrong. Please try again.";
      }
    } finally {
      button.disabled = false;
      button.textContent =
        button.closest(".waitlist-card") ? "Join waitlist" : "Request early access";
    }
  });
});
