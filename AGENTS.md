# Agent Notes

## Commands
- Dev server: `npm run dev`
- Build: `npm run build`
- Prod server: `npm run start`
- Lint: `npm run lint`

## Runtime config
- Required env vars are documented in `.env.example` (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `NEXT_PUBLIC_HF_SPACE_NAME`).
- External tool docs: Next.js https://nextjs.org/docs, Supabase https://supabase.com/docs, Hugging Face Spaces https://huggingface.co/docs/hub/spaces.

## Architecture
- Next.js App Router entrypoints live under `app/` (`app/layout.tsx`, `app/page.tsx`).
- Global styles and theme tokens are in `app/global.css`.

## Guidelines
- Be concise.
- Use best practice.
