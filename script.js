// --- Global Variables & Constants ---
const mainContent = document.getElementById('main-content');
const darkModeToggle = document.getElementById('dark-mode-toggle');
const body = document.body;
const missionPopup = document.getElementById('congratulations-popup');
const crosswordPopup = document.getElementById('crossword-congratulations-popup');

// Crossword specific state (needs to be accessible by functions)
let currentWord = null;
let currentDirection = 'across';
const words = [
    { type: 'across', number: 1, row: 0, col: 2, length: 5, answer: 'BUGAR' },
    { type: 'across', number: 2, row: 1, col: 9, length: 4, answer: 'WHTR' },
    { type: 'across', number: 5, row: 4, col: 0, length: 8, answer: 'DIABETES' },
    { type: 'across', number: 7, row: 8, col: 5, length: 7, answer: 'KENYANG' },
    { type: 'across', number: 8, row: 10, col: 8, length: 3, answer: 'BMI' },
    { type: 'down', number: 1, row: 0, col: 2, length: 8, answer: 'BERJALAN' },
    { type: 'down', number: 3, row: 1, col: 10, length: 10, answer: 'HIPERTENSI' },
    { type: 'down', number: 4, row: 2, col: 4, length: 5, answer: 'OMEGA' },
    { type: 'down', number: 5, row: 4, col: 0, length: 7, answer: 'DEPRESI' },
    { type: 'down', number: 6, row: 4, col: 7, length: 6, answer: 'SPRINT' }
];

// --- Core Functions ---

// Function to fetch and load content into the main area
function loadContent(url, initializerFn) {
    if (!mainContent) {
        console.error("Main content area not found!");
        return;
    }
    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.text();
        })
        .then(html => {
            mainContent.innerHTML = html;
            window.scrollTo(0, 0); // Scroll to top after loading
            if (initializerFn && typeof initializerFn === 'function') {
                initializerFn(); // Run the specific initializer function for the loaded content
            }
        })
        .catch(error => {
            console.error('Error loading content:', error);
            mainContent.innerHTML = `<p class="error-message">Gagal memuat konten. Silakan coba lagi.</p>`;
        });
}

// --- Page Loading Functions ---

function loadHomePage() {
    // No specific initializer needed for homepage as buttons are static or external links
    loadContent('homepage.html');
}

function loadVideoPage() {
    loadContent('video.html');
}

function loadMissionPage() {
    loadContent('missions.html', initializeMissions); // Pass initializer
}

function loadCrosswordPage() {
    loadContent('crossword.html', initializeCrossword); // Pass initializer
}


// --- Initialization Functions (Called after content loads) ---

function initializeMissions() {
    const checkboxes = document.querySelectorAll('.mission-checkbox');
    if (checkboxes.length === 0) return; // No checkboxes found

    // Load saved checkboxes from localStorage
    checkboxes.forEach(checkbox => {
        const day = checkbox.getAttribute('data-day');
        if (localStorage.getItem(`mission-${day}`) === 'completed') {
            checkbox.checked = true;
        }

        checkbox.addEventListener('change', function() {
            const day = this.getAttribute('data-day');
            if (this.checked) {
                localStorage.setItem(`mission-${day}`, 'completed');
            } else {
                localStorage.removeItem(`mission-${day}`);
            }
            checkAllMissionsCompleted(checkboxes); // Pass checkboxes to the function
        });
    });

    // Check on load if all missions are completed
    checkAllMissionsCompleted(checkboxes);
}

function initializeCrossword() {
    currentWord = null; // Reset state when loading
    currentDirection = 'across';

    const crosswordInputs = document.querySelectorAll('#crossword input');
    if (crosswordInputs.length === 0) return; // No inputs found

    // Focus first input when crossword page is shown
    const firstInput = document.querySelector('#crossword input[type="text"]');
    if (firstInput) {
       // Delay focus slightly to ensure rendering is complete
       setTimeout(() => firstInput.focus(), 100);
    }

    // Attach listeners
    crosswordInputs.forEach(input => {
        input.addEventListener('input', handleCrosswordInput);
        input.addEventListener('keydown', handleCrosswordKeyDown);
        input.addEventListener('focus', handleCrosswordFocus);
        input.addEventListener('click', handleCrosswordClick);
    });

    // Attach listener to the check button (ensure it exists first)
    const checkButton = document.querySelector('.crossword-button');
     if (checkButton && checkButton.onclick === null) { // Prevent duplicate listeners if re-loading
         checkButton.onclick = checkCrosswordAnswers; // Assign directly as it's defined globally now
     }

     // Attach listener to clue list items (ensure they exist)
     const clueItems = document.querySelectorAll('.clues li');
     clueItems.forEach(item => {
         if (item.onclick === null) { // Prevent duplicate listeners
            item.onclick = () => {
                 const number = parseInt(item.dataset.number);
                 const direction = item.closest('.clues').querySelector('h3').textContent.toLowerCase().includes('mendatar') ? 'across' : 'down';
                 highlightWord(number, direction);
            };
         }
     });

}

// --- Dark Mode ---

function applyDarkModePreference() {
    if (localStorage.getItem('darkMode') === 'enabled') {
        body.classList.add('dark-mode');
        darkModeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    } else {
        body.classList.remove('dark-mode');
        darkModeToggle.innerHTML = '<i class="fas fa-moon"></i>';
    }
}

darkModeToggle.addEventListener('click', function() {
    body.classList.toggle('dark-mode');
    const isDarkMode = body.classList.contains('dark-mode');
    darkModeToggle.innerHTML = isDarkMode ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    localStorage.setItem('darkMode', isDarkMode ? 'enabled' : 'disabled');
});

// --- Popup Functions ---

function showCongratulationsPopup() {
    if (!missionPopup) return;
    missionPopup.classList.add('active');

    // Fire confetti if library is loaded
    if (typeof confetti === 'function') {
        confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
        setTimeout(() => {
            confetti({ particleCount: 100, angle: 60, spread: 55, origin: { x: 0 } });
            confetti({ particleCount: 100, angle: 120, spread: 55, origin: { x: 1 } });
        }, 500);
    }
}

function showCrosswordCongratulationsPopup() {
     if (!crosswordPopup) return;
     crosswordPopup.classList.add('active');

     // Fire confetti if library is loaded
     if (typeof confetti === 'function') {
         confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
         setTimeout(() => {
             confetti({ particleCount: 100, angle: 60, spread: 55, origin: { x: 0 } });
             confetti({ particleCount: 100, angle: 120, spread: 55, origin: { x: 1 } });
         }, 500);
     }
 }


function closePopup() {
    if (missionPopup) missionPopup.classList.remove('active');
}

function closeCrosswordPopup() {
    if (crosswordPopup) crosswordPopup.classList.remove('active');
}

// Add listeners to popup close buttons if they exist
// Need to use event delegation or re-attach listeners if popups are dynamically added,
// but since they are in index.html, we can attach once.
document.querySelectorAll('.popup-close').forEach(button => {
    button.addEventListener('click', () => {
        // Find the parent popup overlay and close it
        const popup = button.closest('.popup-overlay, .popup-overflow');
        if (popup) {
            popup.classList.remove('active');
        }
    });
});


// --- Mission Logic ---

function checkAllMissionsCompleted(checkboxes) {
    if (!checkboxes || checkboxes.length === 0) return; // Ensure checkboxes exist
    const allChecked = Array.from(checkboxes).every(checkbox => checkbox.checked);
    if (allChecked) {
        showCongratulationsPopup();
    }
}

// --- Crossword Logic (Helper functions moved here) ---

// Event Handlers (called by listeners set in initializeCrossword)
function handleCrosswordInput(event) {
    const input = event.target;
    if (input.value.length === 1) {
        moveToNextCell(input);
    }
}

function handleCrosswordKeyDown(event) {
    const input = event.target;
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
        navigateWithArrows(input, event.key);
        event.preventDefault();
    } else if (event.key === 'Backspace' && input.value === '') {
        moveToPreviousCell(input);
        event.preventDefault();
    } else if (event.key === ' ') { // Space to toggle direction
        if (input.dataset.across && input.dataset.down) {
            toggleDirection(input);
        }
        event.preventDefault();
    }
}

function handleCrosswordFocus(event) {
    const input = event.target;
    updateCurrentWord(input);
    highlightCurrentWordUI();
}

function handleCrosswordClick(event) {
    const input = event.target;
     // Only toggle if it's an intersection cell and the focus didn't *just* change direction
     if (currentWord && input.dataset.across && input.dataset.down) {
        // Check if the focus event already potentially switched the direction
        const clickedRow = parseInt(input.dataset.row);
        const clickedCol = parseInt(input.dataset.col);
        let focusSwitchedDirection = false;

        if (currentDirection === 'across' && currentWord.row !== clickedRow) {
            focusSwitchedDirection = true;
        } else if (currentDirection === 'down' && currentWord.col !== clickedCol) {
             focusSwitchedDirection = true;
        }

        if (!focusSwitchedDirection) {
            toggleDirection(input);
        }
     }
     // Ensure highlighting happens even if direction doesn't toggle
     updateCurrentWord(input);
     highlightCurrentWordUI();
}


// Crossword Core Logic
function updateCurrentWord(input) {
    const row = parseInt(input.dataset.row);
    const col = parseInt(input.dataset.col);

    const containingWords = words.filter(word => {
        if (word.type === 'across') {
            return (row === word.row && col >= word.col && col < word.col + word.length);
        } else { // down
            return (col === word.col && row >= word.row && row < word.row + word.length);
        }
    });

    if (containingWords.length === 0) {
        currentWord = null;
        return;
    }

    // Try to stick with the current direction if possible
    const wordInCurrentDirection = containingWords.find(w => w.type === currentDirection);

    if (wordInCurrentDirection) {
        currentWord = wordInCurrentDirection;
    } else {
        // If not possible, switch direction and pick the first available word
        currentDirection = (currentDirection === 'across' ? 'down' : 'across');
        currentWord = containingWords.find(w => w.type === currentDirection) || containingWords[0];
        if(currentWord) currentDirection = currentWord.type; // Ensure direction matches selected word
    }
}

function highlightCurrentWordUI() {
    // Clear previous highlights
    document.querySelectorAll('#crossword input').forEach(input => {
        input.classList.remove('active-across', 'active-down');
    });

    if (!currentWord) return;

    const highlightClass = currentWord.type === 'across' ? 'active-across' : 'active-down';

    for (let i = 0; i < currentWord.length; i++) {
        let r, c;
        if (currentWord.type === 'across') {
            r = currentWord.row;
            c = currentWord.col + i;
        } else { // down
            r = currentWord.row + i;
            c = currentWord.col;
        }

        const cellInput = document.querySelector(`#crossword input[data-row="${r}"][data-col="${c}"]`);
        if (cellInput) {
            cellInput.classList.add(highlightClass);
        }
    }
}

function toggleDirection(inputElement) {
    currentDirection = (currentDirection === 'across' ? 'down' : 'across');
    updateCurrentWord(inputElement); // Re-evaluate the current word based on the new direction
    highlightCurrentWordUI();
}

function moveToNextCell(currentInput) {
    if (!currentWord) return;

    const row = parseInt(currentInput.dataset.row);
    const col = parseInt(currentInput.dataset.col);
    let nextRow = row;
    let nextCol = col;

    if (currentDirection === 'across') {
        nextCol = col + 1;
        // Check if it's the end of the word
        if (nextCol >= currentWord.col + currentWord.length) return; // Don't move past the end
    } else { // down
        nextRow = row + 1;
        // Check if it's the end of the word
         if (nextRow >= currentWord.row + currentWord.length) return; // Don't move past the end
    }

    const nextInput = document.querySelector(`#crossword input[data-row="${nextRow}"][data-col="${nextCol}"]`);
    if (nextInput && !nextInput.parentElement.classList.contains('black')) {
        nextInput.focus();
    }
}

function moveToPreviousCell(currentInput) {
    if (!currentWord) return;

    const row = parseInt(currentInput.dataset.row);
    const col = parseInt(currentInput.dataset.col);
    let prevRow = row;
    let prevCol = col;

    if (currentDirection === 'across') {
        prevCol = col - 1;
        if (prevCol < currentWord.col) return; // Don't move before the start
    } else { // down
        prevRow = row - 1;
         if (prevRow < currentWord.row) return; // Don't move before the start
    }

    const prevInput = document.querySelector(`#crossword input[data-row="${prevRow}"][data-col="${prevCol}"]`);
     if (prevInput && !prevInput.parentElement.classList.contains('black')) {
         prevInput.focus();
         prevInput.value = ''; // Clear the previous cell value for easier correction
     }
}


function navigateWithArrows(currentInput, key) {
    const row = parseInt(currentInput.dataset.row);
    const col = parseInt(currentInput.dataset.col);
    let targetRow = row;
    let targetCol = col;

    switch (key) {
        case 'ArrowUp':    targetRow--; break;
        case 'ArrowDown':  targetRow++; break;
        case 'ArrowLeft':  targetCol--; break;
        case 'ArrowRight': targetCol++; break;
    }

    // Find the next non-black cell in the target direction
    let targetInput = document.querySelector(`#crossword input[data-row="${targetRow}"][data-col="${targetCol}"]`);

    // Keep moving in the arrow direction until a non-black cell is found or boundary hit (simple version)
    // A more robust solution would involve checking boundaries explicitly.
    while (targetInput && targetInput.parentElement.classList.contains('black')) {
         switch (key) {
             case 'ArrowUp':    targetRow--; break;
             case 'ArrowDown':  targetRow++; break;
             case 'ArrowLeft':  targetCol--; break;
             case 'ArrowRight': targetCol++; break;
         }
         targetInput = document.querySelector(`#crossword input[data-row="${targetRow}"][data-col="${targetCol}"]`);
    }


    if (targetInput) {
        targetInput.focus();
        // Update direction based on movement if it changed axis
        if ((key === 'ArrowUp' || key === 'ArrowDown') && currentDirection === 'across') {
            currentDirection = 'down';
        } else if ((key === 'ArrowLeft' || key === 'ArrowRight') && currentDirection === 'down') {
            currentDirection = 'across';
        }
        updateCurrentWord(targetInput); // Update based on the new focused cell
        highlightCurrentWordUI();
    }
}

function highlightWord(number, direction) {
    // Ensure the crossword is loaded
    if (!document.getElementById('crossword')) return;

    currentDirection = direction;
    currentWord = words.find(word => word.number === number && word.type === direction);

    if (currentWord) {
        const firstInput = document.querySelector(
            `#crossword input[data-row="${currentWord.row}"][data-col="${currentWord.col}"]`
        );
        if (firstInput) {
            firstInput.focus(); // Focus will trigger highlighting via the focus handler
        } else {
            highlightCurrentWordUI(); // Directly highlight if focus fails
        }
    }
}

function checkCrosswordAnswers() {
    // Ensure the crossword elements are present
     const scoreElement = document.getElementById('score');
     const wrongWordsContainer = document.getElementById('wrong-words');
     const wrongWordsList = document.getElementById('wrong-words-list');
     const allInputs = document.querySelectorAll('#crossword input');

     if (!scoreElement || !wrongWordsContainer || !wrongWordsList || allInputs.length === 0) {
         console.error("Crossword elements not found for checking.");
         return;
     }

    let correctCount = 0;
    const wrongWordsData = [];
    let attemptedWordsCount = 0;


    // Reset all cell classes
    allInputs.forEach(input => {
        input.classList.remove('correct', 'incorrect', 'wrong-word');
    });

    // Clear previous wrong words list
    wrongWordsList.innerHTML = '';
    wrongWordsContainer.style.display = 'none';

    // Check each word
    words.forEach(word => {
        let userAnswer = '';
        let wordAttempted = false;

        // Get user's answer for this word
        for (let i = 0; i < word.length; i++) {
            let row, col;
            if (word.type === 'across') {
                row = word.row;
                col = word.col + i;
            } else { // down
                row = word.row + i;
                col = word.col;
            }

            const input = document.querySelector(`#crossword input[data-row="${row}"][data-col="${col}"]`);
            if (input) {
                const val = input.value.toUpperCase();
                userAnswer += val;
                 if (val !== '') wordAttempted = true; // Mark word as attempted if any cell has value
            }
        }

        // Only score attempted words
        if (wordAttempted) {
            attemptedWordsCount++;
             if (userAnswer === word.answer) {
                 correctCount++;
                 // Mark correct cells
                 markWordCells(word, 'correct');
             } else {
                 // Add to wrong words list
                 wrongWordsData.push({
                     number: word.number,
                     type: word.type,
                     answer: word.answer,
                     userAnswer: userAnswer
                 });
                 // Mark incorrect cells
                 markWordCells(word, 'incorrect');
                 markWordCells(word, 'wrong-word'); // Add border highlight too
             }
        }
    });

    // Calculate and display score
    const score = attemptedWordsCount > 0 ? Math.round((correctCount / attemptedWordsCount) * 100) : 0;
    scoreElement.textContent = `Skor: ${score}%`; // Display as percentage

    // Show wrong words if any
    if (wrongWordsData.length > 0) {
        wrongWordsContainer.style.display = 'block';
        wrongWordsData.forEach(word => {
            const li = document.createElement('li');
            li.textContent = `${word.type === 'across' ? 'Mendatar' : 'Menurun'} ${word.number}: Jawaban Anda "${word.userAnswer || '(kosong)'}", seharusnya "${word.answer}"`;
            wrongWordsList.appendChild(li);
        });
    }

    // Show completion message if perfect score on all attempted words
    if (attemptedWordsCount > 0 && correctCount === attemptedWordsCount) {
        showCrosswordCongratulationsPopup();
    }
}

function markWordCells(word, className) {
     for (let i = 0; i < word.length; i++) {
         let row, col;
         if (word.type === 'across') {
             row = word.row;
             col = word.col + i;
         } else { // down
             row = word.row + i;
             col = word.col;
         }
         const input = document.querySelector(`#crossword input[data-row="${row}"][data-col="${col}"]`);
         if (input) {
             input.classList.add(className);
         }
     }
 }


// --- Initial Setup ---

document.addEventListener('DOMContentLoaded', () => {
    applyDarkModePreference();
    loadHomePage(); // Load the homepage content by default

    // Static button listeners (like header buttons that don't change)
    const backToBookButton = document.getElementById('back-to-book');
    if (backToBookButton) {
        backToBookButton.addEventListener('click', loadHomePage);
    }

     // Logo click listener (if desired)
     const logoLink = document.querySelector('.logo a');
     if (logoLink) {
         // Prevent default if it's just for navigation within the app
         // logoLink.addEventListener('click', (e) => {
         //     e.preventDefault();
         //     loadHomePage();
         // });
         // Or keep default if it links externally like in the example
     }
});