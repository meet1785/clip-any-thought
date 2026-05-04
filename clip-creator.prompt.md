Title: YouTube-to-Shorts Clip Creator (YT/IG content + SEO)

Purpose:
Create a reusable agent prompt that, given a YouTube link (or local video) and optional guidance, will:
- fetch the video and its transcription,
- identify the 1–2 minute highly engaging/critical moments (1–3 segments per video),
- extract and (optionally) produce short clips (15s–60s) ready for YT Shorts / Instagram Reels / TikTok,
- produce an SEO-optimized metadata package for each clip and the full-length video (titles, descriptions, tags, timestamps, hashtags),
- propose posting strategy (when, frequency, thumbnails, hook lines, content pillars), and
- return a machine-friendly JSON with clip timestamps, trimming specs, and metadata.

When to use:
- Use when you have a recorded talk, interview, lecture, livestream, or VOD and want short-form, high-engagement content plus metadata and posting strategy.

Inputs (required):
- `video_url` (string) — YouTube link or public video URL. If not available, provide `local_video_path`.
- `target_lang` (string, optional) — language for outputs (default: English).
- `max_clips` (int, optional) — max number of short clips to produce (default: 3).
- `clip_length_range` (string, optional) — desired length range for final clips (e.g., "15-45s").
- `audience` (string, optional) — target audience/persona to tailor hooks and tone.
- `platforms` (array, optional) — platforms to optimize for (e.g., ["youtube","instagram"]).
- `allow_transcript_api` (bool) — whether agent can call the YouTube transcript API or fetch CC (default: true).

Outputs (required format):
- JSON object with fields:
  - `source_video`: { `url`, `title`, `duration_seconds`, `language_detected` }
  - `transcript`: full text or link to text file
  - `clips`: array of clips where each clip:
    - `clip_id` (string)
    - `start` (s)
    - `end` (s)
    - `duration` (s)
    - `type` ("highlight","teaser","quote")
    - `trim_instructions` (e.g., "trim 0.5s fade-in, add 1s caption")
    - `platform_variants`: per-platform notes (aspect ratio, text overlays)
    - `seo`: { `title`, `description`, `tags`[], `hashtags`[], `thumbnail_suggestion`, `short_hook` }
  - `posting_strategy`: { `schedule`, `priority_clips`, `caption_templates`, `hashtags_set`, `thumbnail_templates` }
  - `notes`: any copyright/attribution needs and confidence scores

Constraints & Safety:
- If transcription is not available, attempt auto-transcribe and mark confidence per segment.
- Respect copyright: if content is copyrighted and the user is not the owner, include a compliance note and request permission.
- Do not publish or push to platforms on your own — only provide artifacts and clear instructions.

Agent Steps (how the agent should operate):
1. Validate `video_url` or `local_video_path`. Fetch metadata (title, duration, publish date).
2. Obtain transcript: prefer YouTube CC API, fallback to automatic speech-to-text. Detect language.
3. Analyze transcript + audio energy peaks + visual scene-change (if available) to find candidate high-engagement windows. Score windows by: emotional language, action verbs, surprising facts, questions, audience reaction (applause/laughter), and loudness peaks.
4. From top-scoring windows, select up to `max_clips` segments of 1–2 minutes. For each selected window, propose 2–3 short edit variants tuned for `platforms` and `clip_length_range` (e.g., a 45s teaser, a 20s highlight clip, a 12s hook).
5. For each clip variant produce trimming instructions, recommended aspect ratio and safe text/overlay placement, and closed-capion/subtitle suggestions.
6. Generate per-clip SEO metadata: platform-optimized title (include keywords), 2 descriptions (short and long), 10 tags, 10 hashtags (for IG/TikTok), suggested thumbnail concept, and 3 short hook lines for the first 3 seconds.
7. Produce a posting schedule (days/times), cross-posting plan (YT full → Shorts → IG feed/stories), and a 4-week content cadence suggestion.
8. Return JSON described above and a human-friendly markdown summary with exact timestamps and copy-ready descriptions.

Output Format Example (abridged):
{
  "source_video": {"url":"...","title":"...","duration_seconds":3600},
  "transcript":"/path/to/transcript.txt",
  "clips":[
    {"clip_id":"c1","start":1234,"end":1345,"duration":111,
     "type":"highlight",
     "trim_instructions":"cut 0.3s head, add 0.5s fade-out",
     "platform_variants":{ "youtube":{ "aspect":"9:16" }},
     "seo":{ "title":"...","description":"...","tags":["tag1"],"hashtags":["#tag"] }
    }
  ],
  "posting_strategy":{...},
  "notes":"..."
}

Example Invocation (natural language):
"Produce up to 3 short clips from https://www.youtube.com/watch?v=XXXXX. Prefer English outputs. Target platforms: youtube, instagram. Clip lengths 15-45s. Audience: tech founders. Provide JSON output and a markdown guide for editors."

Ambiguities / Questions the agent should ask if missing:
- Do you own the video or have permission to repurpose it?
- Preferred languages or localization requirements?
- Exact clip length constraints per platform (e.g., YT Shorts <=60s)?
- Should the agent produce edited video files or only timestamps + edit instructions?
- Any brand voice, banned words, or mandatory CTAs to include?

Notes for implementers / integrators:
- For automatic transcript fetching, use the YouTube transcripts API or `youtube-transcript-api`. If unavailable, call a robust STT (Whisper/AssemblyAI) and return segment confidences.
- For audio energy and scene detection, use ffmpeg analysis and a scene-detection library (optional). If running locally, supply `ffmpeg` commands in `trim_instructions`.
- Provide both machine-readable JSON (canonical) and a human-friendly markdown summary to hand editors.

Next customizations suggested:
- Add platform presets (e.g., TikTok vs IG Reels differences) in a separate file.
- Provide a `thumbnail-generation.prompt.md` that outputs thumbnail text overlays and color palettes.

---
This prompt template is designed to be copy-pasteable into a `.prompt.md` file and used by agents that can fetch transcripts and analyze video/audio. Fill the input placeholders when invoking.
