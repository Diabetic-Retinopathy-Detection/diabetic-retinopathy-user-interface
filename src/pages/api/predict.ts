import { Readable } from "node:stream";

import type { NextApiRequest, NextApiResponse } from "next";

export const config = {
  api: {
    bodyParser: false,
  },
};

type ErrorResponse = {
  error: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    res.status(405).json({ error: "Method not allowed." });
    return;
  }

  const contentType = req.headers["content-type"];
  if (typeof contentType !== "string" || !contentType.startsWith("multipart/form-data")) {
    res.status(400).json({ error: "The request must contain an image file." });
    return;
  }

  try {
    const requestInit = {
      method: "POST",
      headers: {
        "content-type": contentType,
      },
      body: Readable.toWeb(req) as unknown as BodyInit,
      duplex: "half" as const,
    } as RequestInit & { duplex: "half" };

    const backendResponse = await fetch(
      `${process.env.BACKEND_URL ?? "http://127.0.0.1:8000"}/predict`,
      requestInit,
    );

    const responseBody = await backendResponse.json();
    res.status(backendResponse.status).json(responseBody);
  } catch {
    const response: ErrorResponse = {
      error: "The analysis service could not be reached.",
    };
    res.status(502).json(response);
  }
}
