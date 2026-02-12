import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { createServiceClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const { prospectId, subject, body } = await request.json();

    if (!prospectId || !subject || !body) {
      return NextResponse.json(
        { error: "prospectId, subject, and body are required" },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();

    // Get prospect
    const { data: prospect, error: prospectError } = await supabase
      .from("prospects")
      .select("*")
      .eq("id", prospectId)
      .single();

    if (prospectError || !prospect) {
      return NextResponse.json(
        { error: "Prospect not found" },
        { status: 404 }
      );
    }

    // Get user's API settings
    const { data: settings } = await supabase
      .from("api_settings")
      .select("resend_api_key, resend_from_email")
      .eq("user_id", prospect.user_id)
      .single();

    const resendApiKey =
      settings?.resend_api_key || process.env.RESEND_API_KEY;
    const fromEmail =
      settings?.resend_from_email ||
      process.env.RESEND_FROM_EMAIL ||
      "onboarding@resend.dev";

    if (!resendApiKey) {
      return NextResponse.json(
        { error: "Resend API key not configured" },
        { status: 400 }
      );
    }

    const resend = new Resend(resendApiKey);

    // Determine recipient - try to extract from the prospect's domain
    // In production, you'd have the actual contact email
    const recipientEmail = `contact@${new URL(
      prospect.url.startsWith("http") ? prospect.url : `https://${prospect.url}`
    ).hostname}`;

    const { data: emailResult, error: emailError } = await resend.emails.send({
      from: fromEmail,
      to: [recipientEmail],
      subject: subject,
      text: body,
    });

    if (emailError) {
      throw new Error(emailError.message);
    }

    // Update prospect status to sent
    await supabase
      .from("prospects")
      .update({ status: "sent" })
      .eq("id", prospectId);

    // Update generation with final email content
    await supabase
      .from("generations")
      .update({
        email_subject: subject,
        email_body: body,
      })
      .eq("prospect_id", prospectId);

    return NextResponse.json({ success: true, emailId: emailResult?.id });
  } catch (error) {
    console.error("Email sending error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to send email" },
      { status: 500 }
    );
  }
}
