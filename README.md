# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/98c9c642-36d4-48ef-8131-e66c379520e4

## Features

### 🎬 AI-Powered Video Clipping
- Analyze YouTube videos and generate viral clips automatically
- AI suggests 3-5 clips with viral scores (0-100)
- Custom prompts for targeted clip discovery

### 🤖 NVIDIA AI setup
The video analysis edge function is configured to use an OpenAI-compatible NVIDIA endpoint by default, so you do not need Claude Pro for clip generation.

Set these Supabase secrets before deploying the function:

```sh
supabase secrets set NVIDIA_API_KEY=your_nvidia_api_key
supabase secrets set NVIDIA_API_BASE_URL=https://integrate.api.nvidia.com/v1
supabase secrets set NVIDIA_MODEL=meta/llama-3.1-70b-instruct
```

If you prefer generic variable names, the function also accepts `AI_API_KEY`, `AI_API_BASE_URL`, and `AI_MODEL` as fallbacks.

To use DeepSeek or GLM instead, keep the same key and base URL, then change only `NVIDIA_MODEL` to one of the available NVIDIA-hosted model IDs, for example:

```sh
# DeepSeek
supabase secrets set NVIDIA_MODEL=deepseek-ai/deepseek-v4-flash

# or GLM
supabase secrets set NVIDIA_MODEL=z-ai/glm-5.1
```

Other NVIDIA-hosted options that may work in this project include `deepseek-ai/deepseek-v4-pro`, `z-ai/glm4.7`, and `z-ai/glm5`.

### Claude Code via NVIDIA NIM
Claude Code itself still expects an Anthropic-compatible endpoint, so use the local proxy in `tools/claude-nim-proxy.py`.

1. Export your NVIDIA key and choose a model:

```sh
export NVIDIA_API_KEY=your_nvidia_api_key
export NVIDIA_MODEL=qwen/qwen3-coder-480b-a35b-instruct
```

2. Start the proxy:

```sh
python tools/claude-nim-proxy.py
```

3. In another terminal, launch Claude Code through the wrapper:

```sh
./tools/claude-nim.sh
```

The wrapper now pins Claude Code to a proxy-advertised model id so the CLI does not fall back to its own default selection before the proxy can route the request. The proxy advertises Claude-compatible model IDs, then routes all requests to the NVIDIA coding model from `NVIDIA_MODEL`. If you want GLM instead of the default coding model, set `NVIDIA_MODEL=z-ai/glm-5.1` before starting the proxy and wrapper. The proxy listens on `http://127.0.0.1:4000` by default.

The wrapper follows the working `free-claude-code` pattern by using the local proxy token for both `ANTHROPIC_AUTH_TOKEN` and `ANTHROPIC_API_KEY`, then passing `--model sonnet`, which is one of the aliases the proxy now advertises.

### ✂️ Clip Editing
- Add timed captions with position control
- Audio overlay with volume adjustment
- Multiple download methods (command-line, online services, browser extensions)

### ⌨️ Keyboard Shortcuts
Speed up your workflow with keyboard shortcuts! Press `?` to see all available shortcuts:

- **⌘/Ctrl + Enter**: Generate clips
- **↑/↓**: Navigate between clips
- **E**: Toggle clip editor
- **P**: Preview clip
- **Escape**: Close editor
- **?**: Show shortcuts help

See [KEYBOARD_SHORTCUTS.md](./KEYBOARD_SHORTCUTS.md) for details.

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/98c9c642-36d4-48ef-8131-e66c379520e4) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/98c9c642-36d4-48ef-8131-e66c379520e4) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
