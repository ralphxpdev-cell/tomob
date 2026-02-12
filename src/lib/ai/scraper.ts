/**
 * Website scraping via Jina AI Reader
 */
export async function scrapeWebsite(
  url: string,
  jinaApiKey?: string
): Promise<string> {
  const jinaUrl = `https://r.jina.ai/${url}`;

  const headers: Record<string, string> = {
    Accept: "text/plain",
  };

  if (jinaApiKey) {
    headers["Authorization"] = `Bearer ${jinaApiKey}`;
  }

  const response = await fetch(jinaUrl, { headers });

  if (!response.ok) {
    throw new Error(`Jina scraping failed: ${response.status} ${response.statusText}`);
  }

  const text = await response.text();
  // Truncate to avoid token limits
  return text.slice(0, 15000);
}

/**
 * Capture website screenshot via ScreenshotOne
 */
export async function captureScreenshot(
  url: string,
  apiKey: string
): Promise<string> {
  const params = new URLSearchParams({
    access_key: apiKey,
    url: url,
    full_page: "false",
    viewport_width: "1280",
    viewport_height: "800",
    format: "png",
    block_ads: "true",
  });

  const screenshotUrl = `https://api.screenshotone.com/take?${params.toString()}`;

  // Return the URL directly (ScreenshotOne returns the image at this URL)
  return screenshotUrl;
}
