// ===== GLOBAL VARIABLES =====
let expression = "";
let currentLang = "id"; // Default language: Indonesian
let themeIndex = 0; // 0 = light, 1 = dark, 2 = dark-blue, 3 = dark-purple, 4 = dark-green
const themes = ["light-theme", "dark-theme", "dark-theme-blue", "dark-theme-purple", "dark-theme-green"];
let history = [];

// ===== TRANSLATION OBJECT =====
const translations = {
    en: {
        placeholder: "Type the number you want to calculate",
        enter: "Enter",
        delete: "Del",
        back: "Back",
        history: "History",
        clear: "Clear",
        noHistory: "No history yet",
        errorInvalid: "Invalid expression! Please check your input.",
        errorType: "Type error! Expression contains invalid characters or syntax."
    },
    id: {
        placeholder: "Tekan angka yang ingin anda hitung",
        enter: "Enter",
        delete: "Del",
        back: "Back",
        history: "Riwayat",
        clear: "Hapus",
        noHistory: "Belum ada riwayat",
        errorInvalid: "Ekspresi tidak valid! Silakan periksa input Anda.",
        errorType: "Kesalahan tipe! Ekspresi mengandung karakter atau sintaks yang tidak valid."
    }
};

// ===== DOM ELEMENTS =====
const displayElement = document.getElementById("display");
const placeholderElement = document.getElementById("placeholder");
const errorMessageElement = document.getElementById("errorMessage");
const themeToggleBtn = document.getElementById("themeToggle");
const langToggleBtn = document.getElementById("langToggle");
const historyToggleBtn = document.getElementById("historyToggle");
const enterBtn = document.getElementById("enterBtn");
const deleteBtn = document.getElementById("deleteBtn");
const backBtn = document.getElementById("backBtn");
const historyPanel = document.getElementById("historyPanel");
const historyList = document.getElementById("historyList");
const clearHistoryBtn = document.getElementById("clearHistoryBtn");
const langIcon = document.getElementById("langIcon");

// ===== INITIALIZATION =====
document.addEventListener("DOMContentLoaded", () => {
    loadPreferences();
    loadHistory();
    attachEventListeners();
    updateLanguage();
    console.log("Calculator initialized successfully!");
});

// ===== LOAD PREFERENCES FROM LOCALSTORAGE =====
function loadPreferences() {
    const savedTheme = localStorage.getItem("calculatorTheme");
    const savedLang = localStorage.getItem("calculatorLang");

    if (savedTheme) {
        themeIndex = parseInt(savedTheme);
        document.body.className = themes[themeIndex];
    }

    if (savedLang) {
        currentLang = savedLang;
    }
}

// ===== LOAD HISTORY FROM LOCALSTORAGE =====
function loadHistory() {
    const savedHistory = localStorage.getItem("calculatorHistory");
    if (savedHistory) {
        history = JSON.parse(savedHistory);
        renderHistory();
    }
}

// ===== SAVE HISTORY TO LOCALSTORAGE =====
function saveHistory() {
    localStorage.setItem("calculatorHistory", JSON.stringify(history));
}

// ===== ATTACH EVENT LISTENERS =====
function attachEventListeners() {
    // Calculator buttons
    const calcButtons = document.querySelectorAll(".calc-btn[data-value]");
    calcButtons.forEach(button => {
        button.addEventListener("click", () => {
            appendToExpression(button.getAttribute("data-value"));
        });
    });

    // Special buttons
    enterBtn.addEventListener("click", calculateResult);
    deleteBtn.addEventListener("click", clearExpression);
    backBtn.addEventListener("click", backspace);

    // Control buttons
    themeToggleBtn.addEventListener("click", toggleTheme);
    langToggleBtn.addEventListener("click", toggleLanguage);
    historyToggleBtn.addEventListener("click", toggleHistory);
    clearHistoryBtn.addEventListener("click", clearHistory);

    // Keyboard support
    document.addEventListener("keydown", handleKeyboard);
}

// ===== APPEND TO EXPRESSION =====
function appendToExpression(value) {
    errorMessageElement.textContent = "";
    expression += value;
    updateDisplay();
}

// ===== UPDATE DISPLAY =====
function updateDisplay() {
    if (expression === "") {
        displayElement.textContent = "0";
    } else {
        displayElement.textContent = expression;
    }
}

// ===== CALCULATE RESULT =====
function calculateResult() {
    if (expression === "") return;

    try {
        // Validate expression type
        if (!isValidExpression(expression)) {
            throw new TypeError(translations[currentLang].errorType);
        }

        // Replace common math notations for eval
        let evalExpression = expression
            .replace(/Math\.sin\(/g, "Math.sin(")
            .replace(/Math\.cos\(/g, "Math.cos(")
            .replace(/Math\.tan\(/g, "Math.tan(")
            .replace(/Math\.log10\(/g, "Math.log10(")
            .replace(/Math\.sqrt\(/g, "Math.sqrt(");

        // Calculate result
        const result = eval(evalExpression);

        // Check for NaN or Infinity
        if (!isFinite(result)) {
            throw new Error(translations[currentLang].errorInvalid);
        }

        // Add to history
        addToHistory(expression, result);

        // Update display
        expression = result.toString();
        updateDisplay();
        errorMessageElement.textContent = "";

    } catch (error) {
        if (error instanceof TypeError) {
            errorMessageElement.textContent = translations[currentLang].errorType;
        } else {
            errorMessageElement.textContent = translations[currentLang].errorInvalid;
        }
        console.error("Calculation error:", error);
    }
}

// ===== VALIDATE EXPRESSION =====
function isValidExpression(expr) {
    // Check for invalid characters
    const validChars = /^[0-9+\-*/.()%\sMathesincogtaqrlp]+$/;
    if (!validChars.test(expr)) {
        return false;
    }

    // Additional validation: check parentheses balance
    let balance = 0;
    for (let char of expr) {
        if (char === "(") balance++;
        if (char === ")") balance--;
        if (balance < 0) return false;
    }

    return balance === 0;
}

// ===== CLEAR EXPRESSION =====
function clearExpression() {
    expression = "";
    updateDisplay();
    errorMessageElement.textContent = "";
}

// ===== BACKSPACE =====
function backspace() {
    // Handle Math functions specially
    const mathFunctions = ["Math.sin(", "Math.cos(", "Math.tan(", "Math.log10(", "Math.sqrt(", "1/Math.sin(", "1/Math.cos(", "1/Math.tan("];

    let removed = false;
    for (let func of mathFunctions) {
        if (expression.endsWith(func)) {
            expression = expression.slice(0, -func.length);
            removed = true;
            break;
        }
    }

    if (!removed) {
        expression = expression.slice(0, -1);
    }

    updateDisplay();
    errorMessageElement.textContent = "";
}

// ===== ADD TO HISTORY =====
function addToHistory(expr, result) {
    const historyItem = {
        expression: expr,
        result: result,
        timestamp: new Date().toLocaleString()
    };

    history.unshift(historyItem);

    // Keep only last 20 items
    if (history.length > 20) {
        history = history.slice(0, 20);
    }

    saveHistory();
    renderHistory();
}

// ===== RENDER HISTORY =====
function renderHistory() {
    if (history.length === 0) {
        historyList.innerHTML = `<p class="text-muted" id="emptyHistoryMsg">${translations[currentLang].noHistory}</p>`;
        return;
    }

    historyList.innerHTML = "";

    history.forEach((item, index) => {
        const historyItemDiv = document.createElement("div");
        historyItemDiv.className = "history-item";
        historyItemDiv.innerHTML = `
            <div class="history-expression">${item.expression}</div>
            <div class="history-result">= ${item.result}</div>
        `;

        historyItemDiv.addEventListener("click", () => {
            expression = item.expression;
            updateDisplay();
            toggleHistory(); // Close history panel
        });

        historyList.appendChild(historyItemDiv);
    });
}

// ===== CLEAR HISTORY =====
function clearHistory() {
    history = [];
    saveHistory();
    renderHistory();
}

// ===== TOGGLE HISTORY PANEL =====
function toggleHistory() {
    historyPanel.classList.toggle("show");
}

// ===== TOGGLE THEME =====
function toggleTheme() {
    themeIndex = (themeIndex + 1) % themes.length;
    document.body.className = themes[themeIndex];
    localStorage.setItem("calculatorTheme", themeIndex.toString());
}

// ===== TOGGLE LANGUAGE =====
function toggleLanguage() {
    currentLang = currentLang === "id" ? "en" : "id";
    localStorage.setItem("calculatorLang", currentLang);
    updateLanguage();
}

// ===== UPDATE LANGUAGE =====
function updateLanguage() {
    // Update language icon
    langIcon.textContent = currentLang === "id" ? "Id" : "En";

    // Update all translatable elements
    placeholderElement.textContent = translations[currentLang].placeholder;
    enterBtn.textContent = translations[currentLang].enter;
    deleteBtn.textContent = translations[currentLang].delete;
    backBtn.textContent = translations[currentLang].back;

    const historyTitle = document.getElementById("historyTitle");
    if (historyTitle) historyTitle.textContent = translations[currentLang].history;

    clearHistoryBtn.textContent = translations[currentLang].clear;

    // Re-render history to update empty message
    renderHistory();
}

// ===== KEYBOARD SUPPORT =====
function handleKeyboard(event) {
    const key = event.key;

    // Numbers and operators
    if (/[0-9+\-*/.()]/.test(key)) {
        event.preventDefault();
        appendToExpression(key);
    }

    // Enter key
    if (key === "Enter") {
        event.preventDefault();
        calculateResult();
    }

    // Backspace
    if (key === "Backspace") {
        event.preventDefault();
        backspace();
    }

    // Escape (clear)
    if (key === "Escape") {
        event.preventDefault();
        clearExpression();
    }
}

console.log("Selamat datang di kalkulator modern!");
