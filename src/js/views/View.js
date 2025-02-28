export default class View {
  _data;

  render(data, div, generateMarkup) {
    // if (!data || (typeof data === "object" && (data === null || data.length === 0))) {
    //   return this.renderError();
    // }

    this._data = data;

    const markup = this._generateMarkup(generateMarkup);

    const divExists = document.querySelector(div);

    if (divExists) {
      divExists.innerHTML = markup;
    } else {
      const newDiv = document.createElement("div");
      newDiv.classList.add(div.substring(1));
      newDiv.innerHTML = markup;

      document.querySelector(".content").insertAdjacentElement("beforeend", newDiv);
    }
  }

  renderError(message, selector) {
    const markup = `<div class="error">${message}</div>`;

    document.querySelector(selector).innerHTML = markup;
  }

  renderLoading(selector) {
    const markup = `<p class="loading">LOADING...</p>`;

    document.querySelector(selector).innerHTML = markup;
  }

  // remove(selector) {
  //   const div = document.querySelector(selector);
  //   if (div) div.remove();
  // }

  clear(selector) {
    const div = document.querySelector(selector);
    if (div) div.innerHTML = "";
  }
}
