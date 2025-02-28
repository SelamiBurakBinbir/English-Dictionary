import View from "./View.js";

class PlayGameView extends View {
  _maxquestionLimit;
  _wordLimit;
  _countdownTime;
  _countdownInterval;
  _countdownTimeFirst;
  _audio;
  _ASArray;

  constructor() {
    super();
    this._countdownTime = 0;
    this._countdownInterval = null;
    this._enforceTimeValue();
    this._playAudio();
  }

  addHandlerRenderPage(handler) {
    document.addEventListener("click", function (e) {
      const btn2 = e.target.closest(".playAgainBtn");
      const btn = btn2
        ? document.querySelector(".play-game-btn")
        : e.target.closest(".play-game-btn");

      if (!btn || (!btn2 && btn.classList.contains("sidebar-btn-selected"))) return;

      const previouslySelected = document.querySelector(".sidebar-btn-selected");
      previouslySelected.classList.remove("sidebar-btn-selected");

      btn.classList.add("sidebar-btn-selected");

      handler();
    });
  }

  addHandlerCreateQuiz(handler) {
    document.addEventListener("click", (e) => {
      const btn = e.target.closest(".quizButton");
      if (!btn || btn.getAttribute("playable") !== "true") return;

      const previouslySelected = document.querySelector(".quizButton-selected");
      if (previouslySelected) {
        previouslySelected.classList.remove("quizButton-selected");
        previouslySelected.removeChild(document.querySelector(".tick"));
      } else {
        document.querySelector(".startGameButton").style.opacity = 0.2;
      }

      btn.classList.add("quizButton-selected");
      btn.insertAdjacentHTML(
        "beforeend",
        '<span class="material-symbols-outlined tick">done_outline</span>'
      );

      const maxquestionLimit = handler(btn);
      this._maxquestionLimit = maxquestionLimit;

      const questionLimitSelect = document.querySelector("#questionLimit");
      questionLimitSelect.innerHTML = ""; // Eski seçenekleri temizle

      // Seçenekleri dinamik olarak oluştur
      for (let i = 4; i <= maxquestionLimit; i++) {
        questionLimitSelect.insertAdjacentHTML(
          "beforeend",
          `<option value="${i}">${i} Questions</option>`
        );
      }

      const timeAndAmount = document.querySelector(".timeAndAmount");
      timeAndAmount.style.opacity = "1";
      timeAndAmount.style.pointerEvents = "auto";
    });
  }

  addHandlerRenderQuiz(handler) {
    document.addEventListener("click", (e) => {
      const btn = e.target.closest(".startGameButton");
      const quizSelected = document.querySelector(".quizButton-selected");
      const timeLimitMinutes = Number(document.querySelector("#timeLimitMinutes")?.value);
      const timeLimitSeconds = Number(document.querySelector("#timeLimitSeconds")?.value);
      const wordLimit = Number(document.querySelector(".questionLimit")?.value);
      const timeLimit = timeLimitMinutes * 60 + timeLimitSeconds;

      if (!btn || !quizSelected || timeLimit < 1) return;

      this._wordLimit = wordLimit;
      this._countdownTimeFirst = timeLimit;

      handler(wordLimit);

      this._startCountdown(timeLimit);
    });
  }

  _startCountdown(timeLimit) {
    this._countdownTime = timeLimit;
    const countdownElement = document.querySelector(".countDown");

    const updateCountdown = () => {
      const minutes = Math.floor(this._countdownTime / 60);
      const seconds = this._countdownTime % 60;

      countdownElement.textContent =
        String(minutes).padStart(2, "0") + ":" + String(seconds).padStart(2, "0");

      if (this._countdownTime > 0) {
        this._countdownTime--;
      } else {
        clearInterval(this._countdownInterval);
        alert("Süre doldu!");
      }
    };

    updateCountdown();

    this._countdownInterval = setInterval(updateCountdown, 1000);
  }

  _stopCountdown() {
    if (this._countdownInterval) {
      clearInterval(this._countdownInterval);
    }
  }

  _enforceTimeValue() {
    document.addEventListener("change", (event) => {
      const btn = event.target.closest(".timeAndAmount");

      if (!btn) return;

      // Check if the event target is one of the dynamically added select elements
      if (event.target.id === "timeLimitMinutes" || event.target.id === "timeLimitSeconds") {
        const timeLimitMinutes = Number(document.querySelector("#timeLimitMinutes")?.value || 0);
        const timeLimitSeconds = Number(document.querySelector("#timeLimitSeconds")?.value || 0);
        const timeLimit = timeLimitMinutes * 60 + timeLimitSeconds;

        const startGameButton = document.querySelector(".startGameButton");

        startGameButton.style.opacity = timeLimit > 0 ? 1 : 0.2;
      }
    });
  }

  addHandlerFinish(handler) {
    document.addEventListener("click", (e) => {
      const btnFinish = e.target.closest(".finishQuiz");
      const btnQuit = e.target.closest(".quitButton");

      if (!btnFinish && !btnQuit) return;

      if (btnQuit) {
        const userConfirmed = confirm("Do you want to exit the quiz?");
        if (!userConfirmed) return;
      }

      handler(this._countdownTimeFirst - this._countdownTime, this._wordLimit);
    });
  }

  addHandlerSelectOption(handler) {
    document.addEventListener("click", (e) => {
      const btn = e.target.closest(".option");
      const next = document.querySelector(".nextQuestion");
      const finish = document.querySelector(".finishQuiz");

      if (!btn || next || finish) return;

      const previouslySelected = document.querySelector(".option-selected");

      if (previouslySelected) previouslySelected.classList.remove("option-selected");

      btn.classList.add("option-selected");

      handler();
    });
  }

  addHandlerCheckAnswer(handler) {
    document.addEventListener("click", (e) => {
      const btn = e.target.closest(".checkAnswer");

      if (!btn) return;

      this._stopCountdown();

      const [_, ...answer] = document.querySelector(".option-selected").textContent.split(" ");
      const correctAnswer = handler(answer.join(" "));

      let options;

      if (answer.join(" ") === correctAnswer) {
        options = document.querySelectorAll(".option-box .option");
      } else {
        options = document.querySelectorAll(".option-box .option:not(.option-selected)");
      }

      options.forEach((option) => {
        option.style.transition = "background-color 0.3s ease";

        const [_, ...answerGiven] = option.textContent.split(" ");

        if (answerGiven.join(" ") === correctAnswer) {
          option.classList.add("correctAnswer");
        } else {
          option.classList.add("wrongAnswer");
        }
      });
    });
  }

  addHandlerNextQuestion(handler) {
    document.addEventListener("click", (e) => {
      const btn = e.target.closest(".nextQuestion");

      if (!btn) return;

      this._startCountdown(this._countdownTime);

      handler();
    });
  }

  _playAudio() {
    document.addEventListener("click", (e) => {
      const btn = e.target.closest(".audioPlay");

      if (!btn) return;

      const audio = new Audio(this._audio);
      audio.play();
    });
  }

  addHandlerASPrevNext(handler) {
    document.addEventListener("click", (e) => {
      const btnPrev = e.target.closest(".ASPrev");
      const btnNext = e.target.closest(".ASNext");

      if (!btnPrev && !btnNext) return;

      const currentPOS = document.querySelector(".ASPOS").textContent;

      const index = this._ASArray.findIndex((item) => item[0] === currentPOS);

      console.log(this._ASArray);

      let newIndex;

      if (btnPrev) newIndex = index === 0 ? this._ASArray.length - 1 : index - 1;
      if (btnNext) newIndex = index === this._ASArray.length - 1 ? 0 : index + 1;

      handler(newIndex);
    });
  }

  _generateMarkup(markup) {
    switch (markup) {
      case "startPage":
        return `
        <div class="quiz-start-page">

          <div class="quiz-choose">
            <div class="quizButtons">
            
              <div class="gameSection meaningSection">
  <div class="quizButton meaningButton" playable="${this._data.meaningCount >= 4}">
    <p>
      <span class="material-symbols-outlined">description</span>&nbsp&nbsp meaning game ${
        this._data.meaningCount >= 4 ? "" : "(not playable)"
      }
    </p>
  </div>
  <div class="quizInfo meaningInfo">
    <span class="material-symbols-outlined meaningInfo-symbol quiz-symbol" style="font-size: 32px; color: #555">help</span>
    <div class="tooltip">Words in the saved words list that have at least one example sentence provided will be included in quiz questions.
     You need at least 4 words to play.<br>(matching words: ${this._data.meaningCount})</div>
  </div>
</div>

<div class="gameSection antonymsynonymSection">
  <div class="quizButton antonymsynonymButton" playable="${this._data.antonymSynonymCount >= 4}">
    <p>
      <span class="material-symbols-outlined">contrast</span>&nbsp&nbsp synonym antonym game ${
        this._data.antonymSynonymCount >= 4 ? "" : "(not playable)"
      }
    </p>
  </div>
  <div class="quizInfo antonymsynonymInfo">
    <span class="material-symbols-outlined antonymsynonymInfo-symbol quiz-symbol" style="font-size: 32px; color: #555">help</span>


    <div class="tooltip">Words in the saved words list that have at least one antonym and one synonym provided will be included in quiz questions.
     You need at least 4 words to play.<br>(matching words: ${this._data.antonymSynonymCount})</div>
  </div>
</div>

<div class="gameSection pronunciationSection">
  <div class="quizButton pronunciationButton" playable="${this._data.pronunciationCount >= 4}">
    <p>
      <span class="material-symbols-outlined">volume_up</span>&nbsp&nbsp pronunciation game ${
        this._data.pronunciationCount >= 4 ? "" : "(not playable)"
      }
    </p>
  </div>
  <div class="quizInfo pronunciationInfo">
    <span class="material-symbols-outlined pronunciationInfo-symbol quiz-symbol" style="font-size: 32px; color: #555">help</span>
    <div class="tooltip">Words in the saved words list that have at least one pronunciation provided will be included in quiz questions.
     You need at least 4 words to play.<br>(matching words: ${this._data.pronunciationCount})</div>
  </div>
</div>
            </div>
      <div class="timeAndAmount">
        <div class="timeInput">
  <label for="timeLimitMinutes">Select Time:</label>
  <p class="maxMinInput">(max: 59 minutes, 59 seconds)</p>
  <div class="timeSelectContainer">
    <select id="timeLimitMinutes" class="input-field timeLimit quizInput">
  ${Array.from(
    { length: 60 },
    (_, i) => `<option value="${i}">${String(i).padStart(2, "0")} Min</option>`
  ).join("")}
</select>
    <span>:</span>
    <select id="timeLimitSeconds" class="input-field timeLimit quizInput">
  ${Array.from(
    { length: 60 },
    (_, i) => `<option value="${i}">${String(i).padStart(2, "0")} Sec</option>`
  ).join("")}
</select>
  </div>
</div>
        <div class="amountInput">
  <label for="questionLimit">Select number of Questions:</label>
  <p class="maxMinInput">(min: 4, max: matching words)</p>
  <select id="questionLimit" class="input-field questionLimit quizInput">
    <!-- Options dynamically generated in JavaScript -->
  </select>
</div>
      </div>
          </div>
        <button class="startGameButton">Start Game</button>
        </div>
        `;

      case "initial":
        return `<div class="saved-game-initial">
        <p>Please save at least 4 words in order to play a game.</p>
        </div>`;

      case "quiz":
        return `
    		<div class="header-box">
        	  <div class="div1 box countDown"></div>
        	  <div class="div2 box questionCount"></div>
        	  <div class="div3"></div>
        </div>
        <div class="question-box div4">
          <div class="questionDiv div8"></div>
          <div class="questionAfterwards div9"></div>
        </div>
        <div class="option-box div5"></div>
        <div class="action-box">
            <div class="div6"></div>
            <div class="div7">
              <div class="action quitButton">QUIT</div>
            </div>
        </div>`;

      case "questionNumber":
        return `${this._data + 1}/${this._wordLimit}`;

      case "options":
        return `
            <div class="option">a) ${this._data[0]}</div>
            <div class="option">b) ${this._data[1]}</div>
        	  <div class="option">c) ${this._data[2]}</div>
        	  <div class="option">d) ${this._data[3]}</div>`;

      case "meaningQuestion":
        return `<div class="meaningQuestion">${this._data.definition}</div>`;

      case "meaningQuestionAfterwards":
        return `<div class="questionExample">
        <p><span class="questionExamplePOS">${this._data.partOfSpeech}</span>
        &nbsp;/&nbsp;<span class="questionExampleSentence">${this._data.example}</span></p>
        </div>`;

      case "ASQuestion":
        const partsArray = Object.entries(this._data.partsOfSpeech);
        this._ASArray = partsArray;
        return `<div class="ASQuestion">
        
        <div class="ASPrev"><span style="font-size: 40px" class="material-symbols-outlined">
chevron_left
</span></div>
        <div class="ASSection div10">
          <p class="ASPOS">${partsArray[0][0]}</p>
          <div class="ASLayout">
            <div class="ASSynonyms">
            <h4 class="synonyms-title">synonyms</h4>
            <ul>${partsArray[0][1].synonyms.map((elS) => `<li>${elS}</li>`).join("")}</ul></div>
            <div class="ASAntonyms">
            <h4 class="antonyms-title">antonyms</h4>
            <ul>${partsArray[0][1].antonyms.map((elS) => `<li>${elS}</li>`).join("")}</ul></div>
          </div>
        </div>
        <div class="ASNext"><span style="font-size: 40px" class="material-symbols-outlined">
chevron_right
</span></div>
        </div>`;

      case "ASPOS":
        const index = this._ASArray[this._data];
        return `<p class="ASPOS">${index[0]}</p>
          <div class="ASLayout">
            <div class="ASSynonyms">
            <h4 class="synonyms-title">synonyms</h4>
            <ul>${index[1].synonyms.map((elS) => `<li>${elS}</li>`).join("")}</ul></div>
            <div class="ASAntonyms">
            <h4 class="antonyms-title">antonyms</h4>
            <ul>${index[1].antonyms.map((elS) => `<li>${elS}</li>`).join("")}</ul></div>
          </div>
        `;

      case "pronunciationQuestion":
        this._audio = this._data.phonetics.audio;
        return `<div class="pronunciationQuestion"><span class="audioPlay">📢</span></div>`;

      case "pronunciationQuestionAfterwards":
        return `<div class="questionExample">
        <p><span class="questionExamplePOS">
        <img class="flag" src="src/img/${this._data.phonetics.country}.png" alt="${this._data.phonetics.country} flag" /></span>
        &nbsp;/&nbsp;<span class="questionExampleSentence">${this._data.phonetics.text}</span></p>
        </div>`;

      case "check":
        return `<div class="action checkAnswer">CHECK</div>`;

      case "next":
        return `<div class="action nextQuestion">NEXT&nbsp<span class="material-symbols-outlined">arrow_forward</span></div>`;

      case "finish":
        return `<div class="action finishQuiz">FINISH</div>`;

      case "finishScreen":
        return `
        <div class="finishScreen">
        <p>Results</p>
        <div class="timeSpent">Time Spent: <b>${
          Math.floor(this._data.timeRemained / 60) +
          " minutes, " +
          (this._data.timeRemained % 60) +
          " seconds"
        }</b></div>
        <div class="correctAnswersQuiz">Correct Answers: <b>${
          this._data.correctAnswerCount + "/" + this._data.questionCount
        }</b></div>
        <div class="quizScore">Percentage: <b>${
          (this._data.correctAnswerCount / this._data.questionCount).toFixed(3) * 100 + "%"
        }</b></div>
        <div class="playAgainBtn">Play Again!</div>
        </div>
        `;

      case "correctAnswers":
        return `<div class="box scoreCount">${this._data}/${this._wordLimit}</div>`;

      default:
        break;
    }
  }
}

export default new PlayGameView();
