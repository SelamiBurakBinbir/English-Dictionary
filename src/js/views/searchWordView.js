import View from "./View.js";

class SearchWordView extends View {
  constructor() {
    super();
    this._addHandlerSearch();
    this._addHandlerPlayAudio();
  }

  addHandlerRenderPage(handler) {
    document.addEventListener("click", function (e) {
      const btn = e.target.closest(".search-word-btn");
      if (!btn || btn.classList.contains("sidebar-btn-selected")) return;

      const confirmed = handler();

      if (confirmed) {
        const previouslySelected = document.querySelector(".sidebar-btn-selected");
        previouslySelected.classList.remove("sidebar-btn-selected");

        btn.classList.add("sidebar-btn-selected");
      }
    });
  }

  addHandlerRefreshWithHeader(handler) {
    document.querySelector(".header").addEventListener("click", handler);
  }

  _addHandlerSearch() {
    document.addEventListener("submit", this._SearchByQuery.bind(this));
  }

  _SearchByQuery(e) {
    const searchField = document.querySelector(".search-field");
    if (!searchField) return;

    e.preventDefault();

    const query = searchField.value.trim();

    searchField.value = "";

    if (!query) return;

    window.location.hash = query;
  }

  addHandlerRenderWord(handler) {
    function handlerHashChange() {
      const searchWordSelected = document
        .querySelector(".search-word-btn")
        .classList.contains("sidebar-btn-selected");

      if (!searchWordSelected) {
        const previouslySelected = document.querySelector(".sidebar-btn-selected");
        previouslySelected.classList.remove("sidebar-btn-selected");
        document.querySelector(".search-word-btn").classList.add("sidebar-btn-selected");
      }
      handler(searchWordSelected);
    }

    window.addEventListener("hashchange", handlerHashChange);
    window.addEventListener("load", handler);
  }

  addHandlerSaveWord(handler) {
    document.addEventListener("click", function (e) {
      const btn = e.target.closest(".save-btn");

      const wordShowing = document.querySelector(".word-details");

      if (!btn || !wordShowing) return;

      const isSaved = btn.getAttribute("saved");

      btn.setAttribute("saved", isSaved === "true" ? "false" : "true");

      const sidebarSelected = document.querySelector(".sidebar-btn-selected .title").textContent;

      handler(sidebarSelected);
    });
  }

  _addHandlerPlayAudio() {
    document.addEventListener("click", (e) => {
      const btn = e.target.closest(".phonetic-spelling");
      if (!btn) return;

      const div = e.target.closest(".pronunciation");

      const country = div.querySelector(".flag").getAttribute("alt").slice(0, 2);

      const audio = this._data.phonetics.filter((el) => el.country === country)[0].audio;

      new Audio(audio).play();
    });
  }

  _generateMarkupPhonetic(el) {
    return `<div class="pronunciation">
    <img class="flag" src="src/img/${el.country}.png" alt="${el.country} flag" />
        <p class="phonetic-spelling">📢 ${el.text}</p>
    </div>`;
  }

  _generateMarkupPartOfSpeech(el) {
    return `
    <div class="partOfSpeech-section">
      <h2 class="partOfSpeech-title">${el.partOfSpeech}</h2>
      <div class="meanings-section">
        <div class="meanings">
        ${el.definitions.map(this._generateMarkupMeaning).join("")}
        </div>
        <div class="synonyms-antonyms-section">
          ${
            el.synonyms.length !== 0
              ? `
          <div class="synonyms">
            <h4 class="synonyms-title">synonyms</h4>
            <ul>${el.synonyms.map((elS) => `<li>${elS}</li>`).join("")}</ul>
          </div>`
              : ""
          }
          ${
            el.antonyms.length !== 0
              ? `
          <div class="antonyms">
            <h4 class="antonyms-title">antonyms</h4>
            <ul>${el.antonyms.map((elA) => `<li>${elA}</li>`).join("")}</ul>
          </div>`
              : ""
          }
        </div>
      </div>
    </div>`;
  }

  _generateMarkupMeaning(el, index) {
    return `
    <div class="meaning">
      <p class="definition">${index + 1}- ${el.definition}</p>
      ${el.example ? `<p class="example">${el.example}</p>` : ""}
    </div>`;
  }

  _generateMarkup(markup) {
    switch (markup) {
      case "word":
        return `
    <div class="word-details">
      <header class="word-header">
        <div class="word-title-section">
            <h1 class="word-title">${this._data.word}</h1>
            <button class="save-btn" saved="${this._data.saved ? "true" : "false"}">⭐</button>
        </div>
        <p class="word-header-partsOfSpeech">${this._data.partsOfSpeech}</p>
        <div class="pronunciation-section">
        ${
          this._data.phonetics.map(this._generateMarkupPhonetic).join("") ||
          `<p class="no-pronunciation">📢 No audio found</p>`
        }
        </div>
      </header>
      <article class="word-article">
      ${this._data.meanings.map(this._generateMarkupPartOfSpeech.bind(this)).join("")}
      </article>
    </div>`;

      case "searchBar":
        return `
              <form class="search-bar">
                <input
                  type="search"
                  class="search-field"
                  placeholder="Search Word..."
                  autocomplete="off"
                />
                <button class="search-btn">
                  <span class="material-symbols-outlined"> search </span>
                </button>
              </form>`;

      case "initial":
        return `
        <p class="word-initial">
      Search an english word. Its meanings, phonetics, synonyms and antonyms will appear here.
      </p>`;

      default:
        break;
    }
  }
}

export default new SearchWordView();
