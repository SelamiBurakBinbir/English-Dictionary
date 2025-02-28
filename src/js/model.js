import { API_URL } from "./config.js";
import { AJAX } from "./helpers.js";

export const state = {
  searchWord: {},
  savedWord: {},
  saved: [],
  lastSort: "",
  quiz: {
    quizStarted: false,
    questionIndex: 0,
    lastQuestionIndex: 0,
    correctAnswerCount: 0,
    type: "",
    questions: [],
  },
};

function createWordObject(data) {
  const word = data[0].word;

  const meanings = data
    .map((wordEl) => {
      return wordEl.meanings?.map((el) => {
        const definitions = el.definitions.map((def) => {
          return {
            definition: def.definition,
            example: def.example,
          };
        });
        return {
          definitions,
          partOfSpeech: el.partOfSpeech,
          synonyms: [...new Set(el.synonyms)],
          antonyms: [...new Set(el.antonyms)],
        };
      });
    })
    .flat();

  const reArrangedMeanings = [];

  for (const el of meanings) {
    const partsOfSpeech = reArrangedMeanings.map((el) => el.partOfSpeech);

    if (!partsOfSpeech.includes(el.partOfSpeech)) {
      reArrangedMeanings.push(el);
    } else {
      const index = reArrangedMeanings.findIndex((pos) => pos.partOfSpeech === el.partOfSpeech);
      reArrangedMeanings[index].definitions.push(...el.definitions);
      reArrangedMeanings[index].synonyms.push(...el.synonyms);
      reArrangedMeanings[index].antonyms.push(...el.antonyms);
    }
  }

  reArrangedMeanings.sort((a, b) => b.definitions.length - a.definitions.length);

  const phonetics = data[0].phonetics.filter(
    (el) => el.text && ["uk", "us", "au", "ca"].includes(el.audio.slice(-6, -4))
  );

  const removeDuplicatesPhonetics = [...new Map(phonetics.map((el) => [el.text, el])).values()];

  const reArrangedPhonetics = removeDuplicatesPhonetics.map((el) => ({
    text: el.text,
    audio: el.audio,
    country: el.audio.slice(-6, -4),
  }));

  const partsOfSpeech = reArrangedMeanings.map((el) => el.partOfSpeech).join(" / ");

  return {
    word,
    meanings: reArrangedMeanings,
    phonetics: reArrangedPhonetics,
    partsOfSpeech,
  };
}

export async function loadWord(word) {
  try {
    const data = await AJAX(`${API_URL}${word}`);

    state.searchWord = createWordObject(data);

    if (state.saved.some((el) => el.word === word)) {
      state.searchWord.saved = true;
    } else {
      state.searchWord.saved = false;
    }
  } catch (error) {
    if (error == "Error: 404") {
      state.searchWord = { word: decodeURIComponent(word), error: true };

      throw `<p>Sorry, we couldn't find any definition for the word
    <span class="misspelled">${decodeURIComponent(word)}</span>.</p>
    <p>Maybe you should check your spelling and try again.</p>`;
    } else if (error == "TypeError: Failed to fetch") {
      throw "<p>Please check your internet connection.</p>";
    } else {
      throw `<p>${error}</p>`;
    }
  }
}

// export function saveLastWord() {
//   state.lastWord = state.word;
//   // localStorage.setItem("lastWord", JSON.stringify(state.lastWord));
// }

export function saveLastSort(sort) {
  state.lastSort = sort;
}

const persistSaveWord = function () {
  try {
    localStorage.setItem("saved", JSON.stringify(state.saved));
  } catch (error) {
    throw `${error}: localStorage disabled, the word couldn't be saved`;
  }
};

export function addSaved(word) {
  if (word.word === state.searchWord.word) state.searchWord.saved = true;
  if (word.word === state.savedWord.word) state.savedWord.saved = true;

  const wordAddedtoSaved = state.saved.find((el) => el.word === word.word);

  if (wordAddedtoSaved) {
    wordAddedtoSaved.saved = true;
  } else {
    state.searchWord.saved = true;

    const wordRearranged = {
      ...word,
      date: new Date().getTime(),
    };

    state.saved.push(wordRearranged);
  }

  // const meanings = word.meanings.map((el) => {
  //   const partOfSpeech = el.partOfSpeech;
  //   const definitions = el.definitions.filter((def) => def.example);
  //   return { partOfSpeech, definitions };
  // });
  // const synonyms = word.meanings.map((el) => el.synonyms).flat();
  // const antonyms = word.meanings.map((el) => el.antonyms).flat();
}

export function deleteSaved(word) {
  if (word.word === state.searchWord.word) state.searchWord.saved = false;
  if (word.word === state.savedWord.word) state.savedWord.saved = false;

  const wordWillBeDeleted = state.saved.find((el) => el.word === word.word);

  wordWillBeDeleted["saved"] = false;

  // state.word.saved = false;
  // const index = state.saved.findIndex((el) => el.word === word.word);
  // state.saved.splice(index, 1);
  // persistSaveWord();
}

export function refreshSaved() {
  state.saved = state.saved.filter((el) => el.saved === true);

  if (Object.keys(state.savedWord).length !== 0 && !state.savedWord.saved)
    state.saved.push(state.savedWord);

  persistSaveWord();
}

export function SavedSortByDate() {
  state.saved.sort((a, b) => b.date - a.date);
}

export function SavedSortByWord() {
  state.saved.sort((a, b) => a.word.localeCompare(b.word));
}

export function saveSavedWord(word) {
  state.savedWord = word;
}

export function wordObject(word) {
  const wordObject = state.saved.find((el) => el.word === word);
  return wordObject;
}

export function getNextWord(currentWord) {
  const index = state.saved.findIndex((el) => el.word === currentWord);
  const nextIndex = (index + 1) % state.saved.length;

  return state.saved[nextIndex];
}

export function getPreviousWord(currentWord) {
  const index = state.saved.findIndex((el) => el.word === currentWord);
  const previousIndex = (index - 1 + state.saved.length) % state.saved.length;

  return state.saved[previousIndex];
}

export function checkSavedWordsConditions() {
  let meaningCount = 0;
  let antonymSynonymCount = 0;
  let pronunciationCount = 0;

  state.saved.forEach((el) => {
    const hasExample = el.meanings.some((meaning) =>
      meaning.definitions.some((definition) => definition.example)
    );
    if (hasExample) meaningCount++;

    const hasSynonym = el.meanings.some((meaning) => meaning.synonyms.length > 0);
    const hasAntonym = el.meanings.some((meaning) => meaning.antonyms.length > 0);

    if (hasSynonym && hasAntonym) antonymSynonymCount++;

    if (el.phonetics.length > 0) pronunciationCount++;
  });

  return {
    meaningCount,
    antonymSynonymCount,
    pronunciationCount,
  };
}

export function createMeaningQuiz() {
  const arrSavedClone = [...state.saved];

  const arrFiltered = arrSavedClone.filter((word) => {
    return word.meanings.some((meaning) => {
      return meaning.definitions.some((definition) => definition.example);
    });
  });

  const arrShuffled = shuffleArray(arrFiltered);

  const arrDefinitions = [];

  arrShuffled.forEach((word) => {
    word.meanings.forEach((def) => {
      def.definitions.forEach((el) => {
        if (el.example) {
          arrDefinitions.push({
            word: word.word,
            partOfSpeech: def.partOfSpeech,
            definition: el.definition,
            example: el.example,
          });
        }
      });
    });
  });

  const uniqueWords = {};

  arrDefinitions.forEach((el) => {
    if (!uniqueWords[el.word]) uniqueWords[el.word] = [];
    uniqueWords[el.word].push(el);
  });

  const arrObjectsCreated = Object.values(uniqueWords).map((word) => {
    return word[Math.floor(Math.random() * word.length)];
  });

  state.quiz.type = "meaning";
  state.quiz.questions = addOptions(arrObjectsCreated);
}

export function createPronunciationQuiz() {
  const arrSavedClone = [...state.saved];

  const arrFiltered = arrSavedClone.filter((word) => {
    return word.phonetics.length > 0;
  });

  const arrShuffled = shuffleArray(arrFiltered);

  const arrObjectsCreated = arrShuffled.map((item) => {
    const phoneticsItem =
      item.phonetics.length === 1
        ? item.phonetics[0]
        : item.phonetics[Math.floor(Math.random() * item.phonetics.length)];

    return {
      word: item.word,
      phonetics: phoneticsItem,
    };
  });

  state.quiz.type = "pronunciation";
  state.quiz.questions = addOptions(arrObjectsCreated);
}

export function createASQuiz() {
  const arrSavedClone = [...state.saved];

  const arrFiltered = arrSavedClone.filter((word) => {
    const hasSynonym = word.meanings.some((el) => el.synonyms.length > 0);
    const hasAntonym = word.meanings.some((el) => el.antonyms.length > 0);

    return hasSynonym && hasAntonym;
  });

  const arrShuffled = shuffleArray(arrFiltered);

  const arrObjectsCreated = arrShuffled.map((el) => {
    const partsOfSpeech = {};

    el.meanings.forEach((meaning) => {
      const { partOfSpeech, synonyms, antonyms } = meaning;

      if (synonyms.length > 0 || antonyms.length > 0) {
        partsOfSpeech[partOfSpeech] = {
          synonyms,
          antonyms,
        };
      }
    });

    return {
      word: el.word,
      partsOfSpeech,
    };
  });

  state.quiz.type = "antonymsynonym";
  state.quiz.questions = addOptions(arrObjectsCreated);
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }

  return array;
}

function addOptions(array) {
  const words = array.map((item) => item.word);

  array.forEach((el) => {
    const selectedWords = new Set();

    selectedWords.add(el.word);

    while (selectedWords.size < 4) {
      const randomWord = words[Math.floor(Math.random() * words.length)];
      selectedWords.add(randomWord);
    }

    el.options = Array.from(selectedWords).sort(() => Math.random() - 0.5);
  });

  return array;
}

export function toggleQuizStarted() {
  state.quiz.quizStarted = !state.quiz.quizStarted;
}

export function nextQuestion() {
  state.quiz.questionIndex++;
}

export function correctAnswer() {
  state.quiz.correctAnswerCount++;
}

export function setQuestionCount(lastQuestion) {
  state.quiz.lastQuestionIndex = lastQuestion;
}

const init = function () {
  const storageSaved = localStorage.getItem("saved");
  if (storageSaved) state.saved = JSON.parse(storageSaved);
  // if (localStorage.getItem("lastWord")) localStorage.removeItem("lastWord");
};
init();
