Clipper tool
=================

This is a small command-line tool to:

- download a YouTube video
- fetch or generate a transcript
- score transcript windows to find high-engagement moments
- output edited clips (mp4) using `ffmpeg`
- emit a JSON metadata package (clips + SEO suggestions)

Prerequisites
- Python 3.10+
- `ffmpeg` installed and on PATH
- Install dependencies:

```bash
python -m pip install -r tools/clipper/requirements.txt
```

Quick usage

```bash
python tools/clipper/clipper.py --url "https://www.youtube.com/watch?v=XXXXX" --max-clips 6 --output ./out
```

If YouTube returns bot/captcha blocks, export cookies from your browser and run:

```bash
python tools/clipper/clipper.py \
	--url "https://www.youtube.com/watch?v=XXXXX" \
	--max-clips 6 \
	--output ./out \
	--cookies-file /absolute/path/to/youtube-cookies.txt
```

Optional: pass a proxy if needed.

```bash
python tools/clipper/clipper.py --url "..." --proxy "http://user:pass@host:port"
```

Outputs
- `out/` will contain downloaded video, clips named `clip_<id>_v<variant>.mp4`, `metadata.json`, and `transcript.srt`.

Notes
- The script uses a heuristic scorer on transcripts to pick highlights. For production use, connect an LLM or more advanced audio/scene analysis.
- Transcript flow: YouTube transcript API -> yt-dlp subtitle download -> placeholder segment.
