import * as model from "./model.js";
import searchWordView from "./views/searchWordView.js";
import savedWordsView from "./views/savedWordsView.js";
import playGameView from "./views/playGameView.js";

async function controlWord(searchWordSelected) {
  try {
    if (model.state.quiz.quizStarted) {
      alert("please exit the quiz first!");
      history.pushState(null, null, "/");
      return;
    }

    const id = window.location.hash.slice(1);

    if (!id) return;

    if (!searchWordSelected) {
      model.refreshSaved();
      searchWordView.render(null, ".div1", "searchBar");
    }

    searchWordView.renderLoading(".div2");

    await model.loadWord(id);

    searchWordView.render(model.state.searchWord, ".div2", "word");
  } catch (error) {
    searchWordView.renderError(error, ".div2");
  }
}

function controlPageSearchWord() {
  try {
    if (model.state.quiz.quizStarted) {
      alert("please exit the quiz first!");
      return false;
    }

    model.refreshSaved();
    searchWordView.render(null, ".div1", "searchBar");

    if (Object.keys(model.state.searchWord).length === 0) {
      searchWordView.render(null, ".div2", "initial");
      return true;
    }

    if (model.state.searchWord.error) {
      searchWordView.renderError(
        `<p>Sorry, we couldn't find any definition for the word
        <span class="misspelled">${decodeURIComponent(model.state.searchWord.word)}</span>.</p>
        <p>Maybe you should check your spelling and try again.</p>`,
        ".div2"
      );
    } else {
      searchWordView.render(model.state.searchWord, ".div2", "word");
    }

    history.pushState(null, null, `#${model.state.searchWord.word}`);

    return true;
  } catch (error) {
    alert(error);
  }
}

function controlPageSavedWords() {
  try {
    if (model.state.quiz.quizStarted) {
      alert("please exit the quiz first!");
      return false;
    }

    model.refreshSaved();
    history.pushState(null, null, "/");

    if (Object.keys(model.state.savedWord).length !== 0) {
      savedWordsView.render(null, ".div1", "buttons");
      searchWordView.render(model.state.savedWord, ".div2", "word");
      return true;
    }

    if (model.state.saved.length === 0) {
      savedWordsView.render(null, ".div1", "initial");
      savedWordsView.clear(".div2");
      return true;
    }

    if (model.state.lastSort === "Word") {
      model.SavedSortByWord();
    } else {
      model.SavedSortByDate();
    }

    savedWordsView.render(model.state.lastSort, ".div1", "sort");
    savedWordsView.render(model.state.saved, ".div2", "list");

    return true;
  } catch (error) {
    alert(error);
  }
}

function controlSort(value) {
  try {
    if (value === model.state.lastSort) return;
    if (value === "Date") model.SavedSortByDate();
    if (value === "Word") model.SavedSortByWord();
    model.saveLastSort(value);
    savedWordsView.render(model.state.saved, ".div2", "list");
  } catch (error) {
    alert(error);
  }
}

function controlSaveWordSavedView(selectedWord) {
  try {
    const word = model.state.saved.find((word) => word.word === selectedWord);

    if (word.saved) {
      model.deleteSaved(word);
    } else {
      model.addSaved(word);
    }
  } catch (error) {
    console.error(error);
  }
}

function controlSaveWordSearchView(sidebarSelected) {
  try {
    const object = sidebarSelected === "Search Word" ? "searchWord" : "savedWord";

    if (model.state[object].saved) {
      model.deleteSaved(model.state[object]);
    } else {
      model.addSaved(model.state[object]);
    }
  } catch (error) {
    alert(error);
  }
}

function controlShowWord(selectedWord) {
  try {
    const word = model.wordObject(selectedWord);
    model.saveSavedWord(word);

    savedWordsView.render(null, ".div1", "buttons");
    searchWordView.render(word, ".div2", "word");
  } catch (error) {
    searchWordView.renderError(error, ".div2");
  }
}

function controlSavedButtons(selectedOperation, currentWord) {
  try {
    if (selectedOperation === "go back to the list") {
      model.saveSavedWord({});

      if (model.state.lastSort === "word") {
        model.SavedSortByWord();
      } else {
        model.SavedSortByDate();
      }

      if (model.state.saved.length === 0) {
        savedWordsView.render(null, ".div1", "initial");
        savedWordsView.clear(".div2");
      } else {
        savedWordsView.render(model.state.lastSort, ".div1", "sort");
        savedWordsView.render(model.state.saved, ".div2", "list");
      }
    } else {
      const newSelectedWord =
        selectedOperation === "previous word"
          ? model.getPreviousWord(currentWord)
          : model.getNextWord(currentWord);

      searchWordView.render(newSelectedWord, ".div2", "word");
      model.saveSavedWord(newSelectedWord);
    }
  } catch (error) {
    console.log(error);
  }
}

function controlPagePlayGame() {
  try {
    model.refreshSaved();
    playGameView.clear(".div2");
    if (model.state.saved.length < 4) {
      playGameView.render(null, ".div1", "initial");
    } else {
      const areGamesPlayable = model.checkSavedWordsConditions();
      playGameView.render(areGamesPlayable, ".div1", "startPage");
    }
    history.pushState(null, null, "/");
  } catch (error) {
    alert(error);
    console.error(error);
  }
}

function controlCreateQuiz(button) {
  try {
    if (button.classList.contains("meaningButton")) model.createMeaningQuiz();
    if (button.classList.contains("antonymsynonymButton")) model.createASQuiz();
    if (button.classList.contains("pronunciationButton")) model.createPronunciationQuiz();

    return model.state.quiz.questions.length;
  } catch (error) {
    alert(error);
  }
}

function controlQuiz(limit) {
  try {
    if (!model.state.quiz.quizStarted) model.toggleQuizStarted();
    model.setQuestionCount(limit);

    playGameView.clear(".content");
    playGameView.render(model.state.quiz, ".content", "quiz");
    playGameView.render(0, ".div3", "correctAnswers");

    controlNextQuestion();
  } catch (error) {
    console.log(error);
  }
}

function controlSelectOption() {
  try {
    playGameView.render(null, ".div6", "check");
  } catch (error) {
    console.log(error);
  }
}

function controlCheckAnswer(answer) {
  try {
    const index = model.state.quiz.questionIndex - 1;
    const correctAnswer = model.state.quiz.questions[index].word;

    if (correctAnswer === answer) {
      model.correctAnswer();
      playGameView.render(model.state.quiz.correctAnswerCount, ".div3", "correctAnswers");
    }

    switch (model.state.quiz.type) {
      case "meaning":
        playGameView.render(
          model.state.quiz.questions[index],
          ".div9",
          "meaningQuestionAfterwards"
        );
        break;
      case "pronunciation":
        playGameView.render(
          model.state.quiz.questions[index],
          ".div9",
          "pronunciationQuestionAfterwards"
        );
        break;
      default:
        break;
    }

    if (model.state.quiz.questionIndex === model.state.quiz.lastQuestionIndex) {
      playGameView.clear(".div6");
      playGameView.render(null, ".div7", "finish");
    } else {
      playGameView.render(null, ".div6", "next");
    }

    return model.state.quiz.questions[index].word;
  } catch (error) {
    console.error(error);
  }
}

function controlFinishQuiz(timeRemained, questionCount) {
  try {
    if (model.state.quiz.quizStarted) model.toggleQuizStarted();
    playGameView.clear(".content");

    const data = {
      timeRemained,
      questionCount,
      correctAnswerCount: model.state.quiz.correctAnswerCount,
    };

    playGameView.render(data, ".div1", "finishScreen");
  } catch (error) {
    console.error(error);
  }
}

function controlNextQuestion() {
  try {
    const index = model.state.quiz.questionIndex;
    playGameView.render(index, ".div2", "questionNumber");

    switch (model.state.quiz.type) {
      case "meaning":
        playGameView.render(model.state.quiz.questions[index], ".div8", "meaningQuestion");
        break;
      case "antonymsynonym":
        playGameView.render(model.state.quiz.questions[index], ".div8", "ASQuestion");
        break;
      case "pronunciation":
        playGameView.render(model.state.quiz.questions[index], ".div8", "pronunciationQuestion");
        break;
      default:
        new Error("Quiz Type Doesn't Exist");
        break;
    }

    playGameView.render(model.state.quiz.questions[index].options, ".div5", "options");
    playGameView.clear(".div6");
    playGameView.clear(".div9");

    model.nextQuestion();
  } catch (error) {
    alert(error);
  }
}

function controlASPrevNext(index) {
  try {
    playGameView.render(index, ".div10", "ASPOS");
  } catch (error) {
    console.log(error);
  }
}

function controlRefreshWithHeader() {
  model.refreshSaved();
  window.location.href = "/";
}

function init() {
  searchWordView.addHandlerRenderWord(controlWord);
  searchWordView.addHandlerSaveWord(controlSaveWordSearchView);
  searchWordView.addHandlerRenderPage(controlPageSearchWord);
  searchWordView.addHandlerRefreshWithHeader(controlRefreshWithHeader);
  savedWordsView.addHandlerRenderPage(controlPageSavedWords);
  savedWordsView.addHandlerSaveWord(controlSaveWordSavedView);
  savedWordsView.addHandlerShowWord(controlShowWord);
  savedWordsView.addHandlerButtons(controlSavedButtons);
  savedWordsView.addHandlerSort(controlSort);
  playGameView.addHandlerRenderPage(controlPagePlayGame);
  playGameView.addHandlerCreateQuiz(controlCreateQuiz);
  playGameView.addHandlerRenderQuiz(controlQuiz);
  playGameView.addHandlerSelectOption(controlSelectOption);
  playGameView.addHandlerCheckAnswer(controlCheckAnswer);
  playGameView.addHandlerNextQuestion(controlNextQuestion);
  playGameView.addHandlerFinish(controlFinishQuiz);
  playGameView.addHandlerASPrevNext(controlASPrevNext);
}
init();

// localStorage.clear();
console.log(JSON.parse(localStorage.saved));
