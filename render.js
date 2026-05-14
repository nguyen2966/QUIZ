
(function () {

  // ── helpers ───────────────────────────────────────────────
  function esc(str) {
    return String(str)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;")
      .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  // ── build one quiz card ───────────────────────────────────
  function buildCard(quiz, index) {
    const num   = String(index + 1).padStart(2, "0");
    const delay = (0.05 + index * 0.10).toFixed(2);

    const article = document.createElement("article");
    article.className = "quiz-card";
    article.style.animationDelay = delay + "s";

    const badgeHtml = quiz.badge
      ? `<span class="card-badge">${esc(quiz.badge)}</span>`
      : "";

    article.innerHTML = `
      <div class="card-header">
        <div class="card-meta">
          <span class="card-number">Quiz ${esc(num)}</span>
          <span class="card-title">${esc(quiz.title)}</span>
          <span class="card-desc">${esc(quiz.desc)}</span>
        </div>
        ${badgeHtml}
      </div>
      <div class="card-embed">
        <iframe
          src="${esc(quiz.embedUrl)}"
          title="${esc(quiz.title)} — Wayground"
          allowfullscreen
        ></iframe>
        <a href="https://wayground.com/admin?source=embedFrame" target="_blank" rel="noopener">
          Explore more at Wayground ↗
        </a>
      </div>
    `;
    return article;
  }

  // ── build subject section (hidden by default) ─────────────
  function buildSection(subject, idx) {
    const section = document.createElement("section");
    section.className = "subject-section";
    section.dataset.idx = idx;
    if (idx !== 0) section.hidden = true;

    if (!subject.quizzes || subject.quizzes.length === 0) {
      section.innerHTML = `<p class="empty-msg">No quizzes yet for this subject.</p>`;
      return section;
    }

    subject.quizzes.forEach((quiz, i) => section.appendChild(buildCard(quiz, i)));
    return section;
  }

  // ── build sidebar subject list ────────────────────────────
  function buildSidebar(subjects, onSelect) {
    const nav = document.createElement("nav");
    nav.className = "subject-nav";
    nav.setAttribute("aria-label", "Subjects");

    subjects.forEach((subj, idx) => {
      const btn = document.createElement("button");
      btn.className = "subject-btn" + (idx === 0 ? " active" : "");
      btn.dataset.idx = idx;
      btn.innerHTML = `
        <span class="subj-icon" aria-hidden="true">${subj.icon || "📄"}</span>
        <span class="subj-label">${esc(subj.subject)}</span>
        <span class="subj-count">${subj.quizzes ? subj.quizzes.length : 0}</span>
      `;
      btn.addEventListener("click", () => onSelect(idx));
      nav.appendChild(btn);
    });

    return nav;
  }

  // ── main render ───────────────────────────────────────────
  function render() {
    const root = document.getElementById("quiz-container");
    if (!root) { console.error("render.js: #quiz-root not found."); return; }

    const list = window.QUIZ_LIST;
    if (!Array.isArray(list) || list.length === 0) {
      root.innerHTML = `<p class="empty-msg">No subjects added yet. Open quiz_list.js and add one!</p>`;
      return;
    }

    // build sections first so we can switch them
    const sections = list.map((subj, i) => buildSection(subj, i));

    // current active index
    let active = 0;

    function selectSubject(idx) {
      if (idx === active) return;
      // hide old
      sections[active].hidden = true;
      navBtns[active].classList.remove("active");
      // show new
      active = idx;
      sections[active].hidden = false;
      navBtns[active].classList.add("active");
      // scroll content to top
      contentPane.scrollTop = 0;
    }

    const sidebar = buildSidebar(list, selectSubject);
    const navBtns = Array.from(sidebar.querySelectorAll(".subject-btn"));

    // assemble layout
    const layout = document.createElement("div");
    layout.className = "layout";

    const contentPane = document.createElement("div");
    contentPane.className = "content-pane";
    sections.forEach(s => contentPane.appendChild(s));

    layout.appendChild(sidebar);
    layout.appendChild(contentPane);
    root.appendChild(layout);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", render);
  } else {
    render();
  }

})();