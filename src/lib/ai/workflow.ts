/**
 * LangGraph-inspired Supervisor Workflow
 *
 * Orchestrates the multi-agent pipeline:
 * Phase 1: Analysis & Strategy (Gemini 1.5 Flash)
 * Phase 2: Asset Generation (DALL-E 3)
 * Phase 3: Code Generation (Claude 3.5 Sonnet)
 * Phase 4: Quality Assurance (Claude 3.5 Sonnet) with retry loop
 */

import { scrapeWebsite, captureScreenshot } from "./scraper";
import {
  runAnalysisAgent,
  runImageGenerationAgent,
  runCodeGenerationAgent,
  runQAAgent,
} from "./agents";
import type { AnalysisJson } from "@/types";

const MAX_QA_RETRIES = 2;

interface WorkflowConfig {
  googleApiKey: string;
  openaiApiKey: string;
  anthropicApiKey: string;
  jinaApiKey?: string;
  screenshotoneApiKey?: string;
}

interface WorkflowCallbacks {
  onStepUpdate: (step: string, message: string) => Promise<void>;
  onComplete: (result: WorkflowResult) => Promise<void>;
  onError: (error: string) => Promise<void>;
}

export interface WorkflowResult {
  analysis: AnalysisJson;
  dalleImageUrl: string;
  redesignCode: string;
  emailSubject: string;
  emailBody: string;
  qualityScore: number;
  supervisorFeedback: string;
  screenshotUrl: string | null;
  stepLog: string;
}

export async function runWorkflow(
  prospectUrl: string,
  companyName: string,
  config: WorkflowConfig,
  callbacks: WorkflowCallbacks
): Promise<WorkflowResult> {
  const logs: string[] = [];
  const log = async (phase: string, msg: string) => {
    const entry = `[${new Date().toISOString()}] ${phase}: ${msg}`;
    logs.push(entry);
    await callbacks.onStepUpdate(phase, msg);
  };

  try {
    // ========================================
    // Phase 0: Screenshot Capture
    // ========================================
    let screenshotUrl: string | null = null;
    if (config.screenshotoneApiKey) {
      await log("Screenshot", "Capturing website screenshot...");
      try {
        screenshotUrl = await captureScreenshot(
          prospectUrl,
          config.screenshotoneApiKey
        );
        await log("Screenshot", "Screenshot captured successfully");
      } catch (err) {
        await log("Screenshot", `Screenshot failed (non-blocking): ${err}`);
      }
    }

    // ========================================
    // Phase 1: Scrape & Analyze (Gemini)
    // ========================================
    await log("Phase 1", "Scraping website content via Jina AI...");
    const scrapedContent = await scrapeWebsite(prospectUrl, config.jinaApiKey);
    await log("Phase 1", `Scraped ${scrapedContent.length} characters`);

    await log("Phase 1", "Running AI analysis (Gemini 1.5 Flash)...");
    const { analysis, emailSubject, emailBody, dallePrompt } =
      await runAnalysisAgent(scrapedContent, prospectUrl, {
        googleApiKey: config.googleApiKey,
        openaiApiKey: config.openaiApiKey,
        anthropicApiKey: config.anthropicApiKey,
      });
    await log(
      "Phase 1",
      `Analysis complete. Found ${analysis.brand_colors.length} brand colors, ${analysis.pain_points.length} pain points`
    );

    // ========================================
    // Phase 2: Image Generation (DALL-E 3)
    // ========================================
    await log("Phase 2", "Generating hero image with DALL-E 3...");
    const dalleImageUrl = await runImageGenerationAgent(dallePrompt, {
      googleApiKey: config.googleApiKey,
      openaiApiKey: config.openaiApiKey,
      anthropicApiKey: config.anthropicApiKey,
    });
    await log("Phase 2", "Hero image generated successfully");

    // ========================================
    // Phase 3 & 4: Code Generation + QA Loop
    // ========================================
    let redesignCode = "";
    let qualityScore = 0;
    let supervisorFeedback = "";
    let retries = 0;
    let feedback: string | undefined;

    while (retries <= MAX_QA_RETRIES) {
      // Phase 3: Generate Code
      await log(
        "Phase 3",
        retries === 0
          ? "Generating hero section code (Claude 3.5 Sonnet)..."
          : `Regenerating code based on QA feedback (attempt ${retries + 1})...`
      );

      redesignCode = await runCodeGenerationAgent(
        analysis,
        dalleImageUrl,
        companyName,
        {
          googleApiKey: config.googleApiKey,
          openaiApiKey: config.openaiApiKey,
          anthropicApiKey: config.anthropicApiKey,
        },
        feedback
      );
      await log("Phase 3", `Code generated (${redesignCode.length} chars)`);

      // Phase 4: QA Review
      await log("Phase 4", "Running quality assurance review...");
      const qaResult = await runQAAgent(redesignCode, analysis, dalleImageUrl, {
        googleApiKey: config.googleApiKey,
        openaiApiKey: config.openaiApiKey,
        anthropicApiKey: config.anthropicApiKey,
      });

      qualityScore = qaResult.score;
      supervisorFeedback = qaResult.feedback;
      await log(
        "Phase 4",
        `QA Score: ${qualityScore}/100 - ${qaResult.approved ? "APPROVED" : "NEEDS IMPROVEMENT"}`
      );

      if (qaResult.approved || retries >= MAX_QA_RETRIES) {
        if (!qaResult.approved) {
          await log(
            "Phase 4",
            `Max retries reached. Proceeding with score ${qualityScore}`
          );
        }
        break;
      }

      feedback = qaResult.feedback;
      retries++;
      await log("Phase 4", `Sending feedback to code generator for retry...`);
    }

    await log("Complete", "Workflow finished successfully");

    const result: WorkflowResult = {
      analysis,
      dalleImageUrl,
      redesignCode,
      emailSubject,
      emailBody,
      qualityScore,
      supervisorFeedback,
      screenshotUrl,
      stepLog: logs.join("\n"),
    };

    await callbacks.onComplete(result);
    return result;
  } catch (error) {
    const errorMsg =
      error instanceof Error ? error.message : "Unknown error occurred";
    await log("Error", errorMsg);
    await callbacks.onError(errorMsg);
    throw error;
  }
}
