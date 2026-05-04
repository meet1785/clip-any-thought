#!/usr/bin/env python3
"""Simple clipper: download, transcript, pick highlights, produce clips, emit metadata."""
import argparse
import json
import re
import shlex
import subprocess
from collections import Counter
from pathlib import Path
from urllib.parse import parse_qs, urlparse

try:
    from youtube_transcript_api import YouTubeTranscriptApi
except Exception:
    YouTubeTranscriptApi = None

STOPWORDS = set(["the","and","to","a","of","in","is","it","that","for","on","with","as","this","are","be","or","by","an","was","at","from"]) 

KEYWORD_BOOST = ["tip","surprising","secret","wow","important","announce","launch","hack","challenge","strategy","how","why","best","mistake","result"]


def run(cmd):
    print(f"> {cmd}")
    subprocess.check_call(shlex.split(cmd))


def download_video(url, out_dir: Path, cookies_file: str = None, proxy: str = None):
    out_dir.mkdir(parents=True, exist_ok=True)
    out_template = str(out_dir / "source.%(ext)s")
    cmd = [
        "yt-dlp",
        "-f",
        "bestvideo+bestaudio/b",
        "--merge-output-format",
        "mp4",
        "-o",
        out_template,
    ]
    if cookies_file:
        cmd.extend(["--cookies", cookies_file])
    if proxy:
        cmd.extend(["--proxy", proxy])
    cmd.append(url)
    cmd_str = " ".join(shlex.quote(c) for c in cmd)
    run(cmd_str)
    # find the downloaded file
    for f in out_dir.iterdir():
        if f.name.startswith("source.") and f.suffix in ('.mp4', '.mkv', '.webm'):
            return f
    raise FileNotFoundError("downloaded video not found")


def fetch_transcript_youtube(video_id):
    if not YouTubeTranscriptApi:
        return None
    try:
        api = YouTubeTranscriptApi()
        fetched = api.fetch(video_id)
        transcript = []
        for seg in fetched:
            if isinstance(seg, dict):
                transcript.append(
                    {
                        "text": seg.get("text", ""),
                        "start": float(seg.get("start", 0.0)),
                        "duration": float(seg.get("duration", 0.0)),
                    }
                )
            else:
                transcript.append(
                    {
                        "text": getattr(seg, "text", ""),
                        "start": float(getattr(seg, "start", 0.0)),
                        "duration": float(getattr(seg, "duration", 0.0)),
                    }
                )
        return transcript
    except Exception:
        return None


def extract_video_id(url: str):
    parsed = urlparse(url)
    if parsed.netloc.endswith('youtu.be'):
        return parsed.path.strip('/').split('/')[0]
    if 'youtube.com' in parsed.netloc:
        qs = parse_qs(parsed.query)
        if 'v' in qs and qs['v']:
            return qs['v'][0]
    return None


def write_srt(transcript, srt_path: Path):
    def fmt_time(s):
        h = int(s // 3600)
        m = int((s % 3600) // 60)
        sec = s % 60
        return f"{h:02d}:{m:02d}:{sec:06.3f}".replace('.',',')
    with srt_path.open('w', encoding='utf8') as f:
        for i, seg in enumerate(transcript, start=1):
            f.write(f"{i}\n")
            f.write(f"{fmt_time(seg['start'])} --> {fmt_time(seg['start']+seg.get('duration',3))}\n")
            f.write(seg['text'].replace('\n',' ') + "\n\n")


def parse_vtt_to_transcript(vtt_path: Path):
    if not vtt_path.exists():
        return None

    def parse_ts(ts):
        ts = ts.replace(',', '.')
        parts = ts.split(':')
        if len(parts) == 3:
            h, m, s = parts
        elif len(parts) == 2:
            h = '0'
            m, s = parts
        else:
            return 0.0
        return int(h) * 3600 + int(m) * 60 + float(s)

    transcript = []
    lines = vtt_path.read_text(encoding='utf8', errors='ignore').splitlines()
    i = 0
    while i < len(lines):
        line = lines[i].strip()
        if '-->' in line:
            start_s, end_s = [x.strip() for x in line.split('-->')]
            start = parse_ts(start_s.split(' ')[0])
            end = parse_ts(end_s.split(' ')[0])
            i += 1
            texts = []
            while i < len(lines) and lines[i].strip():
                t = re.sub(r'<[^>]+>', '', lines[i]).strip()
                if t:
                    texts.append(t)
                i += 1
            if texts:
                transcript.append(
                    {
                        'text': ' '.join(texts),
                        'start': start,
                        'duration': max(0.1, end - start),
                    }
                )
        i += 1
    return transcript or None


def try_download_subtitles(url: str, out_dir: Path, cookies_file: str = None, proxy: str = None):
    out_template = str(out_dir / "subs.%(ext)s")
    cmd = [
        "yt-dlp",
        "--skip-download",
        "--write-auto-subs",
        "--sub-langs",
        "en.*",
        "--sub-format",
        "vtt",
        "-o",
        out_template,
    ]
    if cookies_file:
        cmd.extend(["--cookies", cookies_file])
    if proxy:
        cmd.extend(["--proxy", proxy])
    cmd.append(url)
    cmd_str = " ".join(shlex.quote(c) for c in cmd)
    try:
        run(cmd_str)
    except Exception:
        return None

    for f in out_dir.iterdir():
        if f.name.startswith('subs.') and f.suffix == '.vtt':
            return parse_vtt_to_transcript(f)
    return None


def score_transcript(transcript):
    # Simple per-segment score based on keywords and punctuation
    scores = []
    for seg in transcript:
        t = seg['text'].lower()
        s = 0
        for kw in KEYWORD_BOOST:
            if kw in t:
                s += 2
        s += t.count('!') * 2
        s += t.count('?') * 1
        s += min(3, len(t.split()) // 20)
        scores.append((seg['start'], seg.get('duration',3), s))
    return scores


def aggregate_windows(scores, window_size=60):
    # Create candidate windows by sliding across transcript
    starts = [s for s, d, sc in scores]
    max_t = starts[-1] + (scores[-1][1] if scores else 0)
    candidates = []
    t = 0
    while t < max_t:
        # sum scores of segments starting within window
        score_sum = sum(sc for s, d, sc in scores if s >= t and s < t + window_size)
        candidates.append((t, min(t + window_size, max_t), score_sum))
        t += window_size // 4
    # sort by score
    candidates.sort(key=lambda x: x[2], reverse=True)
    return candidates


def pick_non_overlapping(candidates, max_clips, min_gap=30):
    picked = []
    for start, end, sc in candidates:
        if len(picked) >= max_clips:
            break
        ok = True
        for s, e, _ in picked:
            if not (end + min_gap <= s or start >= e + min_gap):
                ok = False
                break
        if ok:
            picked.append((start, end, sc))
    return picked


def generate_variants(picked_windows, clip_length_range=(15,60)):
    variants = []
    low, high = clip_length_range
    for i, (start, end, sc) in enumerate(picked_windows, start=1):
        center = (start + end) / 2
        # produce up to three variants: short, medium, long within range
        lengths = [min(high, max(low, int((high+low)/3))), min(high, int((low+high)/2)), min(high, int(high))]
        uniq = sorted(set(lengths))
        for vi, L in enumerate(uniq, start=1):
            s = max(0, center - L/2)
            variants.append({'clip_id': f'c{i}', 'variant': vi, 'start': round(s,3), 'duration': L})
    return variants


def ffmpeg_trim(source_file: Path, out_file: Path, start: float, duration: float, srt: Path = None):
    # add fade-in/out and embed subtitles if provided
    fade_dur = 0.5
    cmd = [
        'ffmpeg', '-y', '-ss', str(start), '-i', str(source_file), '-t', str(duration), '-c:v', 'libx264', '-preset', 'fast',
        '-c:a', 'aac', '-movflags', '+faststart'
    ]
    vf = []
    # add fade in/out for video
    vf.append(f"fade=t=in:st=0:d={fade_dur}")
    vf.append(f"fade=t=out:st={max(0,duration-fade_dur)}:d={fade_dur}")
    if srt and srt.exists():
        cmd += ['-vf', ','.join(vf) + f',subtitles={str(srt)}']
    else:
        cmd += ['-vf', ','.join(vf)]
    cmd += [str(out_file)]
    print('Running ffmpeg trim:', ' '.join(shlex.quote(x) for x in cmd))
    subprocess.check_call(cmd)


def simple_seo_from_transcript(transcript_text, top_n=8):
    words = re.findall(r"\w+", transcript_text.lower())
    words = [w for w in words if w not in STOPWORDS and len(w) > 2]
    c = Counter(words)
    common = [w for w, _ in c.most_common(top_n)]
    title = " | " .join(common[:4]).title()
    description = transcript_text[:300] + "..."
    tags = common
    hashtags = [f"#{w}" for w in common[:6]]
    return {'title': title, 'description': description, 'tags': tags, 'hashtags': hashtags}


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--url', required=True)
    parser.add_argument('--max-clips', type=int, default=6)
    parser.add_argument('--output', default='./out')
    parser.add_argument('--min-length', type=int, default=15)
    parser.add_argument('--max-length', type=int, default=60)
    parser.add_argument('--cookies-file', default=None)
    parser.add_argument('--proxy', default=None)
    args = parser.parse_args()

    out_dir = Path(args.output)
    out_dir.mkdir(parents=True, exist_ok=True)

    # download
    video_file = download_video(args.url, out_dir, cookies_file=args.cookies_file, proxy=args.proxy)

    # try youtube transcript api
    video_id = extract_video_id(args.url)
    transcript = None
    if video_id and YouTubeTranscriptApi:
        transcript = fetch_transcript_youtube(video_id)

    # fallback: try subtitle download via yt-dlp
    if transcript is None:
        transcript = try_download_subtitles(args.url, out_dir, cookies_file=args.cookies_file, proxy=args.proxy)

    # final fallback: placeholder segment
    if transcript is None:
        print('Transcript not found via API/subtitles. Using placeholder transcript segment.')
        transcript = [{'text': 'Auto-transcription not available in this environment.', 'start': 0.0, 'duration': 3.0}]

    # write srt
    srt_path = out_dir / 'transcript.srt'
    write_srt(transcript, srt_path)

    # scoring
    scores = score_transcript(transcript)
    candidates = aggregate_windows(scores, window_size=90)
    picked = pick_non_overlapping(candidates, max_clips=args.max_clips, min_gap=20)
    variants = generate_variants(picked, clip_length_range=(args.min_length, args.max_length))

    # load full transcript text for SEO
    full_text = "\n".join(seg['text'] for seg in transcript)
    seo = simple_seo_from_transcript(full_text)

    metadata = {
        'source_video': {'url': args.url, 'title': video_file.name, 'duration_seconds': None, 'language_detected': 'en'},
        'transcript': str(srt_path),
        'clips': [],
        'posting_strategy': {
            'schedule': ['Tue 6 PM', 'Thu 6 PM', 'Sat 11 AM'],
            'priority_clips': ['c1', 'c2'],
            'caption_templates': [
                'Hook in first line. 1 key takeaway. CTA: follow for more.',
                'Problem -> insight -> action in 3 lines with hashtags.'
            ],
            'hashtags_set': ['#shorts', '#youtube', '#contentstrategy', '#reels', '#growth'],
            'thumbnail_templates': ['bold 3-word claim', 'question-based headline']
        },
        'notes': 'Generated by clipper.py heuristics.'
    }

    # produce clips
    for v in variants:
        out_name = out_dir / f"clip_{v['clip_id']}_v{v['variant']}.mp4"
        ffmpeg_trim(video_file, out_name, v['start'], v['duration'], srt_path)
        clip_meta = {
            'clip_id': v['clip_id'], 'variant': v['variant'], 'start': v['start'], 'duration': v['duration'],
            'type': 'highlight', 'trim_instructions': 'fade in/out, subtitles burned', 'platform_variants': {},
            'seo': seo
        }
        metadata['clips'].append(clip_meta)

    # write metadata
    with open(out_dir / 'metadata.json', 'w', encoding='utf8') as f:
        json.dump(metadata, f, indent=2)

    print('Done. Files in', out_dir)


if __name__ == '__main__':
    main()
