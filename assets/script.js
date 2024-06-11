const questions = [];
let currentQuestionIndex = 0;
let timer;
let interval;
let userAnswers = [];

const questionElement = document.getElementById("question");
const choicesElement = document.getElementById("choices");
const timerElement = document.getElementById("timer");
const quizContainer = document.getElementById("quiz-container");
const resultsContainer = document.getElementById("results-container");
const resultsTableBody = document.querySelector("#results-table tbody");

function startQuiz() {
    fetch('https://jsonplaceholder.typicode.com/posts')
        .then(response => response.json())
        .then(data => {
            const shuffledPosts = shuffleArray(data.slice(0, 10)); 
            let questionIndex = 1; // soru numarası
            shuffledPosts.forEach((post, index) => {
                // Gönderiye ait yorumları çek
                fetch(`https://jsonplaceholder.typicode.com/posts/${post.id}/comments`)
                    .then(response => response.json())
                    .then(comments => {
                        const shuffledComments = shuffleArray(comments);
                        const choices = shuffledComments.slice(0, 4).map(comment => comment.body);
                        const correctAnswer = post.body;
                        questions.push({ question: `Soru-${questionIndex++}: ${post.title}`, choices: choices, correct: correctAnswer });
                        if (questions.length === 10) { //  10 soru 
                            showQuestion(questions[currentQuestionIndex]);
                            startTimer();
                        }
                    })
                    .catch(error => console.error('Error fetching comments:', error));
            });
        })
        .catch(error => console.error('Error fetching posts:', error));
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function showQuestion(question) {
    questionElement.textContent = question.question;
    choicesElement.innerHTML = "";
    const choices = ['A', 'B', 'C', 'D'];
    question.choices.forEach((choice, index) => {
        const li = document.createElement("li");
        li.textContent = choices[index] + ") " + choice;
        li.onclick = () => selectAnswer(choice);
        li.style.textAlign = "left"; // Cevap şıkları
        choicesElement.appendChild(li);
    });
}

function selectAnswer(choice) {
    if (timer > 20) return; // İlk 10 saniyede tıklamayı engelle
    userAnswers.push({ question: questions[currentQuestionIndex].question, answer: choice });
    nextQuestion();
}

function startTimer() {
    clearInterval(interval);
    timer = 30;
    updateTimer();
    interval = setInterval(() => {
        timer--;
        updateTimer();
        if (timer === 20) {
            enableChoices();
        }
        if (timer <= 0) {
            clearInterval(interval);
            nextQuestion();
        }
    }, 1000); // = 1 saniye
}

function updateTimer() {
    timerElement.textContent = timer;
}

function enableChoices() {
    const choices = choicesElement.querySelectorAll("li");
    choices.forEach(choice => {
        choice.classList.add("enabled");
        choice.style.cursor = "pointer";
    });
}

function nextQuestion() {
    currentQuestionIndex++;
    if (currentQuestionIndex < questions.length) {
        showQuestion(questions[currentQuestionIndex]);
        startTimer();
    } else {
        endQuiz();
    }
}

function endQuiz() {
    quizContainer.style.display = "none";
    resultsContainer.style.display = "block";
    
    resultsTableBody.innerHTML = ""; // Tabloyu temizle
    
    // cevaplar
    for (let i = 0; i < 10; i++) {
        const row = document.createElement("tr");
        const questionCell = document.createElement("td");
        const answerCell = document.createElement("td");
        questionCell.textContent = userAnswers[i].question;
        answerCell.textContent = userAnswers[i].answer;
        row.appendChild(questionCell);
        row.appendChild(answerCell);
        resultsTableBody.appendChild(row);
    }
}

startQuiz();
