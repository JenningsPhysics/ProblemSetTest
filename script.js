// Problem Types
// 1 = Numeric
// 2 = MC
// 3 = Symbolic
// 4 = Multipart

const problems = [
  {
    
    // Numerical Question Type Example
    type: 1,
    prompt: `
      A 2 kg object accelerates at \\(4\\,\\text{m/s}^2\\).
      What is the net force (in N)?
    `,
    correct: 8,
    tolerance: 0.2,
    feedbackCorrect: "Correct. F = ma.",
    feedbackIncorrect: "Check Newton’s second law."
  },
  {
    // Multiple Choice Question Type
    type: 2,
    prompt: `
      An object has a constant nonzero net force acting on it. What must be true?
    `,
    choices: [
      "0 = Its velocity is constant",
      "1 = Its acceleration is constant",
      "2 = Its momentum is zero",
      "3 = It must be moving in a circle"
    ],
    correctIndex: 1,
    feedbackCorrect: "Yes!",
    feedbackIncorrect: "No!"
  },
  {
    // Symbolic Question Type
    type: 3,
    prompt: `
    A car with mass M experiences a net force F. What is the acceleration of the car,
     in terms of <code>M</code> and <code>F</code>? Make sure you use * for multiplication!
    `,
    correct: "F/M",
    variables: ["F", "M"],
    feedbackCorrect: "Yes!",
    feedbackIncorrect: "No!"
  },
  {
    //MultiSelect
    type: 5,
    prompt: `
      Which of the following quantities are conserved in an isolated system?
    `,
    choices: [
      "Linear momentum",
      "Mechanical energy",
      "Angular momentum",
      "Electric charge"
    ],
    correct: [0, 2, 3],
    feedbackCorrect: "Correct!",
    feedbackIncorrect: "Check conservation laws."
  },

  {
    // Multipart
  type: 4,
  stem: `
    <p>A block of mass \(m\) slides down a frictionless incline.</p>
    <img src="images/incline.png" style="max-width:300px;">
  `,
  parts: [
    {
      label: "A",
      type: 1,
      prompt: "Determine the acceleration of the block.",
      correct: 4.9,
      tolerance: 0.2
    },
    {
      label: "B",
      type: 3,
      prompt: "Write an expression for the normal force. Use m, g and b for angle",
      correct: "m*g*cos(b)",
      variables: ["m", "g", "b"],
      feedbackCorrect: "Yes!",
      feedbackIncorrect: "No!"
    },
    {
      label: "C",
      type: 2,
      prompt: "Which change would increase the acceleration?",
      choices: [
        "Increase mass",
        "Increase angle",
        "Decrease gravity",
        "Add friction"
      ],
      correctIndex: 1
    },
    {
      label: "D",
      type: 5,
      prompt: "Which of the following quantities are conserved in an isolated system?",
      choices: [
        "Linear momentum",
        "Mechanical energy",
        "Angular momentum",
        "Electric charge"
      ],
      correct: [0, 2, 3],
      feedbackCorrect: "Correct!",
      feedbackIncorrect: "Check conservation laws."
    }
  ]
}

];

function buildDropdown() {
  const select = document.getElementById("questionSelect");
  select.innerHTML = "";

  problems.forEach((problem, index) => {
    const option = document.createElement("option");
    option.value = index;
    option.textContent = `Question ${index + 1}`;
    select.appendChild(option);
  });
}


function updateDropdown() {
  const select = document.getElementById("questionSelect");

  Array.from(select.options).forEach((option, index) => {
    if (problemStatus[index]) {
      option.textContent = `✔ Question ${index + 1}`;
    } else {
      option.textContent = `Question ${index + 1}`;
    }
  });
}

const select = document.getElementById("questionSelect");

problems.forEach((problem, index) => {
  const option = document.createElement("option");
  option.value = index;
  option.textContent = "Question " + (index + 1);
  select.appendChild(option);
});


let current = 0;
let partStatus = {};  

function loadQuestion() {
  const p = problems[current];
  document.getElementById("question").textContent =
    `Question ${current + 1} of ${problems.length}`;

  // document.getElementById("prompt").innerHTML = p.prompt;
  document.getElementById("prompt").innerHTML = renderProblem(p)
  // document.getElementById("answer").value = "";
  // document.getElementById("feedback").textContent = "";
  // document.getElementById("feedback").className = "feedback";

  MathJax.typeset();

  // Update dropdown to match current question
  document.getElementById("questionSelect").value = current;
  updateDropdown()
}


function checkAnswer() {
  const p = problems[current];
  const feedback = document.querySelector(".feedback");
  
  feedback.classList.remove("correct", "incorrect");

  if (p.type === 1) {
    const ans = parseFloat(document.getElementById("answer").value);

    if (isNaN(ans)) {
      feedback.textContent = "Enter a number.";
      feedback.classList.add("incorrect");
      return;
    }

    if (Math.abs(ans - p.correct) <= p.tolerance) {
      feedback.textContent = p.feedbackCorrect;
      feedback.classList.add("correct");
      problemStatus[current] = true;
      
    } else {
      feedback.textContent = p.feedbackIncorrect;
      feedback.classList.add("incorrect");
    }
    updateDropdown();
  }

  if (p.type === 2) {
    const selected = document.querySelector('input[name="mcAnswer"]:checked');

    if (!selected) {
      feedback.textContent = "Select an answer.";
      feedback.classList.add("incorrect");
      return;
    }

    if (parseInt(selected.value) === p.correctIndex) {
      feedback.textContent = p.feedbackCorrect;
      feedback.classList.add("correct");
      problemStatus[current] = true;
    } else {
      feedback.textContent = p.feedbackIncorrect;
      feedback.classList.add("incorrect");
    }
    updateDropdown();
  }
  if (p.type === 3) {
    checkSymbolic(p, feedback);
    updateDropdown();
  }

  if (p.type === 5) {
    const selected = Array.from(
      document.querySelectorAll('input[name="msAnswer"]:checked')
    ).map(cb => parseInt(cb.value));

    selected.sort();
    const correct = [...p.correct].sort();

    const feedback = document.querySelector(".feedback");
    feedback.classList.remove("correct", "incorrect");

    const isCorrect =
      selected.length === correct.length &&
      selected.every((v, i) => v === correct[i]);

    if (isCorrect) {
      feedback.textContent = p.feedbackCorrect;
      feedback.classList.add("correct");
      problemStatus[current] = true;
    } else {
      feedback.textContent = p.feedbackIncorrect;
      feedback.classList.add("incorrect");
    }

    updateDropdown();
  }

}

function checkPart(partIndex) {
  const problem = problems[current];
  const part = problem.parts[partIndex];
  const feedback = document.getElementById(`feedback-${partIndex}`);

  feedback.classList.remove("correct", "incorrect");

  if (part.type === 1) {
    const val = parseFloat(document.getElementById(`answer-${partIndex}`).value);

    if (Math.abs(val - part.correct) <= part.tolerance) {
      feedback.textContent = "Correct.";
      feedback.classList.add("correct");
      partStatus[current][partIndex] = true;

    } else {
      feedback.textContent = "Try again.";
      feedback.classList.add("incorrect");
    }
    if (partStatus[current].every(Boolean)) {
      problemStatus[current] = true;
      updateDropdown();
    }

  }

  if (part.type === 3) {
    
    partStatus[current][partIndex] = checkSymbolic(part, feedback, `answer-${partIndex}`);

    if (partStatus[current].every(Boolean)) {
      problemStatus[current] = true;
      updateDropdown();
    }

  }

  if (part.type === 2) {
    const selected = document.querySelector(`input[name="mc-${partIndex}"]:checked`);

    if (!selected) {
      feedback.textContent = "Select an answer.";
      feedback.classList.add("incorrect");
      return;
    }

    if (parseInt(selected.value) === part.correctIndex) {
      feedback.textContent = "Correct.";
      feedback.classList.add("correct");
      partStatus[current][partIndex] = true;
    } else {
      feedback.textContent = "Try again.";
      feedback.classList.add("incorrect");
    }
    if (partStatus[current].every(Boolean)) {
      problemStatus[current] = true;
      updateDropdown();
    }
  }

  if (part.type === 5) {
    const selected = Array.from(
      document.querySelectorAll(`input[name="ms-${partIndex}"]:checked`)
    ).map(cb => parseInt(cb.value));

    selected.sort();
    const correct = [...part.correct].sort();

    const isCorrect =
      selected.length === correct.length &&
      selected.every((v, i) => v === correct[i]);

    if (isCorrect) {
      feedback.textContent = "Correct.";
      feedback.classList.add("correct");
      partStatus[current][partIndex] = true;
    } else {
      feedback.textContent = "Try again.";
      feedback.classList.add("incorrect");
    }

    if (partStatus[current].every(Boolean)) {
      problemStatus[current] = true;
      updateDropdown();
    }
  }

}


function nextQuestion() {
  current++;
  if (current < problems.length) {
    loadQuestion();
  } else {
    current = 0;
    loadQuestion();
  }
}

function prevQuestion() {
  current--;
  if (current > -1) {
    loadQuestion();
  } else {
    current = problems.length - 1;
    loadQuestion();
  }
}
loadQuestion();

select.addEventListener("change", function () {
  current = parseInt(this.value)
  loadQuestion()
})

function renderProblem(problem) {
  switch (problem.type) {
    case 1:
      return renderNumeric(problem);

    case 2:
      return renderMultipleChoice(problem);

    case 3:
      return renderSymbolic(problem);

    case 4:
      return renderMultipart(problem);

    case 5:
      return renderMultiSelect(problem);

    default:
      return "<p>Unknown problem type.</p>";
  }
}

function renderNumeric(problem) {
  return `
    <p>${problem.prompt}</p>

    <input type="number" id="answer">
    <button onclick="checkAnswer()">Check</button>

    <div class="feedback"></div>
  `;
}

function renderMultipleChoice(problem) {
  let choicesHTML = "";

  problem.choices.forEach((choice, index) => {
    choicesHTML += `
      <label>
        <input type="radio" name="mcAnswer" value="${index}">
        ${choice}
      </label><br>
    `;
  });

  return `
    <p>${problem.prompt}</p>

    <form id="mcForm">
      ${choicesHTML}
    </form>

    <button onclick="checkAnswer()">Check</button>

    <div class="feedback"></div>
  `;
}

function renderSymbolic(problem) {
  return `
    <p>${problem.prompt}</p>

    <input type="text" id="symbolicAnswer"
           placeholder="Enter expression, e.g. k*q1*q2/r^2">

    <button onclick="checkAnswer()">Check</button>

    <div class="feedback"></div>
  `;
}

function renderMultiSelect(problem) {
  let choicesHTML = "";

  problem.choices.forEach((choice, index) => {
    choicesHTML += `
      <label>
        <input type="checkbox" name="msAnswer" value="${index}">
        ${choice}
      </label><br>
    `;
  });

  return `
    <p>${problem.prompt}</p>

    ${choicesHTML}

    <button onclick="checkAnswer()">Check</button>

    <div class="feedback"></div>
  `;
}


function renderMultipart(problem) {
  let html = problem.stem;
  partStatus[current] =
    new Array(problem.parts.length).fill(false);

  problem.parts.forEach((part, index) => {
    html += `
      <div class="part">
        <h4>Part ${part.label}</h4>
        <p>${part.prompt}</p>
        ${renderPartInput(part, index)}
        <div class="feedback" id="feedback-${index}"></div>
      </div>
    `;
  });

  return html;
}

function renderPartInput(part, index) {
  switch (part.type) {
    // Numeric
    case 1:
      return `
        <input type="number" id="answer-${index}">
        <button onclick="checkPart(${index})">Check</button>
      `;
    // Symbolic
    case 3:
      return `
        <input type="text" id="answer-${index}">
        <button onclick="checkPart(${index})">Check</button>
        <small>Use *, /, ^, parentheses</small>
      `;
    // MC
    case 2:
      return part.choices.map((choice, i) => `
        <label>
          <input type="radio" name="mc-${index}" value="${i}">
          ${choice}
        </label><br>
      `).join("") + `
        <button onclick="checkPart(${index})">Check</button>
      `;
    // Multi-select
    case 5:
      return part.choices.map((choice, i) => `
        <label>
          <input type="checkbox" name="ms-${index}" value="${i}">
          ${choice}
        </label><br>
      `).join("") + `
        <button onclick="checkPart(${index})">Check</button>
      `;

    default:
      return "<p>Unknown part type.</p>";
  }
}


function checkSymbolic(problemLike, feedbackEl, inputId = "symbolicAnswer") {
  const inputEl = document.getElementById(inputId);

  feedbackEl.classList.remove("correct", "incorrect");

  if (!inputEl || !inputEl.value.trim()) {
    feedbackEl.textContent = "Enter an expression.";
    feedbackEl.classList.add("incorrect");
    return;
  }

  try {
    const student = math.parse(inputEl.value);
    const correct = math.parse(problemLike.correct);

    const diff = math.simplify(
      `(${student.toString()}) - (${correct.toString()})`
    );

    const equivalent =
      diff.toString() === "0" &&
      (problemLike.variables &&
        numericCheck(inputEl.value, problemLike.correct, problemLike.variables));

    if (equivalent) {
      feedbackEl.textContent = problemLike.feedbackCorrect || "Correct.";
      feedbackEl.classList.add("correct");
      return problemStatus[current] = true;

    } else {
      feedbackEl.textContent = problemLike.feedbackIncorrect || "Try again.";
      feedbackEl.classList.add("incorrect");
    }
  } catch (e) {
    feedbackEl.textContent = "Invalid expression.";
    feedbackEl.classList.add("incorrect");
  }
}


function numericCheck(studentExpr, correctExpr, vars) {
  for (let i = 0; i < 5; i++) {
    const scope = {};
    vars.forEach(v => scope[v] = Math.random() * 10 + 1);

    const sVal = math.evaluate(studentExpr, scope);
    const cVal = math.evaluate(correctExpr, scope);

    if (Math.abs(sVal - cVal) > 1e-6) {
      return false;
    }
  }
  return true;
}

let problemStatus = new Array(problems.length).fill(false);

