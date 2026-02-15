(() => {
  const DATA_PATH = "data/short_answer_quiz_items.json";
  const STORE_KEY = "barexam_short_answer_state_v2";

  const els = {
    subject: document.getElementById("subject"),
    year: document.getElementById("year"),
    questionNo: document.getElementById("questionNo"),
    prev: document.getElementById("prev"),
    next: document.getElementById("next"),
    shuffle: document.getElementById("shuffle"),
    showOnlyUnchecked: document.getElementById("showOnlyUnchecked"),
    cardTitle: document.getElementById("cardTitle"),
    meta: document.getElementById("meta"),
    prompt: document.getElementById("prompt"),
    choices: document.getElementById("choices"),
    checkAnswer: document.getElementById("checkAnswer"),
    revealAnswer: document.getElementById("revealAnswer"),
    result: document.getElementById("result"),
    memo: document.getElementById("memo"),
    checked: document.getElementById("checked"),
    progressText: document.getElementById("progressText"),
    progressBar: document.getElementById("progressBar")
  };

  const state = {
    records: [],
    filtered: [],
    currentIndex: 0,
    storage: loadStorage()
  };

  fetch(DATA_PATH)
    .then((r) => r.json())
    .then((data) => {
      state.records = flatten(data.sets || []);
      buildFilters(state.records);
      applyFilterAndRender();
    })
    .catch((err) => {
      els.cardTitle.textContent = "データの読み込みに失敗しました";
      els.meta.textContent = String(err);
    });

  els.subject.addEventListener("change", applyFilterAndRender);
  els.year.addEventListener("change", applyFilterAndRender);
  els.questionNo.addEventListener("change", () => {
    const target = Number(els.questionNo.value);
    const idx = state.filtered.findIndex((r) => r.no === target);
    if (idx >= 0) {
      state.currentIndex = idx;
      renderCard();
    }
  });
  els.showOnlyUnchecked.addEventListener("change", applyFilterAndRender);
  els.prev.addEventListener("click", () => move(-1));
  els.next.addEventListener("click", () => move(1));
  els.shuffle.addEventListener("click", moveRandom);
  els.checkAnswer.addEventListener("click", checkAnswer);
  els.revealAnswer.addEventListener("click", revealAnswer);

  els.checked.addEventListener("change", () => {
    const rec = currentRecord();
    if (!rec) return;
    state.storage.checked[recordKey(rec)] = els.checked.checked;
    saveStorage(state.storage);
    renderProgress();
  });

  els.memo.addEventListener("input", () => {
    const rec = currentRecord();
    if (!rec) return;
    state.storage.memo[recordKey(rec)] = els.memo.value;
    saveStorage(state.storage);
  });

  function flatten(sets) {
    const out = [];
    sets.forEach((set) => {
      (set.questions || []).forEach((q) => {
        out.push({
          year: set.year,
          subject: set.subject,
          no: q.no,
          prompt: q.prompt,
          choices: q.choices || [],
          choiceCount: q.choice_count,
          answer: q.answer
        });
      });
    });
    return out.sort((a, b) => {
      if (a.subject !== b.subject) return a.subject.localeCompare(b.subject, "ja");
      if (a.year !== b.year) return b.year.localeCompare(a.year, "ja");
      return a.no - b.no;
    });
  }

  function buildFilters(records) {
    const subjects = ["すべて", ...Array.from(new Set(records.map((r) => r.subject)))];
    const years = ["すべて", ...Array.from(new Set(records.map((r) => r.year))).sort().reverse()];

    subjects.forEach((s) => {
      const o = document.createElement("option");
      o.value = s;
      o.textContent = s;
      els.subject.appendChild(o);
    });

    years.forEach((y) => {
      const o = document.createElement("option");
      o.value = y;
      o.textContent = y;
      els.year.appendChild(o);
    });
  }

  function rebuildNoFilter() {
    const current = currentRecord()?.no || null;
    els.questionNo.innerHTML = "";
    state.filtered.forEach((r) => {
      const o = document.createElement("option");
      o.value = String(r.no);
      o.textContent = `No.${r.no}`;
      if (current === r.no) o.selected = true;
      els.questionNo.appendChild(o);
    });
  }

  function applyFilterAndRender() {
    const subject = els.subject.value;
    const year = els.year.value;
    const onlyUnchecked = els.showOnlyUnchecked.checked;

    state.filtered = state.records.filter((r) => {
      if (subject && subject !== "すべて" && r.subject !== subject) return false;
      if (year && year !== "すべて" && r.year !== year) return false;
      if (onlyUnchecked && getChecked(r)) return false;
      return true;
    });

    state.currentIndex = 0;
    rebuildNoFilter();
    renderCard();
    renderProgress();
  }

  function move(step) {
    if (!state.filtered.length) return;
    state.currentIndex = (state.currentIndex + step + state.filtered.length) % state.filtered.length;
    rebuildNoFilter();
    renderCard();
  }

  function moveRandom() {
    if (!state.filtered.length) return;
    state.currentIndex = Math.floor(Math.random() * state.filtered.length);
    rebuildNoFilter();
    renderCard();
  }

  function currentRecord() {
    return state.filtered[state.currentIndex];
  }

  function renderCard() {
    const rec = currentRecord();
    if (!rec) {
      els.cardTitle.textContent = "対象データがありません";
      els.meta.textContent = "抽出できた問題がありません。科目・年度を変更してください。";
      els.prompt.textContent = "";
      els.choices.innerHTML = "";
      els.result.textContent = "";
      els.memo.value = "";
      els.checked.checked = false;
      return;
    }

    els.cardTitle.textContent = `${rec.subject} / ${rec.year} / No.${rec.no}`;
    els.meta.textContent = `${state.currentIndex + 1}件目 / ${state.filtered.length}件`;
    els.prompt.textContent = rec.prompt;
    els.result.textContent = "";
    renderChoices(rec);

    const key = recordKey(rec);
    els.checked.checked = Boolean(state.storage.checked[key]);
    els.memo.value = state.storage.memo[key] || "";
  }

  function renderChoices(rec) {
    els.choices.innerHTML = "";
    const hasChoiceTexts = Array.isArray(rec.choices) && rec.choices.length > 0;
    const count = hasChoiceTexts
      ? rec.choices.length
      : Math.max(Number(rec.answer || 0), Math.max(2, Number(rec.choiceCount || 4)));
    for (let i = 1; i <= count; i++) {
      const label = document.createElement("label");
      label.className = "choice";
      const input = document.createElement("input");
      input.type = "radio";
      input.name = "choice";
      input.value = String(i);
      label.appendChild(input);
      const text = hasChoiceTexts ? `${i}. ${rec.choices[i - 1] || ""}` : `選択肢 ${i}`;
      label.appendChild(document.createTextNode(text));
      els.choices.appendChild(label);
    }
  }

  function selectedChoice() {
    const checked = document.querySelector("input[name='choice']:checked");
    return checked ? Number(checked.value) : null;
  }

  function checkAnswer() {
    const rec = currentRecord();
    if (!rec) return;
    const picked = selectedChoice();
    if (!picked) {
      els.result.textContent = "選択肢を選んでください。";
      return;
    }
    if (picked === rec.answer) {
      els.result.textContent = `正解です（正解: ${rec.answer}）`;
      state.storage.checked[recordKey(rec)] = true;
      els.checked.checked = true;
      saveStorage(state.storage);
      renderProgress();
    } else {
      els.result.textContent = `不正解です（あなた: ${picked} / 正解: ${rec.answer}）`;
    }
  }

  function revealAnswer() {
    const rec = currentRecord();
    if (!rec) return;
    els.result.textContent = `正解は ${rec.answer} です。`;
  }

  function renderProgress() {
    const all = state.filtered.length;
    const done = state.filtered.filter((r) => getChecked(r)).length;
    els.progressText.textContent = `進捗: ${done} / ${all}`;
    const pct = all === 0 ? 0 : Math.round((done / all) * 100);
    els.progressBar.style.width = `${pct}%`;
  }

  function recordKey(r) {
    return `${r.year}__${r.subject}__${r.no}`;
  }

  function getChecked(r) {
    return Boolean(state.storage.checked[recordKey(r)]);
  }

  function loadStorage() {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (!raw) return { checked: {}, memo: {} };
      const parsed = JSON.parse(raw);
      return {
        checked: parsed.checked || {},
        memo: parsed.memo || {}
      };
    } catch (_e) {
      return { checked: {}, memo: {} };
    }
  }

  function saveStorage(value) {
    localStorage.setItem(STORE_KEY, JSON.stringify(value));
  }
})();
