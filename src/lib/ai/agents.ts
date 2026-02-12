/**
 * AI Agent Definitions for the LangGraph Workflow
 *
 * Phase 1: Analysis & Strategy (Gemini 1.5 Flash)
 * Phase 2: Asset Generation (DALL-E 3)
 * Phase 3: Engineering (Claude 3.5 Sonnet)
 * Phase 4: Quality Assurance (Claude 3.5 Sonnet)
 */

import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatAnthropic } from "@langchain/anthropic";
import type { AnalysisJson } from "@/types";

interface AgentConfig {
  googleApiKey: string;
  openaiApiKey: string;
  anthropicApiKey: string;
}

// ============================================
// Phase 1: Analysis Agent (Gemini 1.5 Flash)
// ============================================
export async function runAnalysisAgent(
  scrapedContent: string,
  url: string,
  config: AgentConfig
): Promise<{ analysis: AnalysisJson; emailSubject: string; emailBody: string; dallePrompt: string }> {
  const model = new ChatGoogleGenerativeAI({
    model: "gemini-1.5-flash",
    apiKey: config.googleApiKey,
    temperature: 0.3,
  });

  const prompt = `You are an expert web design analyst and cold email strategist for a web agency.

Analyze the following website content and provide your analysis in STRICT JSON format.

Website URL: ${url}
Website Content:
${scrapedContent}

Respond with ONLY a JSON object (no markdown, no backticks) with these exact fields:
{
  "analysis": {
    "brand_colors": ["#hex1", "#hex2", "#hex3"],
    "value_proposition": "What the company does / offers (1-2 sentences)",
    "pain_points": ["UX issue 1", "UX issue 2", "UX issue 3"],
    "industry": "Industry name",
    "target_audience": "Who they serve"
  },
  "email_subject": "Short subject line under 50 chars referencing the company",
  "email_body": "A personalized cold email (under 150 words) that:\n1. References a specific observation about their website\n2. Explains a specific improvement opportunity\n3. Mentions we created a AI-redesigned concept for them\n4. Soft CTA asking if they'd like to see it\nSign off with just a first name.",
  "dalle_prompt": "A detailed DALL-E 3 prompt for generating a modern hero section background image that fits their brand aesthetic. Include: style (photographic/illustrated/abstract), mood, color palette matching their brand, composition suggestions. The image should be 1792x1024, modern, clean, suitable as a hero section background."
}`;

  const response = await model.invoke(prompt);
  const content = typeof response.content === "string" ? response.content : "";

  // Parse JSON from response, handling potential markdown wrapping
  const jsonStr = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  const parsed = JSON.parse(jsonStr);

  return {
    analysis: parsed.analysis,
    emailSubject: parsed.email_subject,
    emailBody: parsed.email_body,
    dallePrompt: parsed.dalle_prompt,
  };
}

// ============================================
// Phase 2: Image Generation (DALL-E 3)
// ============================================
export async function runImageGenerationAgent(
  dallePrompt: string,
  config: AgentConfig
): Promise<string> {
  // Use the OpenAI API directly for DALL-E 3
  const response = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.openaiApiKey}`,
    },
    body: JSON.stringify({
      model: "dall-e-3",
      prompt: dallePrompt,
      n: 1,
      size: "1792x1024",
      quality: "standard",
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`DALL-E 3 generation failed: ${error}`);
  }

  const data = await response.json();
  return data.data[0].url;
}

// ============================================
// Phase 3: Code Generation (Claude 3.5 Sonnet)
// ============================================
export async function runCodeGenerationAgent(
  analysis: AnalysisJson,
  dalleImageUrl: string,
  companyName: string,
  config: AgentConfig,
  feedback?: string
): Promise<string> {
  const model = new ChatAnthropic({
    modelName: "claude-sonnet-4-20250514",
    apiKey: config.anthropicApiKey,
    temperature: 0.2,
    maxTokens: 4096,
  });

  const feedbackSection = feedback
    ? `\n\nPREVIOUS REVIEW FEEDBACK (address these issues):\n${feedback}`
    : "";

  const prompt = `You are an expert React developer. Generate a complete Hero Section component for a landing page redesign.

COMPANY: ${companyName}
BRAND COLORS: ${analysis.brand_colors.join(", ")}
VALUE PROPOSITION: ${analysis.value_proposition}
TARGET AUDIENCE: ${analysis.target_audience}
INDUSTRY: ${analysis.industry}
BACKGROUND IMAGE URL: ${dalleImageUrl}
${feedbackSection}

CONSTRAINTS:
1. Use the brand colors from the analysis for text, accents, and overlays
2. Use the DALL-E image URL as the hero section background
3. Use Tailwind CSS (available via CDN in the preview)
4. Component must be responsive (mobile-first)
5. Include a compelling headline, subheadline, and CTA button
6. Modern, clean, high-conversion design
7. Export as default function App()

Respond with ONLY the React JSX code (no markdown, no backticks, no explanation).
The code should be a complete App component that can render standalone:

export default function App() {
  return (
    // Your hero section code here
  )
}`;

  const response = await model.invoke(prompt);
  const content = typeof response.content === "string" ? response.content : "";

  // Clean up any accidental markdown wrapping
  return content.replace(/```jsx?\n?/g, "").replace(/```\n?/g, "").trim();
}

// ============================================
// Phase 4: Quality Assurance (Claude 3.5 Sonnet)
// ============================================
export async function runQAAgent(
  code: string,
  analysis: AnalysisJson,
  dalleImageUrl: string,
  config: AgentConfig
): Promise<{ score: number; feedback: string; approved: boolean }> {
  const model = new ChatAnthropic({
    modelName: "claude-sonnet-4-20250514",
    apiKey: config.anthropicApiKey,
    temperature: 0.1,
    maxTokens: 1024,
  });

  const prompt = `You are a senior frontend code reviewer. Evaluate this React Hero Section component.

EXPECTED BRAND COLORS: ${analysis.brand_colors.join(", ")}
EXPECTED IMAGE URL: ${dalleImageUrl}

CODE TO REVIEW:
${code}

Score the code 0-100 based on these criteria:
1. Responsiveness (mobile-first, uses responsive Tailwind classes)
2. Brand color usage (correctly uses the provided brand colors)
3. Image usage (correctly uses the DALL-E image as background/visual)
4. Code quality (clean, no errors, proper React patterns)
5. Visual appeal (modern design, good typography hierarchy, clear CTA)

Respond with ONLY a JSON object (no markdown, no backticks):
{
  "score": 85,
  "feedback": "Specific constructive feedback about what to improve",
  "approved": true
}

Set approved to true if score >= 80, false otherwise.`;

  const response = await model.invoke(prompt);
  const content = typeof response.content === "string" ? response.content : "";

  const jsonStr = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  return JSON.parse(jsonStr);
}
