type Translations = {
    [key: string]: string;
};

type Dictionary = {
    [lang: string]: Translations;
};

export const dictionary: Dictionary = {
    en: {
        appTitle: 'Quiz Editor',
        langSelectTooltip: 'Select Language',
        langModalTitle: 'Select Language',
        loadJson: 'Load JSON',
        exportJson: 'Export JSON',
        quizTitleLabel: 'Quiz Title',
        quizTitlePlaceholder: 'e.g. My Awesome Quiz',
        questionsHeader: 'Questions',
        addQuestionTooltip: 'Add Question',
        questionPrefix: 'Question',
        moveUpTooltip: 'Move Up',
        moveDownTooltip: 'Move Down',
        removeQuestionTooltip: 'Remove Question',
        questionTextPlaceholder: 'Enter question text here...',
        answersHeader: 'Answers',
        addAnswerTooltip: 'Add Answer',
        answerTextPlaceholder: 'Answer text...',
        removeAnswerTooltip: 'Remove Answer',
        confirmTitle: 'Confirm Action',
        confirmMessageDefault: 'Are you sure you want to proceed?',
        confirmMessageQuestion: 'Are you sure you want to delete this question? This action cannot be undone.',
        confirmMessageAnswer: 'Are you sure you want to delete this answer?',
        confirmCancel: 'Cancel',
        confirmDelete: 'Delete',
        loadedFeedback: 'Loaded!',
        errorFormat: 'Failed to load JSON file. Please make sure it follows the correct format.',
    },
    ru: {
        appTitle: 'Редактор тестов',
        langSelectTooltip: 'Выбрать язык',
        langModalTitle: 'Выберите язык',
        loadJson: 'Загрузить JSON',
        exportJson: 'Экспорт JSON',
        quizTitleLabel: 'Название теста',
        quizTitlePlaceholder: 'напр. Мой отличный тест',
        questionsHeader: 'Вопросы',
        addQuestionTooltip: 'Добавить вопрос',
        questionPrefix: 'Вопрос',
        moveUpTooltip: 'Переместить вверх',
        moveDownTooltip: 'Переместить вниз',
        removeQuestionTooltip: 'Удалить вопрос',
        questionTextPlaceholder: 'Введите текст вопроса здесь...',
        answersHeader: 'Ответы',
        addAnswerTooltip: 'Добавить ответ',
        answerTextPlaceholder: 'Текст ответа...',
        removeAnswerTooltip: 'Удалить ответ',
        confirmTitle: 'Подтверждение',
        confirmMessageDefault: 'Вы уверены, что хотите продолжить?',
        confirmMessageQuestion: 'Вы уверены, что хотите удалить этот вопрос? Это действие необратимо.',
        confirmMessageAnswer: 'Вы уверены, что хотите удалить этот ответ?',
        confirmCancel: 'Отмена',
        confirmDelete: 'Удалить',
        loadedFeedback: 'Загружено!',
        errorFormat: 'Не удалось загрузить JSON файл. Пожалуйста, убедитесь, что он имеет правильный формат.',
    }
};

let currentLang: 'en' | 'ru' = 'en';

export function getLang(): 'en' | 'ru' {
    return currentLang;
}

export function setLang(lang: 'en' | 'ru') {
    currentLang = lang;
    document.documentElement.lang = lang;
    localStorage.setItem('teflecher_lang', lang);
    applyTranslations();
}

export function t(key: string): string {
    return dictionary[currentLang]?.[key] || key;
}

export function applyTranslations(container: HTMLElement | Document = document) {
    const elements = container.querySelectorAll('[data-i18n]');

    elements.forEach((el) => {
        const key = el.getAttribute('data-i18n');
        if (!key) return;

        const translation = t(key);

        // Check specific attributes to translate, otherwise default to textContent
        if (el.hasAttribute('placeholder')) {
            el.setAttribute('placeholder', translation);
        } else if (el.hasAttribute('data-tooltip')) {
            el.setAttribute('data-tooltip', translation);
        } else if (el.hasAttribute('title')) {
            el.setAttribute('title', translation);
        } else {
            // For elements with inner icons (like buttons), we only want to replace the text nodes.
            // But for simplicity, if it's a direct text replacement without complex nested HTML:
            const textNode = Array.from(el.childNodes).find(node => node.nodeType === Node.TEXT_NODE && node.textContent?.trim() !== '');
            if (textNode) {
                textNode.textContent = translation;
            } else {
                // Fallback if no text node exists but it should have text
                el.textContent = translation;
            }
        }
    });
}

// Init logic for language
export function initI18n() {
    const saved = localStorage.getItem('teflecher_lang');
    if (saved === 'en' || saved === 'ru') {
        setLang(saved);
    } else {
        // Detect browser language? Let's just default to EN for now.
        setLang('en');
    }
}
