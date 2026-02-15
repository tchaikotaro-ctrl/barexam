# 予備試験短答式問題データ

指定された3ページから、**短答式試験のみ**を抽出した一覧です。

## 問題演習ツール
- エントリーポイント: `index.html`
- データ: `data/short_answer_quiz_items.json`
- ローカル起動例:
  - `cd 202602/barexam`
  - `python3 -m http.server 8000`
  - `http://localhost:8000` を開く
- 形式:
  - 問題文をテキスト表示
  - 選択肢を番号選択（ラジオボタン）で回答
  - 正解表示・進捗管理・メモ保存

## テキスト抽出データ
- 生成スクリプト: `scripts/build_quiz_items.mjs`
- 生成物: `data/short_answer_quiz_items.json`

## ソースページ
- https://www.moj.go.jp/jinji/shihoushiken/jinji07_00287.html
- https://www.moj.go.jp/jinji/shihoushiken/jinji07_00228.html
- https://www.moj.go.jp/jinji/shihoushiken/jinji07_00151.html

## 科目別PDF一覧
### 一般教養科目
- 令和7年: https://www.moj.go.jp/content/001443619.pdf
- 令和6年: https://www.moj.go.jp/content/001421754.pdf
- 令和5年: https://www.moj.go.jp/content/001399907.pdf

### 刑法・刑事訴訟法
- 令和7年: https://www.moj.go.jp/content/001443618.pdf
- 令和6年: https://www.moj.go.jp/content/001421753.pdf
- 令和5年: https://www.moj.go.jp/content/001399906.pdf

### 憲法・行政法
- 令和7年: https://www.moj.go.jp/content/001443616.pdf
- 令和6年: https://www.moj.go.jp/content/001421751.pdf
- 令和5年: https://www.moj.go.jp/content/001399904.pdf

### 民法・商法・民事訴訟法
- 令和7年: https://www.moj.go.jp/content/001443617.pdf
- 令和6年: https://www.moj.go.jp/content/001421752.pdf
- 令和5年: https://www.moj.go.jp/content/001399905.pdf

## 短答式 解答（正解及び配点）科目別PDF一覧
### 一般教養科目
- 令和7年: https://www.moj.go.jp/content/001444176.pdf
- 令和6年: https://www.moj.go.jp/content/001422572.pdf
- 令和5年: https://www.moj.go.jp/content/001400885.pdf

### 刑法・刑事訴訟法
- 令和7年: https://www.moj.go.jp/content/001444175.pdf
- 令和6年: https://www.moj.go.jp/content/001422571.pdf
- 令和5年: https://www.moj.go.jp/content/001400884.pdf

### 憲法・行政法
- 令和7年: https://www.moj.go.jp/content/001444173.pdf
- 令和6年: https://www.moj.go.jp/content/001422569.pdf
- 令和5年: https://www.moj.go.jp/content/001400882.pdf

### 民法・商法・民事訴訟法
- 令和7年: https://www.moj.go.jp/content/001444174.pdf
- 令和6年: https://www.moj.go.jp/content/001422570.pdf
- 令和5年: https://www.moj.go.jp/content/001400886.pdf

## 統合済みリスト（問題 + 解答）
- `data/short_answer_qa_by_subject.json`
- `data/short_answer_qa.csv`
