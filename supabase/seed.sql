-- Tomob Agency Automation Platform - Seed Data
-- Run this after schema.sql

-- ============================================
-- Nano Banana Admin UI Guidelines
-- ============================================
INSERT INTO guidelines (type, content, is_active) VALUES
(
  'admin_ui',
  E'# Nano Banana Admin UI Design System\n\n## Theme\n- 100% Dark Mode, no light mode toggle\n- Primary background: bg-neutral-950 (#0a0a0a)\n- Card/surface background: bg-neutral-900 (#171717)\n- Border color: border-neutral-800 (#262626)\n\n## Typography\n- Primary text: text-white\n- Secondary text: text-neutral-400\n- Headings: text-white font-semibold\n- Monospace for data: font-mono\n\n## Accent (Yellow)\n- CTA Buttons: bg-yellow-400 text-black font-semibold hover:bg-yellow-300\n- Active nav states: text-yellow-400\n- Active indicators: bg-yellow-400\n- Links: text-yellow-400 hover:text-yellow-300\n\n## Shapes\n- Buttons: rounded-full (pill shape)\n- Containers/Cards: rounded-xl\n- Inputs: rounded-lg bg-neutral-900 border-neutral-800\n- Badges: rounded-full px-3 py-1\n\n## Spacing\n- Page padding: p-6 or p-8\n- Card padding: p-4 or p-6\n- Gap between items: gap-4\n- Section spacing: space-y-6\n\n## Interactions\n- Hover on cards: hover:bg-neutral-800/50\n- Transitions: transition-colors duration-200\n- Focus rings: focus:ring-2 focus:ring-yellow-400/50',
  true
),
(
  'email_tone',
  E'# Cold Email Persona & Tone Guidelines\n\n## Voice\n- Professional but conversational\n- Confident without being pushy\n- Data-driven, reference specific observations\n- Show genuine interest in their business\n\n## Structure\n1. **Hook:** Reference a specific observation about their website\n2. **Value:** Explain the specific improvement opportunity\n3. **Proof:** Mention the AI-generated redesign concept\n4. **CTA:** Soft ask - "Would you like to see what we came up with?"\n\n## Rules\n- Keep subject lines under 50 characters\n- Email body under 150 words\n- No spam trigger words (free, guarantee, limited time)\n- Always personalize with company name and specific pain point\n- Sign off with first name only\n- Include one-click unsubscribe mention\n\n## Example Subject Lines\n- "Quick thought on {company} homepage"\n- "Noticed something on {company}.com"\n- "{company} - a design observation"',
  true
);
