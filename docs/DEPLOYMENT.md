# Deployment (GitHub Pages)

## Prerequisites
- GitHub repository exists for `barexam` project
- Push permission to the repository

## Steps
1. Push this project to GitHub repository default branch (`main`).
2. In GitHub repo settings, open `Pages`.
3. Set `Source` to `Deploy from a branch`.
4. Select branch `main` and folder `/ (root)`.
5. Save settings.
6. Confirm the generated Pages URL and open it.

## Smoke Check
- Top page opens and shows `予備試験短答式 問題演習ツール`
- Subject/year filters change card content
- `問題PDFを開く` and `解答PDFを開く` links work
- Reload preserves memo/check state in browser localStorage
