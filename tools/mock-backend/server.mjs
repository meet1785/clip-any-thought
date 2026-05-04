import http from "node:http";
import { URL } from "node:url";

const PORT = Number(process.env.MOCK_BACKEND_PORT || 8787);

const clipStore = new Map();

const sendJson = (res, status, data) => {
  res.writeHead(status, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,PUT,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  });
  res.end(JSON.stringify(data));
};

const parseBody = (req) =>
  new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
    });
    req.on("end", () => {
      if (!body) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(body));
      } catch (err) {
        reject(err);
      }
    });
    req.on("error", reject);
  });

const extractVideoId = (videoUrl = "") => {
  const match = videoUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
  return match?.[1] || "mock_video";
};

const makeMockClips = (videoId, prompt = "") => {
  const promptNote = prompt ? `Prompt: ${prompt}` : "Prompt: viral highlights";
  return [
    {
      id: `${videoId}-c1`,
      title: "Hook Moment",
      start_time: 32,
      end_time: 58,
      viral_score: 92,
      description: `${promptNote}. Strong opening hook and high curiosity.`,
    },
    {
      id: `${videoId}-c2`,
      title: "Key Insight",
      start_time: 74,
      end_time: 121,
      viral_score: 88,
      description: "Actionable insight section with a concise takeaway.",
    },
    {
      id: `${videoId}-c3`,
      title: "Shareable Quote",
      start_time: 138,
      end_time: 171,
      viral_score: 84,
      description: "Memorable line suitable for Shorts/Reels captions.",
    },
  ];
};

const server = http.createServer(async (req, res) => {
  if (!req.url || !req.method) {
    sendJson(res, 400, { error: "Invalid request" });
    return;
  }

  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,POST,PUT,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    });
    res.end();
    return;
  }

  const url = new URL(req.url, `http://localhost:${PORT}`);

  if (req.method === "GET" && url.pathname === "/health") {
    sendJson(res, 200, { status: "ok", mode: "mock-backend" });
    return;
  }

  if (req.method === "POST" && url.pathname === "/analyze-video") {
    try {
      const body = await parseBody(req);
      const videoUrl = String(body.videoUrl || "");
      if (!videoUrl) {
        sendJson(res, 400, { error: "videoUrl is required" });
        return;
      }

      const videoId = extractVideoId(videoUrl);
      const clips = makeMockClips(videoId, String(body.prompt || ""));
      for (const clip of clips) {
        clipStore.set(clip.id, clip);
      }

      sendJson(res, 200, {
        message: "Mock analysis complete",
        videoId,
        clips,
      });
      return;
    } catch {
      sendJson(res, 400, { error: "Invalid JSON body" });
      return;
    }
  }

  if (req.method === "PUT" && url.pathname.startsWith("/clips/")) {
    try {
      const id = url.pathname.split("/").pop();
      const body = await parseBody(req);
      if (!id) {
        sendJson(res, 400, { error: "Clip id missing" });
        return;
      }

      const existing = clipStore.get(id) || { id };
      const updated = { ...existing, ...body };
      clipStore.set(id, updated);
      sendJson(res, 200, { message: "Clip saved", clip: updated });
      return;
    } catch {
      sendJson(res, 400, { error: "Invalid JSON body" });
      return;
    }
  }

  sendJson(res, 404, { error: "Not found" });
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Mock backend listening on http://0.0.0.0:${PORT}`);
});
