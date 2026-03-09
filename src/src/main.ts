import './style.css';
import { initI18n, setLang, getLang, t, applyTranslations } from './i18n';

interface Answer {
  id: string;
  text: string;
  isCorrect: boolean;
}

interface Question {
  id: string;
  text: string;
  answers: Answer[];
}

interface Quiz {
  id: string;
  title: string;
  questions: Question[];
}

// Generate an RFC4122 v4 UUID
function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for non-secure contexts
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Initial state
let currentQuiz: Quiz = {
  id: generateId(),
  title: '',
  questions: []
};

// DOM Elements
const quizTitleInput = document.getElementById('quiz-title') as HTMLInputElement;
const questionsList = document.getElementById('questions-list') as HTMLDivElement;
const addQuestionBtn = document.getElementById('add-question') as HTMLButtonElement;
const exportBtn = document.getElementById('export-json') as HTMLButtonElement;
const loadInput = document.getElementById('load-json') as HTMLInputElement;

const openLangModalBtn = document.getElementById('open-lang-modal') as HTMLButtonElement;
const currentLangDisplay = document.getElementById('current-lang-display') as HTMLSpanElement;
const langModal = document.getElementById('lang-modal') as HTMLDivElement;
const langCancelBtn = document.getElementById('lang-cancel-btn') as HTMLButtonElement;
const langOptionBtns = document.querySelectorAll('.lang-option-btn');

const questionTemplate = document.getElementById('question-template') as HTMLTemplateElement;
const answerTemplate = document.getElementById('answer-template') as HTMLTemplateElement;

// Modal Elements
const confirmModal = document.getElementById('confirm-modal') as HTMLDivElement;
const confirmTitle = document.getElementById('confirm-title') as HTMLHeadingElement;
const confirmMessage = document.getElementById('confirm-message') as HTMLParagraphElement;
const confirmCancelBtn = document.getElementById('confirm-cancel-btn') as HTMLButtonElement;
const confirmOkBtn = document.getElementById('confirm-ok-btn') as HTMLButtonElement;

// Custom Confirm Logic
function showConfirm(titleKey: string, messageKey: string, okTextKey: string = 'confirmDelete'): Promise<boolean> {
  return new Promise((resolve) => {
    confirmTitle.textContent = t(titleKey);
    confirmMessage.textContent = t(messageKey);
    confirmOkBtn.textContent = t(okTextKey);

    confirmModal.classList.remove('hidden');

    const handleOk = () => {
      cleanup();
      resolve(true);
    };

    const handleCancel = () => {
      cleanup();
      resolve(false);
    };

    const cleanup = () => {
      confirmOkBtn.removeEventListener('click', handleOk);
      confirmCancelBtn.removeEventListener('click', handleCancel);
      confirmModal.classList.add('hidden');
    };

    confirmOkBtn.addEventListener('click', handleOk);
    confirmCancelBtn.addEventListener('click', handleCancel);
  });
}

// Initialization
function init() {
  initI18n();
  updateLangDisplay();
  bindGlobalEvents();
  renderQuiz();
}

function updateLangDisplay() {
  currentLangDisplay.textContent = getLang().toUpperCase();
}

function bindGlobalEvents() {
  quizTitleInput.addEventListener('input', (e) => {
    currentQuiz.title = (e.target as HTMLInputElement).value;
  });

  // Language Modal Logic
  openLangModalBtn.addEventListener('click', () => {
    langModal.classList.remove('hidden');
  });

  langCancelBtn.addEventListener('click', () => {
    langModal.classList.add('hidden');
  });

  langOptionBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const target = e.currentTarget as HTMLButtonElement;
      const newLang = target.getAttribute('data-lang') as 'en' | 'ru';
      if (newLang) {
        setLang(newLang);
        updateLangDisplay();
        renderQuiz();
      }
      langModal.classList.add('hidden');
    });
  });

  addQuestionBtn.addEventListener('click', () => {
    const newQuestion: Question = {
      id: generateId(),
      text: '',
      answers: [
        {
          id: generateId(),
          text: '',
          isCorrect: true
        }
      ]
    };
    currentQuiz.questions.push(newQuestion);
    renderQuiz();

    // Scroll to new question smoothly
    setTimeout(() => {
      window.scrollTo({
        top: document.body.scrollHeight,
        behavior: 'smooth'
      });
    }, 100);
  });

  exportBtn.addEventListener('click', () => {
    exportJson();
  });

  loadInput.addEventListener('change', (e) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (file) {
      loadJson(file);
    }
    // reset input
    loadInput.value = '';
  });
}

function renderQuiz() {
  quizTitleInput.value = currentQuiz.title;

  questionsList.innerHTML = '';

  currentQuiz.questions.forEach((question, index) => {
    const questionEl = renderQuestion(question, index);
    questionsList.appendChild(questionEl);
  });

  // Re-apply translations for entire DOM just in case
  applyTranslations();
}

function renderQuestion(question: Question, index: number): HTMLElement {
  const clone = questionTemplate.content.cloneNode(true) as DocumentFragment;
  const card = clone.querySelector('.question-card') as HTMLDivElement;

  card.dataset.questionId = question.id;

  const numberEl = card.querySelector('.question-number') as HTMLSpanElement;
  numberEl.textContent = `${t('questionPrefix')} ${index + 1}`;

  const textInput = card.querySelector('.question-text') as HTMLInputElement;
  textInput.value = question.text;
  textInput.addEventListener('input', (e) => {
    question.text = (e.target as HTMLInputElement).value;
  });

  const moveUpBtn = card.querySelector('.move-up-question') as HTMLButtonElement;
  const moveDownBtn = card.querySelector('.move-down-question') as HTMLButtonElement;

  if (index === 0) {
    moveUpBtn.disabled = true;
    moveUpBtn.style.opacity = '0.3';
    moveUpBtn.style.cursor = 'not-allowed';
  } else {
    moveUpBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      e.preventDefault();
      // Swap with previous
      const temp = currentQuiz.questions[index - 1];
      currentQuiz.questions[index - 1] = currentQuiz.questions[index];
      currentQuiz.questions[index] = temp;
      renderQuiz();
    });
  }

  if (index === currentQuiz.questions.length - 1) {
    moveDownBtn.disabled = true;
    moveDownBtn.style.opacity = '0.3';
    moveDownBtn.style.cursor = 'not-allowed';
  } else {
    moveDownBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      e.preventDefault();
      // Swap with next
      const temp = currentQuiz.questions[index + 1];
      currentQuiz.questions[index + 1] = currentQuiz.questions[index];
      currentQuiz.questions[index] = temp;
      renderQuiz();
    });
  }

  const removeBtn = card.querySelector('.remove-question') as HTMLButtonElement;
  removeBtn.addEventListener('click', async () => {
    const isConfirmed = await showConfirm(
      'confirmTitle',
      'confirmMessageQuestion'
    );

    if (!isConfirmed) {
      return;
    }

    // Add fly-out animation before removing
    card.style.opacity = '0';
    card.style.transform = 'translateY(-10px)';
    card.style.transition = 'all 0.2s';
    setTimeout(() => {
      currentQuiz.questions = currentQuiz.questions.filter(q => q.id !== question.id);
      renderQuiz();
    }, 200);
  });

  const answersList = card.querySelector('.answers-list') as HTMLDivElement;
  question.answers.forEach((answer) => {
    const answerEl = renderAnswer(answer, question);
    answersList.appendChild(answerEl);
  });

  const addAnswerBtn = card.querySelector('.add-answer') as HTMLButtonElement;
  addAnswerBtn.addEventListener('click', () => {
    const newAnswer: Answer = {
      id: generateId(),
      text: '',
      isCorrect: question.answers.length === 0 // Make first answer correct by default
    };
    question.answers.push(newAnswer);
    renderQuiz();

    // Auto-focus the last added answer text field
    setTimeout(() => {
      const inputs = card.querySelectorAll('.answer-text') as NodeListOf<HTMLInputElement>;
      if (inputs.length > 0) inputs[inputs.length - 1].focus();
    }, 50);
  });

  return card;
}

function renderAnswer(answer: Answer, question: Question): HTMLElement {
  const clone = answerTemplate.content.cloneNode(true) as DocumentFragment;
  const item = clone.querySelector('.answer-item') as HTMLDivElement;

  item.dataset.answerId = answer.id;

  if (answer.isCorrect) {
    item.classList.add('is-correct');
  }

  const radio = item.querySelector('.answer-correct-radio') as HTMLInputElement;
  radio.name = `correct-answer-${question.id}`; // unique per question
  radio.checked = answer.isCorrect;

  radio.addEventListener('change', () => {
    // Ensure this is the only correct answer for this question
    question.answers.forEach(a => {
      a.isCorrect = (a.id === answer.id);
    });
    renderQuiz();
  });

  const textInput = item.querySelector('.answer-text') as HTMLInputElement;
  textInput.value = answer.text;
  textInput.addEventListener('input', (e) => {
    answer.text = (e.target as HTMLInputElement).value;
  });

  const removeBtn = item.querySelector('.remove-answer') as HTMLButtonElement;
  removeBtn.addEventListener('click', async () => {
    const isConfirmed = await showConfirm(
      'confirmTitle',
      'confirmMessageAnswer'
    );

    if (!isConfirmed) {
      return;
    }

    item.style.opacity = '0';
    item.style.transform = 'translateX(-10px)';
    item.style.transition = 'all 0.2s';
    setTimeout(() => {
      question.answers = question.answers.filter(a => a.id !== answer.id);
      // If we removed the correct answer and others remain, make the first one correct
      if (answer.isCorrect && question.answers.length > 0) {
        question.answers[0].isCorrect = true;
      }
      renderQuiz();
    }, 200);
  });

  return item;
}

function exportJson() {
  const originalId = currentQuiz.id;

  // Always recreate all IDs from scratch on save
  currentQuiz.id = generateId();
  currentQuiz.questions.forEach(q => {
    q.id = generateId();
    q.answers.forEach(a => {
      a.id = generateId();
    });
  });

  const dataStr = JSON.stringify(currentQuiz, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;

  // Use the original ID for the filename if available, otherwise fallback
  const filename = (originalId || 'quiz').trim().replace(/\s+/g, '-').toLowerCase();
  link.download = `${filename}.json`;

  document.body.appendChild(link);
  link.click();

  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function loadJson(file: File) {
  const reader = new FileReader();

  reader.onload = (e) => {
    try {
      const content = e.target?.result as string;
      const parsed = JSON.parse(content) as Quiz;

      // Basic validation
      if (!parsed.id || !parsed.questions || !Array.isArray(parsed.questions)) {
        throw new Error('Invalid quiz format');
      }

      currentQuiz = parsed;
      renderQuiz();

      // Success feedback on load button
      const label = document.querySelector('label[for="load-json"]') as HTMLLabelElement;
      const originalText = label.innerHTML;
      label.innerHTML = `<span class="material-icons-round">check</span> ${t('loadedFeedback')}`;
      label.classList.add('btn-success');
      label.classList.remove('btn-secondary');

      setTimeout(() => {
        label.innerHTML = originalText;
        label.classList.remove('btn-success');
        label.classList.add('btn-secondary');
      }, 2000);

    } catch (err) {
      console.error('Failed to parse JSON', err);
      alert(t('errorFormat'));
    }
  };

  reader.readAsText(file);
}

// Start app
init();
