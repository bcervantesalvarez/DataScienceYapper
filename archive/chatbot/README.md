# Archived: Yappify Chatbot

Client-side LLM + RAG chatbot retired from the live site. Code kept here for reference.

## Contents

- `llm/` — JS modules (`chat-*.js`), `chat.css`, `chat.html`, prebuilt `vectors.json`, `vectors_metadata.json`
- `html/` — `model-info.html` (model selector tooltip page)
- `tools/` — Python build scripts:
  - `generate_vectors.py` — Sentence-transformer embedding generation over rendered `docs/` HTML
  - `cleanup.py` — Post-render copy of chat assets into `docs/`

## To re-enable

1. Move `llm/` and `html/` back to `assets/`.
2. In `_quarto.yml`, restore under `project.resources`:
   ```yaml
   - assets/llm/**
   - assets/html/llm/model-info.html
   ```
3. Under `format.html.include-after-body`, restore:
   ```yaml
   - assets/llm/chat.html
   ```
4. Move `tools/` back to repo root and (optionally) uncomment the `post-render` hook.

## Known issues

See the review report for details, but in short: vectors are 384-dim while the JS fallback emits 128-dim, dimension mismatch silently corrupts cosine similarity (`chat-rag.js:14-26`), `loadChatHistory` is dead code, and `vectors.json` (3.7 MB) loaded on every page rather than on first chat open.
