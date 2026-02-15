## GitHub Authentication
- GitHub連携が必要な操作では、プロジェクト直下の`.env`に保存された認証情報を使うこと。
- 使用する環境変数:
  - `GITHUB_TOKEN`
  - `GITHUB_USERNAME`
- 実行前に `source .env`（または同等の方法）で読み込んでからGitHub API/Git操作を行うこと。
- 認証情報をログやコミットに出力しないこと。

## Source Code Management
- このプロジェクトのソースコードはGitHubで管理すること。
- 変更は`git`で履歴管理し、意味のある単位でコミットすること。
- 作業完了後は`origin/main`へプッシュして、GitHub上の状態を最新に保つこと。

## Work Log
- 以後の作業ログはこの`AGENTS.md`に追記すること。

### 2026-02-14
- Added work-log policy to `AGENTS.md`.
- Corrected destination from `AGENT.md` to `AGENTS.md`.

### 2026-02-15
- Created per-project GitHub repositories: `blockgame`, `chatgame_spec`, `email`, `qualifyingexam`.
- Pushed each project using subtree split to the corresponding repository `main` branch.
- Extracted only `短答式試験` entries from the following Ministry of Justice pages and organized them by subject:
  - `https://www.moj.go.jp/jinji/shihoushiken/jinji07_00287.html` (令和7年)
  - `https://www.moj.go.jp/jinji/shihoushiken/jinji07_00228.html` (令和6年)
  - `https://www.moj.go.jp/jinji/shihoushiken/jinji07_00151.html` (令和5年)
- Generated:
  - `data/short_answer_questions_by_subject.json`
  - `data/short_answer_questions.csv`
  - `README.md` (subject-wise short-answer PDF list)
- Added extraction script: `scripts/extract_short_answer.py`.
- Extracted short-answer answer keys (`正解及び配点`) by subject from:
  - `https://www.moj.go.jp/jinji/shihoushiken/jinji07_00289.html` (令和7年)
  - `https://www.moj.go.jp/jinji/shihoushiken/jinji07_00258.html` (令和6年)
  - `https://www.moj.go.jp/jinji/shihoushiken/jinji07_00164.html` (令和5年)
- Generated:
  - `data/short_answer_answers_by_subject.json`
  - `data/short_answer_answers.csv`
- Added extraction script: `scripts/extract_short_answer_answers.py`.
- Merged short-answer question and answer lists by `year + subject`.
- Generated:
  - `data/short_answer_qa_by_subject.json`
  - `data/short_answer_qa.csv`
- Added merge script: `scripts/merge_short_answer_lists.py`.
- Built a web-based short-answer drill tool:
  - `index.html`
  - `styles.css`
  - `app.js`
- Features:
  - Subject/year filtering
  - Random/next/prev navigation
  - Open question PDF and reveal/open answer PDF
  - Local memo and completion tracking (localStorage)
  - Progress bar
- Added publication handoff docs for Kento:
  - `docs/KENTO_PUBLISH_REQUEST.md`
  - `docs/DEPLOYMENT.md`
- Created GitHub repository `tchaikotaro-ctrl/barexam`.
- Pushed `202602/barexam` via subtree split to `https://github.com/tchaikotaro-ctrl/barexam` `main` branch.
- Updated `docs/KENTO_PUBLISH_REQUEST.md` with the new repository URL and GitHub Pages publication request details.
- Created GitHub issue to request publication from Kento:
  - `https://github.com/tchaikotaro-ctrl/barexam/issues/1`
- Retried email notification to Kento using `projects/email` CLI and sent publication request to:
  - `kento0614nintendo@gmail.com`
- Resent email to Kento with corrected line breaks for readability:
  - Subject: `[barexam] GitHub Pages公開依頼（改行修正版）`
- Fixed frontend runtime error in `app.js`:
  - Resolved `TypeError: (intermediate value).sort is not a function` by converting `Set` to `Array` before sorting year options.
- Requested Kento to deploy the TypeError fix to web:
  - Email sent to `kento0614nintendo@gmail.com` with deployment request.
  - GitHub issue comment posted: `https://github.com/tchaikotaro-ctrl/barexam/issues/1#issuecomment-3903442267`
- Converted practice format from PDF links to text + multiple-choice UI:
  - Added quiz dataset builder `scripts/build_quiz_items.mjs` (PDF text extraction via `pdfjs-dist`).
  - Generated `data/short_answer_quiz_items.json`.
  - Updated frontend (`index.html`, `styles.css`, `app.js`) to render text questions, numbered options, answer checking, and progress tracking.
- Fixed text extraction issues:
  - Prevented prompt truncation at `解答欄は` by switching from `[No]`-cut extraction to question-block extraction (`〔第n問〕` block based).
  - Added explicit option-text parsing (e.g., `1. ... 2. ...`) and UI rendering of option labels.
- Updated option label formatting in UI:
  - Display format changed to concatenate `choice number + choice text` (e.g., `1ア...`) and separate adjacent choices with spaces.
- Requested Kento to publish the latest text/choice rendering fixes:
  - Email sent to `kento0614nintendo@gmail.com`.
  - GitHub issue comment posted: `https://github.com/tchaikotaro-ctrl/barexam/issues/1#issuecomment-3903538654`
- Requested Kento to apply latest `barexam` update again:
  - Email sent to `kento0614nintendo@gmail.com` (subject: `[barexam] アップデート反映依頼`).
  - GitHub issue comment posted: `https://github.com/tchaikotaro-ctrl/barexam/issues/1#issuecomment-3903582516`
- Investigated non-reflecting publish status:
  - Checked `https://tchaikotaro-ctrl.github.io/barexam/` and observed `Site not found`.
  - Checked GitHub Pages API for `barexam` and got `404` (likely not enabled).
- Sent urgent follow-up deployment request to Kento:
  - Email sent to `kento0614nintendo@gmail.com` (subject: `[barexam][至急] Pages未反映の対応依頼`).
  - GitHub issue comment posted: `https://github.com/tchaikotaro-ctrl/barexam/issues/1#issuecomment-3903608618`

## Skills
A skill is a set of local instructions to follow that is stored in a `SKILL.md` file. Below is the list of skills that can be used. Each entry includes a name, description, and file path so you can open the source for full instructions when using a specific skill.
### Available skills
- skill-creator: Guide for creating effective skills. This skill should be used when users want to create a new skill (or update an existing skill) that extends Codex's capabilities with specialized knowledge, workflows, or tool integrations. (file: /home/kotar/.codex/skills/.system/skill-creator/SKILL.md)
- skill-installer: Install Codex skills into $CODEX_HOME/skills from a curated list or a GitHub repo path. Use when a user asks to list installable skills, install a curated skill, or install a skill from another repo (including private repos). (file: /home/kotar/.codex/skills/.system/skill-installer/SKILL.md)
### How to use skills
- Discovery: The list above is the skills available in this session (name + description + file path). Skill bodies live on disk at the listed paths.
- Trigger rules: If the user names a skill (with `$SkillName` or plain text) OR the task clearly matches a skill's description shown above, you must use that skill for that turn. Multiple mentions mean use them all. Do not carry skills across turns unless re-mentioned.
- Missing/blocked: If a named skill isn't in the list or the path can't be read, say so briefly and continue with the best fallback.
- How to use a skill (progressive disclosure):
  1) After deciding to use a skill, open its `SKILL.md`. Read only enough to follow the workflow.
  2) When `SKILL.md` references relative paths (e.g., `scripts/foo.py`), resolve them relative to the skill directory listed above first, and only consider other paths if needed.
  3) If `SKILL.md` points to extra folders such as `references/`, load only the specific files needed for the request; don't bulk-load everything.
  4) If `scripts/` exist, prefer running or patching them instead of retyping large code blocks.
  5) If `assets/` or templates exist, reuse them instead of recreating from scratch.
- Coordination and sequencing:
  - If multiple skills apply, choose the minimal set that covers the request and state the order you'll use them.
  - Announce which skill(s) you're using and why (one short line). If you skip an obvious skill, say why.
- Context hygiene:
  - Keep context small: summarize long sections instead of pasting them; only load extra files when needed.
  - Avoid deep reference-chasing: prefer opening only files directly linked from `SKILL.md` unless you're blocked.
  - When variants exist (frameworks, providers, domains), pick only the relevant reference file(s) and note that choice.
- Safety and fallback: If a skill can't be applied cleanly (missing files, unclear instructions), state the issue, pick the next-best approach, and continue.
