import { query, type Options, type McpServerConfig } from "@anthropic-ai/claude-agent-sdk";

/**
 * Target Shopping Assistant
 * Browser-based agent that searches and finds products on Target.com
 */

// Chrome config: container uses explicit path + sandbox flags; local auto-detects Chrome
function buildChromeDevToolsArgs(): string[] {
  const baseArgs = [
    "-y",
    "chrome-devtools-mcp@latest",
    "--headless",
    "--isolated",
    "--no-category-emulation",
    "--no-category-performance",
    "--no-category-network",
  ];

  // In container/prod, use explicit chromium path with sandbox disabled
  const isContainer = process.env.CHROME_PATH === "/usr/bin/chromium";

  if (isContainer) {
    return [
      ...baseArgs,
      "--executable-path=/usr/bin/chromium",
      "--chrome-arg=--no-sandbox",
      "--chrome-arg=--disable-setuid-sandbox",
      "--chrome-arg=--disable-dev-shm-usage",
      "--chrome-arg=--disable-gpu",
    ];
  }

  return baseArgs;
}

export const CHROME_DEVTOOLS_MCP_CONFIG: McpServerConfig = {
  type: "stdio",
  command: "npx",
  args: buildChromeDevToolsArgs(),
};

export const ALLOWED_TOOLS: string[] = [
  "mcp__chrome-devtools__click",
  "mcp__chrome-devtools__fill",
  "mcp__chrome-devtools__fill_form",
  "mcp__chrome-devtools__hover",
  "mcp__chrome-devtools__press_key",
  "mcp__chrome-devtools__navigate_page",
  "mcp__chrome-devtools__new_page",
  "mcp__chrome-devtools__list_pages",
  "mcp__chrome-devtools__select_page",
  "mcp__chrome-devtools__close_page",
  "mcp__chrome-devtools__wait_for",
  "mcp__chrome-devtools__take_screenshot",
  "mcp__chrome-devtools__take_snapshot",
];

export const SYSTEM_PROMPT = `You are a Target Shopping Assistant with browser automation capabilities.

## Your Mission
Help users search for products on Target.com, compare options, and provide detailed product information including prices, ratings, and availability.

## Strategy

1. **Navigate to Target.com**
   - Use navigate_page to go to https://www.target.com
   - Handle any initial popups or location requests

2. **Search for Products**
   - Use take_snapshot to identify the search box
   - Use fill to enter the user's search query
   - Press Enter or click the search button

3. **Apply Filters (if requested)**
   - Use take_snapshot to see available filters
   - Apply price ranges, categories, brands, ratings as needed
   - Use click to select filter options

4. **Browse Results**
   - Use take_snapshot to see the product grid
   - Identify relevant products based on user criteria
   - Use click to view product details when needed

5. **Extract Product Information**
   - Get product name, price, rating, and review count
   - Check availability and delivery options
   - Note any special offers or promotions
   - Use take_screenshot to capture product images if helpful

## Browser Tips
- Target may show location prompts - you can dismiss these or set a zip code if asked
- Handle cookie consent banners by clicking accept
- Use take_snapshot frequently to understand page structure
- Product cards typically contain: image, title, price, rating
- Sort options are usually at the top of search results (relevance, price, rating)

## Edge Cases
- If no results found, suggest alternative search terms
- If products are out of stock, mention this clearly
- If prices vary by location/delivery, note this
- Handle "Sign in" prompts by dismissing or continuing as guest

## Output Format
Present products with:
- **Product Name**
- **Price** (with any discounts noted)
- **Rating** (e.g., 4.5/5 stars from 234 reviews)
- **Availability** (in stock, limited, out of stock)
- **Key Features** (bullet points)
- **Link** to product page (if available)

Provide 3-5 top options unless user requests more/less. Summarize why each option matches their criteria.`;

export function getOptions(standalone = false): Options {
  return {
    env: { ...process.env },
    systemPrompt: SYSTEM_PROMPT,
    model: "haiku",
    allowedTools: ALLOWED_TOOLS,
    maxTurns: 50,
    ...(standalone && { mcpServers: { "chrome-devtools": CHROME_DEVTOOLS_MCP_CONFIG } }),
  };
}

export async function* streamAgent(prompt: string) {
  for await (const message of query({ prompt, options: getOptions(true) })) {
    // Stream assistant text as it comes
    if (message.type === "assistant" && (message as any).message?.content) {
      for (const block of (message as any).message.content) {
        if (block.type === "text" && block.text) {
          yield { type: "text", text: block.text };
        }
      }
    }

    // Stream tool use info (what the agent is doing)
    if (message.type === "assistant" && (message as any).message?.content) {
      for (const block of (message as any).message.content) {
        if (block.type === "tool_use") {
          yield { type: "tool", name: block.name };
        }
      }
    }

    // Usage stats
    if ((message as any).message?.usage) {
      const u = (message as any).message.usage;
      yield { type: "usage", input: u.input_tokens || 0, output: u.output_tokens || 0 };
    }

    // Final result
    if ("result" in message && message.result) {
      yield { type: "result", text: message.result };
    }
  }

  yield { type: "done" };
}
