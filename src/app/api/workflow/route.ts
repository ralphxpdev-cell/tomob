import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { runWorkflow } from "@/lib/ai/workflow";

export const maxDuration = 300; // 5 minutes for AI processing

export async function POST(request: NextRequest) {
  try {
    const { prospectId } = await request.json();

    if (!prospectId) {
      return NextResponse.json(
        { error: "prospectId is required" },
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
      .select("*")
      .eq("user_id", prospect.user_id)
      .single();

    // Build config from user settings or env vars
    const config = {
      googleApiKey:
        settings?.google_api_key || process.env.GOOGLE_GENERATIVE_AI_API_KEY || "",
      openaiApiKey:
        settings?.openai_api_key || process.env.OPENAI_API_KEY || "",
      anthropicApiKey:
        settings?.anthropic_api_key || process.env.ANTHROPIC_API_KEY || "",
      jinaApiKey:
        settings?.jina_api_key || process.env.JINA_API_KEY,
      screenshotoneApiKey:
        settings?.screenshotone_api_key || process.env.SCREENSHOTONE_API_KEY,
    };

    // Validate required keys
    if (!config.googleApiKey || !config.openaiApiKey || !config.anthropicApiKey) {
      return NextResponse.json(
        {
          error:
            "Missing required API keys. Please configure Google, OpenAI, and Anthropic keys in Settings.",
        },
        { status: 400 }
      );
    }

    // Update status to analyzing
    await supabase
      .from("prospects")
      .update({ status: "analyzing" })
      .eq("id", prospectId);

    // Create or get generation record
    const { data: existingGen } = await supabase
      .from("generations")
      .select("id")
      .eq("prospect_id", prospectId)
      .single();

    let generationId: string;
    if (existingGen) {
      generationId = existingGen.id;
    } else {
      const { data: newGen } = await supabase
        .from("generations")
        .insert({ prospect_id: prospectId })
        .select("id")
        .single();
      generationId = newGen!.id;
    }

    // Run the workflow
    const result = await runWorkflow(
      prospect.url,
      prospect.company_name || "Unknown Company",
      config,
      {
        onStepUpdate: async (step, message) => {
          await supabase
            .from("generations")
            .update({
              current_step_log: `${step}: ${message}`,
            })
            .eq("id", generationId);
        },
        onComplete: async (workflowResult) => {
          // Save all results to DB
          await supabase
            .from("generations")
            .update({
              analysis_json: workflowResult.analysis,
              dall_e_image_url: workflowResult.dalleImageUrl,
              redesign_code: workflowResult.redesignCode,
              email_subject: workflowResult.emailSubject,
              email_body: workflowResult.emailBody,
              quality_score: workflowResult.qualityScore,
              supervisor_feedback: workflowResult.supervisorFeedback,
              current_step_log: workflowResult.stepLog,
            })
            .eq("id", generationId);

          // Update prospect with screenshot and status
          await supabase
            .from("prospects")
            .update({
              status: "generated",
              original_screenshot_url: workflowResult.screenshotUrl,
            })
            .eq("id", prospectId);
        },
        onError: async (error) => {
          await supabase
            .from("generations")
            .update({
              current_step_log: `ERROR: ${error}`,
            })
            .eq("id", generationId);

          await supabase
            .from("prospects")
            .update({ status: "error" })
            .eq("id", prospectId);
        },
      }
    );

    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error("Workflow error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Workflow failed" },
      { status: 500 }
    );
  }
}
