"use server";

const PISTON_API_URL =
  process.env.PISTON_API_URL ||
  (process.env.NODE_ENV === "development"
    ? "http://localhost:2000/api/v2/execute"
    : "https://emkc.org/api/v2/piston/execute");

interface ExecuteInput {
  args?: string[];
  code: string;
  language: string;
  stdin?: string;
}

export async function executeCode(input: ExecuteInput) {
  if (!input.code) {
    throw new Error("Code is required");
  }

  if (!input.language) {
    throw new Error("Language is required");
  }

  const response = await fetch(PISTON_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(process.env.PISTON_API_KEY && {
        Authorization: process.env.PISTON_API_KEY,
      }),
    },
    body: JSON.stringify({
      language: input.language.toLowerCase(),
      version: "*",
      files: [{ content: input.code }],
      stdin: input.stdin || "",
      args: Array.isArray(input.args) ? input.args : [],
    }),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");

    let detail = body;
    try {
      const parsed = JSON.parse(body);
      detail = parsed.message || JSON.stringify(parsed, null, 2);
    } catch {
      // body is not JSON, use as-is
    }

    const message = [
      response.status,
      detail,
      "",
      "The execution service rejected the request. Check the error above and verify the configured language/runtime.",
      "To change language, select language via the dropdown in the bottom right corner.",
    ].join("\n");

    return {
      language: input.language,
      version: "*",
      run: {
        stdout: "",
        stderr: message,
        code: 1,
        signal: null,
        output: message,
      },
      metadata: {
        args: input.args || [],
        stdin: input.stdin || "",
        timestamp: new Date().toISOString(),
      },
    };
  }

  const data = await response.json();

  return {
    ...data,
    metadata: {
      args: input.args || [],
      stdin: input.stdin || "",
      timestamp: new Date().toISOString(),
    },
  };
}
