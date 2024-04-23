import { words as INITIAL_WORDS } from './data.js'

const $title = document.querySelector("h1");
const $time = document.querySelector("time");
const $paragraph = document.querySelector("p");
const $input = document.querySelector("input");
const $game = document.querySelector('#game');
const $results = document.querySelector('#results');
const $wpm = document.querySelector('#results-wpm');
const $accuracy = document.querySelector('#results-accuracy')
const $reloadText = document.querySelector('#reload-button')

const INITIAL_TIME = 60;

let words = [];
let currentTime = INITIAL_TIME;
let playing;

initGame();
initEvents();

function initGame() {
    playing = false;
    reloadText();
    currentTime = INITIAL_TIME;
    $time.textContent = currentTime;
}

function initEvents() {
    document.addEventListener('input', () => {
        $input.focus()
        if (!playing) {
            $title.classList.add("playing");
            playing = true;
            const intervalId = setInterval(() => {
                currentTime--;
                $time.textContent = currentTime;

                if (currentTime == 0) {
                    clearInterval(intervalId);
                    gameOver();
                }
            }, 1000);
        }
    })
    $input.addEventListener("keydown", onKeyDown);
    $input.addEventListener("input", onInput);
    $reloadText.addEventListener("click", reloadText);
}

function reloadText() {
    words = INITIAL_WORDS.toSorted(() => Math.random() - 0.5).slice(0, 50);
    $input.value = '';
    $paragraph.innerHTML = words
        .map((word) => {
            const letters = word.split("");
            return `<word>
                ${letters
                    .map((letter) => `<letter>${letter}</letter>`)
                    .join("")}
            </word>`;
        })
        .join("");

    const $firstWord = $paragraph.querySelector("word");
    $firstWord.classList.add("active");
    $firstWord.querySelector("letter").classList.add("active");
    console.log("recargamos el texto")
}



function onKeyDown(event) {
    const $currentWord = $paragraph.querySelector("word.active");
    const $currentLetter = $currentWord.querySelector("letter.active");

    const { key } = event;
    if (key == " ") {
        event.preventDefault();

        const $nextWord = $currentWord.nextElementSibling;
        const $nextLetter = $nextWord.querySelector("letter");

        $currentWord.classList.remove("active", "marked");
        $currentLetter.classList.remove("active");

        $nextWord.classList.add("active");
        $nextLetter.classList.add("active");

        ///console.log(longitud)
        $input.value = "";

        const correctLetters = $currentWord.querySelectorAll(
            "letter.correct"
        ).length;

        console.log("Letras correctas" + correctLetters)
        const currentWordLength = $currentWord.innerText.trim().length;

        if (correctLetters == currentWordLength) {
            $currentWord.classList.add("correct");
        } else if (correctLetters == 0 & currentWordLength == 0) {
            $currentWord.classList.add("emptyMarked");
        } else {
            $currentWord.classList.add("marked");
        }

        return;
    }

    if (key == "Backspace") {
        const $prevWord = $currentWord.previousElementSibling;
        const $prevLetter = $currentLetter.previousElementSibling;

        if (!$prevWord) {
            event.preventDefault;
            return;
        }

        const $wordMarked = $paragraph.querySelector("word.marked");
        const $wordEmptyMarked = $paragraph.querySelector("word.emptyMarked");

        if (($wordMarked || $wordEmptyMarked) && !$prevLetter) {
            event.preventDefault();


            $prevWord.classList.add("active");

            const $prevWordsLetters = [...$prevWord.querySelectorAll("letter")];
            if ($wordMarked) {
                $prevWord.classList.remove("marked");
                //console.log("N letras anteriores: "+$prevWordsLetters.length)

                // Primero miramos si hay alguna incorrecta
                var $letterToGo
                if ($letterToGo = $prevWord.querySelector("letter.incorrect")) {
                    //Colocamos el cursor en la siguiente letra para que pueda borrar
                    //Si hay alguna correcta vamos a esa una mas para que pueda borrar
                    console.log("hola1")

                    //Si hemos hecho la palabra completa vamos a la ultima letra
                    //Recojemos el input de la letra anterior
                    var lettersInput = [...$prevWord.querySelectorAll("letter.correct, letter.incorrect"),]

                    if (lettersInput.length == $prevWordsLetters.length) {
                        $letterToGo = $prevWordsLetters[$prevWordsLetters.length - 1];
                    } else if ($prevWord.querySelector("letter.correct")) { // Si hay laguna correcta vamos a la primera que no sea correcta o incorrecta
                        $letterToGo = $prevWord.querySelector("letter:not(.correct):not(.incorrect)");
                    } else {
                        console.log("hola2")
                        $letterToGo = $prevWordsLetters[lettersInput.length];
                    }
                } else {
                    console.log("hola3")
                    //Si no hay incorrectas vamos a la primera no correcta
                    if ($prevWord.querySelector("letter:not(.correct)")) {

                        $letterToGo = $prevWord.querySelector("letter:not(.correct)");
                    } else {
                        const letterElements = $prevWord.querySelectorAll("letter.correct");
                        $letterToGo = letterElements[letterElements.length - 1];
                    }
                }

                //const $letterToGo = $prevWord.querySelector("letter:not(.correct)");
                //const $letterToGo = $prevWordsLetters[$prevWordsLetters.length - 1];
                $currentLetter.classList.remove("active");
                $letterToGo.classList.add("active");
            } else if ($wordEmptyMarked) {
                $prevWord.classList.remove("emptyMarked");
                const $letterToGo = $prevWordsLetters[0];
                $currentLetter.classList.remove("active");
                $letterToGo.classList.add("active");
            }

            $input.value = [...$prevWord.querySelectorAll("letter.correct, letter.incorrect"),]
                .map(($el) => { return $el.classList.contains("correct") ? $el.innerText : "*"; }).join("");
        }
    }
}

function onInput() {
    const $currentWord = $paragraph.querySelector("word.active");
    const $currentLetter = $currentWord.querySelector("letter.active");
    const currentWord = $currentWord.innerText.trim();

    $input.maxLength = currentWord.length;
    console.log({ value: $input.value, currentWord });

    const $allLetters = $currentWord.querySelectorAll("letter");

    $allLetters.forEach(($letter) =>
        $letter.classList.remove("correct", "incorrect")
    );

    $input.value.split("").forEach((char, index) => {
        const $letter = $allLetters[index];
        const letterToCheck = currentWord[index];

        const isCorrect = char == letterToCheck;
        var letterClass;

        if (isCorrect) {
            letterClass = "correct";
        } else {
            letterClass = "incorrect";
        }
        $letter.classList.add(letterClass);
    });

    $currentLetter.classList.remove("active", "isLast");
    const inputLength = $input.value.length;
    const $nextActiveLetter = $allLetters[inputLength];

    if ($nextActiveLetter) {
        $allLetters[inputLength].classList.add("active");
    } else {
        $currentLetter.classList.add("active", "isLast");
    }
}

function gameOver() {
    $game.style.display = 'none'
    $results.style.display = 'flex'

    const correctWords = $paragraph.querySelectorAll('word.correct').length
    const correctLetters = $paragraph.querySelectorAll('letter.correct').length
    const incorrectLetters = $paragraph.querySelectorAll('letter.incorrect').length

    const totalLetters = correctLetters + incorrectLetters
    const accuracy = totalLetters > 0
        ? (correctLetters / totalLetters) * 100
        : 0

    const wpm = correctWords * 60 / INITIAL_TIME
    $wpm.textContent = wpm
    $accuracy.textContent = `${accuracy.toFixed(2)}%`
}


