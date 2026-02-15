(() => {
  const DATA_PATH = "data/short_answer_qa_by_subject.json";
  const STORE_KEY = "barexam_short_answer_state_v1";

  const els = {
    subject: document.getElementById("subject"),
    year: document.getElementById("year"),
    prev: document.getElementById("prev"),
    next: document.getElementById("next"),
    shuffle: document.getElementById("shuffle"),
    showOnlyUnchecked: document.getElementById("showOnlyUnchecked"),
    cardTitle: document.getElementById("cardTitle"),
    meta: document.getElementById("meta"),
    openQuestion: document.getElementById("openQuestion"),
    revealAnswer: document.getElementById("revealAnswer"),
    openAnswer: document.getElementById("openAnswer"),
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
      state.records = flatten(data.subjects);
      buildFilters(state.records);
      applyFilterAndRender();
    })
    .catch((err) => {
      els.cardTitle.textContent = "データの読み込みに失敗しました";
      els.meta.textContent = String(err);
    });

  els.subject.addEventListener("change", applyFilterAndRender);
  els.year.addEventListener("change", applyFilterAndRender);
  els.showOnlyUnchecked.addEventListener("change", applyFilterAndRender);
  els.prev.addEventListener("click", () => move(-1));
  els.next.addEventListener("click", () => move(1));
  els.shuffle.addEventListener("click", moveRandom);
  els.revealAnswer.addEventListener("click", () => {
    els.openAnswer.classList.remove("hidden");
  });
  els.checked.addEventListener("change", () => {
    const rec = currentRecord();
    if (!rec) return;
    const key = recordKey(rec);
    state.storage.checked[key] = els.checked.checked;
    saveStorage(state.storage);
    renderProgress();
  });
  els.memo.addEventListener("input", () => {
    const rec = currentRecord();
    if (!rec) return;
    const key = recordKey(rec);
    state.storage.memo[key] = els.memo.value;
    saveStorage(state.storage);
  });

  function flatten(subjectObj) {
    const out = [];
    Object.entries(subjectObj).forEach(([subject, rows]) => {
      rows.forEach((row) => out.push({ ...row, subject }));
    });
    return out.sort((a, b) => {
      if (a.subject !== b.subject) return a.subject.localeCompare(b.subject, "ja");
      return a.year.localeCompare(b.year, "ja");
    });
  }

  function buildFilters(records) {
    const subjects = ["すべて", ...new Set(records.map((r) => r.subject))];
    const years = ["すべて", ...new Set(records.map((r) => r.year)).sort().reverse()];

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
    renderCard();
    renderProgress();
  }

  function move(step) {
    if (!state.filtered.length) return;
    state.currentIndex = (state.currentIndex + step + state.filtered.length) % state.filtered.length;
    renderCard();
  }

  function moveRandom() {
    if (!state.filtered.length) return;
    state.currentIndex = Math.floor(Math.random() * state.filtered.length);
    renderCard();
  }

  function currentRecord() {
    return state.filtered[state.currentIndex];
  }

  function renderCard() {
    const rec = currentRecord();
    if (!rec) {
      els.cardTitle.textContent = "対象データがありません";
      els.meta.textContent = "フィルタを変更してください。";
      els.openQuestion.href = "#";
      els.openAnswer.href = "#";
      els.openAnswer.classList.add("hidden");
      els.memo.value = "";
      els.checked.checked = false;
      return;
    }

    els.cardTitle.textContent = `${rec.subject} / ${rec.year}`;
    els.meta.textContent = `${state.currentIndex + 1}件目 / ${state.filtered.length}件`;
    els.openQuestion.href = rec.question_pdf_url;
    els.openAnswer.href = rec.answer_pdf_url;
    els.openAnswer.classList.add("hidden");

    const key = recordKey(rec);
    els.checked.checked = Boolean(state.storage.checked[key]);
    els.memo.value = state.storage.memo[key] || "";
  }

  function renderProgress() {
    const all = state.filtered.length;
    const done = state.filtered.filter((r) => getChecked(r)).length;
    els.progressText.textContent = `進捗: ${done} / ${all}`;
    const pct = all === 0 ? 0 : Math.round((done / all) * 100);
    els.progressBar.style.width = `${pct}%`;
  }

  function recordKey(r) {
    return `${r.year}__${r.subject}`;
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
