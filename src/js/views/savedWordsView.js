import View from "./View.js";

class SavedWordsView extends View {
  addHandlerRenderPage(handler) {
    document.addEventListener("click", function (e) {
      const btn = e.target.closest(".saved-words-btn");
      if (!btn || btn.classList.contains("sidebar-btn-selected")) return;

      const confirmed = handler();

      if (confirmed) {
        const previouslySelected = document.querySelector(".sidebar-btn-selected");
        previouslySelected.classList.remove("sidebar-btn-selected");

        btn.classList.add("sidebar-btn-selected");
      }
    });
  }

  addHandlerSaveWord(handler) {
    document.addEventListener("click", function (e) {
      const btn = e.target.closest(".save-btn");

      const wordShowing = document.querySelector(".word-details");

      if (!btn || wordShowing) return;

      const isSaved = btn.getAttribute("saved");

      btn.setAttribute("saved", isSaved === "true" ? "false" : "true");

      const selectedWord = e.target
        .closest(".saved-word-item")
        .querySelector(".saved-word").textContent;

      handler(selectedWord);
    });
  }

  addHandlerSort(handler) {
    document.addEventListener("click", (e) => {
      const btn = e.target.closest(".dropdown-item");
      if (!btn) return;

      const select = document.querySelector(".dropdown-select .select");

      select.textContent = "Sort By " + btn.textContent;

      handler(btn.textContent);
    });
  }

  addHandlerShowWord(handler) {
    document.addEventListener("click", (e) => {
      const clicked = e.target.closest(".saved-word-item");
      const btn = e.target.closest(".save-btn");

      if (!clicked || btn) return;

      const selected = clicked.querySelector(".saved-word").textContent;

      handler(selected);
    });
  }

  addHandlerButtons(handler) {
    document.addEventListener("click", (e) => {
      const clicked = e.target.closest(".saved-buttons");

      if (!clicked) return;

      const currentWord = document.querySelector(".word-title").textContent;

      handler(clicked.textContent, currentWord);
    });
  }

  _generateMarkup(markup) {
    switch (markup) {
      case "list":
        return `
    <div class="saved-words-list">
      <ul>
      ${this._data
        .map(
          (el) => `<li class="saved-word-item">
      <div class="saved-word-info">
        <h1 class="saved-word">${el.word}</h1>
        <p class="saved-partsOfSpeech">
          ${el.partsOfSpeech}
        </p>
      </div>
      <div class="saved-word-details">
        <p class="saved-date">📅\t${new Date(el.date).toDateString()} <br> ⌚\t${new Date(
            el.date
          ).toLocaleTimeString()}</p>
        <button class="btn save-btn" saved="${el.saved}">⭐</button>
      </div>
    </li>`
        )
        .join("")}
      </ul>
    </div>`;

      case "sort":
        return `
        <div class="dropdown-area">
          <div class="dropdown">
            <div class="dropdown-select">
              <span class="select"> Sort By ${this._data === "" ? "Date" : this._data}</span>
              <span class="material-symbols-outlined"> arrow_drop_down </span>
            </div>
            <div class="dropdown-list">
              <div class="dropdown-item">Date</div>
              <div class="dropdown-item">Word</div>
            </div>
          </div>
        </div>`;

      case "buttons":
        return `
      <div class="buttonsShowWord">
      <button class="prev-btn saved-buttons">previous word</button>
        <button class="list-btn saved-buttons">go back to the list</button>
        <button class="next-btn saved-buttons">next word</button>
      </div>`;

      case "initial":
        return `
        <div class="saved-game-initial">
          <p>Use "⭐" button to save a word.</p>
          <p>Saved Words will appear here.</p>
        </div>`;

      default:
        break;
    }
  }
}

export default new SavedWordsView();

{
  /* <div class="sort-options">
      <label>Sort By</label>
      <select class="select-sort">
        <option value="date">Date</option>
        <option value="word" ${this._data === "word" && "selected"}>Word</option>
      </select>
    </div> */
}
