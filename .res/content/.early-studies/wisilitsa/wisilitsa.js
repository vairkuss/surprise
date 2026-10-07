const over = 0;

const words = [
    "картошка", "кукуруза", "жевачка", "зубочистка",
    "микроволновка", "конфетти", "феерверк", "внимательность",
    "победоносец", "яблоко", "школа", "монитор", "кошка",
    "шкаф", "обложка", "пельмень", "цветок", "сатурн",
    "океан", "ухо", "железо", "ядерное оружие", "полотенце",
    "рубашка", "бизнес", "забор", "саранча", "купальник",
    "хер побрил", "бородавка", "военные сводки цру"
];
const allowedInput = "абвгдеёжзийклмнопрстуфхцчшщъыьэюя";

let victories = 0;
let loses = 0;
let timesExited = 0;


const censure = (text, allowed) => {
    return text
        .split('')
        .map(char => allowed.has(char) || char === " " ? char : "_")
        .join(' ')
        .toUpperCase();
};

const clean = (lettersSet, toRemoveStr) => {
    const toRemove = new Set(toRemoveStr.split(''));

    return [...lettersSet]
        .filter(letter => !toRemove.has(letter));
};

let confirmationText = "Хотите сыграть в висилицу?"
while (confirm(confirmationText)) {

    let currWord = words[Math.trunc(Math.random() * words.length)];
    let guessedLetters = new Set();
    let game = 1;
    let lifes = 9;

    let repeats = "";
    let wrongCharacters = "";


    while (game) {
        let promptText = [censure(currWord, guessedLetters)
            ,
            "\nНеправильные отгадки: " + clean(guessedLetters, currWord).join(', '),
            "Остаётся жизней:" + lifes
        ];

        if (repeats || wrongCharacters) promptText.push('-'.repeat(20));
        if (repeats) promptText.push("Вы повторились! " + repeats.split('').join(', ') + " - уже было");
        if (wrongCharacters) promptText.push("На будущее: " + wrongCharacters.split('').join(', ') + " - не из русского алфавита!");
 
        repeats = "";
        wrongCharacters = "";

        promptText.push("-".repeat(20));
        promptText.push("Введите любую русскую букву (можно несколько):");
        let input = prompt(promptText.join('\n'));
    
        if (input === null || !input.length) {
    
            if (confirm("Хочешь выйти из игры?")) {
                timesExited++;
                game = over;
            };
      
        } else {
    
            let guesses = new Set(input.toLowerCase().trim().split(''))

            for (let guess of guesses) {
                if (guessedLetters.has(guess)) repeats += guess;
                
                else if (!allowedInput.includes(guess)) wrongCharacters += guess;
                
                else {
                    if (!currWord.includes(guess) && !repeats.includes(guess)) lifes--;
                    guessedLetters.add(guess);
                };
            };
            
            let endingText = 0;
            if (currWord.replace(' ', '').split('').every(char => guessedLetters.has(char))) {
                endingText = "ВЫ ПОБЕДИЛИ!";
                victories++;
            } else if (lifes <= 0) {
                endingText = "ВЫ ПРОИГРАЛИ!"
                loses++;
            };
            
            if (endingText) {
                endingText += "\nСлово было: " + currWord;
                alert(endingText);
                game = over;
            }
        };
    };

    confirmationText = "Хотите сыграть ещё раз?";
    if (victories || loses || timesExited) confirmationText += "\n";
    if (victories) confirmationText += "\nОтгадано слов: " + victories;
    if (loses) confirmationText += "\nПроиграно раз: " + loses;
    if (timesExited) "Вы вышли " + timesExited + " раз";
};
