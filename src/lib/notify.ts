// Email delivery abstraction for deadline reminders.
//
// Without RESEND_API_KEY set, this logs to the server console instead of
// sending -- so the whole tracker/notification flow is runnable and
// demoable with zero external services. Resend was picked for the real
// integration because it has a simple single-endpoint REST API with a free
// tier; swap the fetch call below for SendGrid/SES/Postmark/etc. if you
// already use one of those.
export async function sendDeadlineReminder(
  email: string,
  name: string,
  scholarshipName: string,
  deadline: string,
  daysLeft: number,
  applyUrl: string
): Promise<{ sent: boolean; mode: "resend" | "dev-log" | "error" }> {
  const apiKey = process.env.RESEND_API_KEY;
  const subject = `${daysLeft} day${daysLeft === 1 ? "" : "s"} left: ${scholarshipName} closes ${deadline}`;
  const text = [
    `Hi ${name},`,
    ``,
    `Your tracked scholarship "${scholarshipName}" closes on ${deadline} -- that's ${daysLeft} day${daysLeft === 1 ? "" : "s"} away.`,
    ``,
    `Apply here: ${applyUrl}`,
    ``,
    `-- NextStep`,
  ].join("\n");

  if (!apiKey) {
    console.log(`[notify:dev-log] to=${email} subject="${subject}"`);
    return { sent: false, mode: "dev-log" };
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: process.env.NOTIFY_FROM_EMAIL || "NextStep <notifications@resend.dev>",
        to: email,
        subject,
        text,
      }),
    });
    return { sent: res.ok, mode: "resend" };
  } catch {
    return { sent: false, mode: "error" };
  }
}
