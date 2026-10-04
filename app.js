/**
 * STUDYBUDDY - CORE APPLICATION LOGIC
 * Includes: Web Audio Synth, Pomodoro Clock, 3D Flashcards Engine, Customizable Quiz Arena
 */

// ========================================================
// 1. DATA STORAGE & INITIAL STATE
// ========================================================

const STORAGE_KEYS = {
  POMO_SETTINGS: 'studybuddy_pomo_settings',
  POMO_STATS: 'studybuddy_pomo_stats',
  DECKS: 'studybuddy_decks',
  ACTIVE_DECK_ID: 'studybuddy_active_deck_id',
  CUSTOM_QUIZ_QUESTIONS: 'studybuddy_custom_quiz_questions',
  SOUND_ENABLED: 'studybuddy_sound_enabled'
};

const DEFAULT_DECKS = [
  {
    id: 'deck-web-dev',
    name: '💻 Web Development Essentials',
    cards: [
      { id: 'c1', front: 'What does HTML stand for?', back: 'HyperText Markup Language - the standard markup language used to create web pages.', status: 'mastered' },
      { id: 'c2', front: 'What is the purpose of the CSS Box Model?', back: 'It defines the design and layout of elements: content, padding, border, and margin.', status: 'new' },
      { id: 'c3', front: 'What is the difference between `let` and `const` in JavaScript?', back: '`let` allows variable reassignment, while `const` creates an immutable variable binding (cannot be reassigned).', status: 'learning' },
      { id: 'c4', front: 'What does API stand for and what does it do?', back: 'Application Programming Interface: A set of rules and protocols enabling different software applications to communicate with each other.', status: 'new' },
      { id: 'c5', front: 'What is the DOM in web browsers?', back: 'Document Object Model: A tree representation of HTML documents created by browsers, allowing scripts to update content and styling.', status: 'mastered' },
      { id: 'c6', front: 'What is responsive web design?', back: 'An approach where web pages adapt gracefully to various screen sizes and viewports using fluid layouts and media queries.', status: 'new' }
    ]
  },
  {
    id: 'deck-science',
    name: '🔬 General Science & Space',
    cards: [
      { id: 's1', front: 'What is the closest planet to the Sun?', back: 'Mercury - orbiting about 57.9 million kilometers away.', status: 'mastered' },
      { id: 's2', front: 'What is the powerhouse organelle of the cell?', back: 'The Mitochondrion (produces ATP through cellular respiration).', status: 'new' },
      { id: 's3', front: 'What chemical element has the symbol "Au"?', back: 'Gold (from the Latin word "aurum").', status: 'learning' },
      { id: 's4', front: 'What is Newton’s Third Law of Motion?', back: 'For every action, there is an equal and opposite reaction.', status: 'new' }
    ]
  }
];

const DEFAULT_CUSTOM_QUIZ = [
  {
    id: 'cq-1',
    question: 'Which HTML tag is used to create an interactive hyperlink?',
    options: ['<link>', '<a>', '<href>', '<hyper>'],
    correctIndex: 1,
    explanation: 'The <a> (anchor) tag with the href attribute defines a hyperlink.'
  },
  {
    id: 'cq-2',
    question: 'In CSS, which property is used to control space inside an element’s border?',
    options: ['margin', 'padding', 'spacing', 'gap'],
    correctIndex: 1,
    explanation: 'Padding provides inner breathing room between the element content and its border.'
  },
  {
    id: 'cq-3',
    question: 'Which method converts a JavaScript object into a JSON string?',
    options: ['JSON.parse()', 'JSON.stringify()', 'JSON.toString()', 'Object.toJSON()'],
    correctIndex: 1,
    explanation: 'JSON.stringify() serializes an object into a JSON formatted string.'
  }
];

// ========================================================
// 2. WEB AUDIO SYNTHESIZER
// ========================================================

class SoundController {
  constructor() {
    this.enabled = localStorage.getItem(STORAGE_KEYS.SOUND_ENABLED) !== 'false';
    this.audioCtx = null;
  }

  initContext() {
    if (!this.audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.audioCtx = new AudioContext();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  toggle() {
    this.enabled = !this.enabled;
    localStorage.setItem(STORAGE_KEYS.SOUND_ENABLED, this.enabled);
    return this.enabled;
  }

  playTone(freq, type, duration, startTime = 0, gainLevel = 0.15) {
    if (!this.enabled) return;
    try {
      this.initContext();
      if (!this.audioCtx) return;

      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime + startTime);

      gain.gain.setValueAtTime(gainLevel, this.audioCtx.currentTime + startTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.audioCtx.currentTime + startTime + duration);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start(this.audioCtx.currentTime + startTime);
      osc.stop(this.audioCtx.currentTime + startTime + duration);
    } catch (e) {
      console.warn('Audio play failed:', e);
    }
  }

  playChime() {
    // Elegant two-note chime
    this.playTone(523.25, 'sine', 0.4, 0, 0.2); // C5
    this.playTone(659.25, 'sine', 0.6, 0.15, 0.2); // E5
    this.playTone(783.99, 'sine', 0.8, 0.3, 0.2); // G5
  }

  playSuccess() {
    this.playTone(587.33, 'triangle', 0.2, 0, 0.18); // D5
    this.playTone(880.00, 'triangle', 0.35, 0.1, 0.2); // A5
  }

  playWrong() {
    this.playTone(280, 'sawtooth', 0.25, 0, 0.15);
    this.playTone(220, 'sawtooth', 0.35, 0.12, 0.15);
  }

  playClick() {
    this.playTone(700, 'sine', 0.05, 0, 0.08);
  }
}

const sounds = new SoundController();

// ========================================================
// 3. TOAST NOTIFICATIONS
// ========================================================

function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span>${message}</span>`;

  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 2800);
}

// ========================================================
// 4. POMODORO TIMER MODULE
// ========================================================

class PomodoroTimer {
  constructor() {
    this.modes = {
      focus: { name: 'Focus', defaultMinutes: 25, gradient: 'url(#timerGradient)' },
      shortBreak: { name: 'Short Break', defaultMinutes: 5, gradient: 'url(#breakGradient)' },
      longBreak: { name: 'Long Break', defaultMinutes: 15, gradient: 'url(#breakGradient)' }
    };

    this.settings = JSON.parse(localStorage.getItem(STORAGE_KEYS.POMO_SETTINGS)) || {
      focus: 25,
      shortBreak: 5,
      longBreak: 15
    };

    this.currentMode = 'focus';
    this.timeLeft = this.settings.focus * 60;
    this.totalTime = this.timeLeft;
    this.isRunning = false;
    this.timerInterval = null;
    this.sessionCount = 1;

    this.initStats();
    this.cacheDom();
    this.bindEvents();
    this.updateDisplay();
    this.renderSettingsInputs();
  }

  initStats() {
    const today = new Date().toDateString();
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEYS.POMO_STATS)) || { date: today, count: 0 };
    if (stored.date !== today) {
      this.stats = { date: today, count: 0 };
      localStorage.setItem(STORAGE_KEYS.POMO_STATS, JSON.stringify(this.stats));
    } else {
      this.stats = stored;
    }
  }

  incrementStats() {
    this.stats.count++;
    localStorage.setItem(STORAGE_KEYS.POMO_STATS, JSON.stringify(this.stats));
    this.dom.todayCount.textContent = this.stats.count;
  }

  cacheDom() {
    this.dom = {
      display: document.getElementById('timer-display'),
      subtext: document.getElementById('timer-subtext'),
      statusText: document.getElementById('timer-status-text'),
      progressCircle: document.getElementById('timer-progress'),
      btnToggle: document.getElementById('btn-timer-toggle'),
      btnToggleText: document.getElementById('btn-timer-text'),
      iconPlay: document.querySelector('#btn-timer-toggle .icon-play'),
      iconPause: document.querySelector('#btn-timer-toggle .icon-pause'),
      btnReset: document.getElementById('btn-timer-reset'),
      btnSkip: document.getElementById('btn-timer-skip'),
      modePills: document.querySelectorAll('.mode-pill'),
      todayCount: document.getElementById('today-pomo-count'),
      inputFocus: document.getElementById('custom-focus-min'),
      inputShort: document.getElementById('custom-short-min'),
      inputLong: document.getElementById('custom-long-min'),
      btnApplySettings: document.getElementById('btn-apply-pomo-settings'),
      btnSoundToggle: document.getElementById('btn-sound-toggle'),
      soundIcon: document.getElementById('sound-icon')
    };

    // Calculate circle stroke length for r=130
    this.radius = 130;
    this.circumference = 2 * Math.PI * this.radius;
    this.dom.progressCircle.style.strokeDasharray = `${this.circumference} ${this.circumference}`;
    this.dom.progressCircle.style.strokeDashoffset = '0';
    this.dom.todayCount.textContent = this.stats.count;
  }

  bindEvents() {
    this.dom.btnToggle.addEventListener('click', () => this.toggleTimer());
    this.dom.btnReset.addEventListener('click', () => this.resetTimer());
    this.dom.btnSkip.addEventListener('click', () => this.skipSession());

    this.dom.modePills.forEach(pill => {
      pill.addEventListener('click', () => {
        const mode = pill.getAttribute('data-mode');
        this.switchMode(mode);
      });
    });

    this.dom.btnApplySettings.addEventListener('click', () => {
      const focusVal = parseInt(this.dom.inputFocus.value, 10);
      const shortVal = parseInt(this.dom.inputShort.value, 10);
      const longVal = parseInt(this.dom.inputLong.value, 10);

      if (focusVal >= 1 && shortVal >= 1 && longVal >= 1) {
        this.settings.focus = focusVal;
        this.settings.shortBreak = shortVal;
        this.settings.longBreak = longVal;
        localStorage.setItem(STORAGE_KEYS.POMO_SETTINGS, JSON.stringify(this.settings));
        this.resetTimer();
        showToast('Pomodoro durations updated!', 'success');
      } else {
        showToast('Please enter valid positive numbers for minutes.', 'warning');
      }
    });

    this.dom.btnSoundToggle.addEventListener('click', () => {
      const enabled = sounds.toggle();
      this.dom.soundIcon.textContent = enabled ? '🔊' : '🔇';
      showToast(enabled ? 'Sound enabled' : 'Sound muted', 'info');
      if (enabled) sounds.playClick();
    });
    this.dom.soundIcon.textContent = sounds.enabled ? '🔊' : '🔇';
  }

  renderSettingsInputs() {
    this.dom.inputFocus.value = this.settings.focus;
    this.dom.inputShort.value = this.settings.shortBreak;
    this.dom.inputLong.value = this.settings.longBreak;
  }

  switchMode(mode) {
    if (!this.modes[mode]) return;
    this.pauseTimer();
    this.currentMode = mode;

    this.dom.modePills.forEach(p => {
      p.classList.toggle('active', p.getAttribute('data-mode') === mode);
    });

    this.dom.progressCircle.setAttribute('stroke', this.modes[mode].gradient);
    this.totalTime = this.settings[mode] * 60;
    this.timeLeft = this.totalTime;

    this.updateDisplay();
    sounds.playClick();
  }

  toggleTimer() {
    if (this.isRunning) {
      this.pauseTimer();
    } else {
      this.startTimer();
    }
  }

  startTimer() {
    this.isRunning = true;
    this.dom.iconPlay.classList.add('hidden');
    this.dom.iconPause.classList.remove('hidden');
    this.dom.btnToggleText.textContent = 'Pause';
    this.dom.statusText.textContent = this.currentMode === 'focus' ? 'Deep Focus...' : 'Resting...';

    sounds.initContext();
    sounds.playClick();

    this.timerInterval = setInterval(() => {
      if (this.timeLeft > 0) {
        this.timeLeft--;
        this.updateDisplay();
      } else {
        this.completeSession();
      }
    }, 1000);
  }

  pauseTimer() {
    this.isRunning = false;
    clearInterval(this.timerInterval);
    this.dom.iconPlay.classList.remove('hidden');
    this.dom.iconPause.classList.add('hidden');
    this.dom.btnToggleText.textContent = 'Resume';
    this.dom.statusText.textContent = 'Paused';
  }

  resetTimer() {
    this.pauseTimer();
    this.dom.btnToggleText.textContent = this.currentMode === 'focus' ? 'Start Focus' : 'Start Break';
    this.totalTime = this.settings[this.currentMode] * 60;
    this.timeLeft = this.totalTime;
    this.dom.statusText.textContent = this.currentMode === 'focus' ? 'Ready to Focus' : 'Ready to Rest';
    this.updateDisplay();
  }

  skipSession() {
    this.pauseTimer();
    sounds.playClick();
    this.proceedToNextMode(false);
  }

  completeSession() {
    this.pauseTimer();
    sounds.playChime();

    if (this.currentMode === 'focus') {
      this.incrementStats();
      showToast('🎉 Focus session completed! Great job!', 'success');
      this.proceedToNextMode(true);
    } else {
      showToast('✨ Break is over! Ready for the next focus sprint?', 'info');
      this.switchMode('focus');
    }
  }

  proceedToNextMode(autoSwitch = true) {
    if (this.currentMode === 'focus') {
      if (this.sessionCount % 4 === 0) {
        this.switchMode('longBreak');
      } else {
        this.switchMode('shortBreak');
      }
      this.sessionCount++;
    } else {
      this.switchMode('focus');
    }

    if (autoSwitch) {
      this.dom.btnToggleText.textContent = this.currentMode === 'focus' ? 'Start Focus' : 'Start Break';
    }
  }

  updateDisplay() {
    const mins = Math.floor(this.timeLeft / 60);
    const secs = this.timeLeft % 60;
    const timeFormatted = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    this.dom.display.textContent = timeFormatted;

    // Document Title with countdown
    document.title = `(${timeFormatted}) ${this.modes[this.currentMode].name} • StudyBuddy`;

    // Progress circle stroke offset
    const fraction = this.timeLeft / (this.totalTime || 1);
    const offset = this.circumference * (1 - fraction);
    this.dom.progressCircle.style.strokeDashoffset = offset;

    // Subtext
    this.dom.subtext.textContent = this.currentMode === 'focus'
      ? `Session ${((this.sessionCount - 1) % 4) + 1} of 4`
      : `${this.modes[this.currentMode].name}`;
  }
}

// ========================================================
// 5. FLASHCARDS ENGINE
// ========================================================

class FlashcardEngine {
  constructor() {
    this.decks = JSON.parse(localStorage.getItem(STORAGE_KEYS.DECKS)) || DEFAULT_DECKS;
    const savedDeckId = localStorage.getItem(STORAGE_KEYS.ACTIVE_DECK_ID);
    this.activeDeckId = (this.decks.find(d => d.id === savedDeckId)) ? savedDeckId : (this.decks[0]?.id || null);

    this.currentCardIndex = 0;
    this.isFlipped = false;
    this.editingCardId = null;

    this.cacheDom();
    this.bindEvents();
    this.renderDeckSelect();
    this.renderCard();
  }

  saveDecks() {
    localStorage.setItem(STORAGE_KEYS.DECKS, JSON.stringify(this.decks));
    localStorage.setItem(STORAGE_KEYS.ACTIVE_DECK_ID, this.activeDeckId);
  }

  getActiveDeck() {
    return this.decks.find(d => d.id === this.activeDeckId) || this.decks[0] || null;
  }

  cacheDom() {
    this.dom = {
      deckSelect: document.getElementById('deck-select'),
      btnManageDecks: document.getElementById('btn-manage-decks'),
      btnAddCard: document.getElementById('btn-add-card'),
      btnDeleteDeck: document.getElementById('btn-delete-deck'),
      cardStage: document.getElementById('flashcard-stage'),
      cardElement: document.getElementById('active-flashcard'),
      cardFrontText: document.getElementById('card-front-text'),
      cardBackText: document.getElementById('card-back-text'),
      cardCounter: document.getElementById('card-counter'),
      cardDeckName: document.getElementById('card-deck-name'),
      cardMasteryBadge: document.getElementById('card-mastery-badge'),
      btnPrev: document.getElementById('btn-card-prev'),
      btnNext: document.getElementById('btn-card-next'),
      btnMarkLearning: document.getElementById('btn-mark-learning'),
      btnMarkMastered: document.getElementById('btn-mark-mastered'),
      btnShuffle: document.getElementById('btn-shuffle-deck'),
      btnEditCard: document.getElementById('btn-edit-card'),
      btnDeleteCard: document.getElementById('btn-delete-card'),
      // Modals
      modalCard: document.getElementById('modal-card'),
      modalCardTitle: document.getElementById('modal-card-title'),
      formCard: document.getElementById('form-card'),
      inputCardFront: document.getElementById('input-card-front'),
      inputCardBack: document.getElementById('input-card-back'),
      btnCloseCardModal: document.getElementById('btn-close-card-modal'),
      btnCancelCardModal: document.getElementById('btn-cancel-card-modal'),
      modalDeck: document.getElementById('modal-deck'),
      formDeck: document.getElementById('form-deck'),
      inputDeckName: document.getElementById('input-deck-name'),
      btnCloseDeckModal: document.getElementById('btn-close-deck-modal'),
      btnCancelDeckModal: document.getElementById('btn-cancel-deck-modal')
    };
  }

  bindEvents() {
    // Deck Select Change
    this.dom.deckSelect.addEventListener('change', (e) => {
      this.activeDeckId = e.target.value;
      this.currentCardIndex = 0;
      this.isFlipped = false;
      this.saveDecks();
      this.renderCard();
      sounds.playClick();
      // Also update quiz select options
      if (window.quizArena) window.quizArena.populateDeckDropdown();
    });

    // Card Flip
    this.dom.cardElement.addEventListener('click', () => this.toggleFlip());

    // Card Nav
    this.dom.btnPrev.addEventListener('click', () => this.prevCard());
    this.dom.btnNext.addEventListener('click', () => this.nextCard());

    // Shuffle
    this.dom.btnShuffle.addEventListener('click', () => this.shuffleCards());

    // Mastery Rating
    this.dom.btnMarkLearning.addEventListener('click', () => this.setMastery('learning'));
    this.dom.btnMarkMastered.addEventListener('click', () => this.setMastery('mastered'));

    // Modals
    this.dom.btnManageDecks.addEventListener('click', () => this.openDeckModal());
    this.dom.btnAddCard.addEventListener('click', () => this.openCardModal());
    this.dom.btnEditCard.addEventListener('click', () => this.openEditCardModal());
    this.dom.btnDeleteCard.addEventListener('click', () => this.deleteCurrentCard());
    this.dom.btnDeleteDeck.addEventListener('click', () => this.deleteCurrentDeck());

    // Close Modals
    [this.dom.btnCloseCardModal, this.dom.btnCancelCardModal].forEach(b => b.addEventListener('click', () => this.closeCardModal()));
    [this.dom.btnCloseDeckModal, this.dom.btnCancelDeckModal].forEach(b => b.addEventListener('click', () => this.closeDeckModal()));

    // Form Submissions
    this.dom.formCard.addEventListener('submit', (e) => this.handleCardFormSubmit(e));
    this.dom.formDeck.addEventListener('submit', (e) => this.handleDeckFormSubmit(e));

    // Keyboard navigation (Space for flip, arrows for cards)
    window.addEventListener('keydown', (e) => {
      // Only if flashcard tab is visible and no modal is open
      const flashTab = document.getElementById('section-flashcards');
      const isModalOpen = !this.dom.modalCard.classList.contains('hidden') || !this.dom.modalDeck.classList.contains('hidden');
      if (flashTab && flashTab.classList.contains('active') && !isModalOpen) {
        if (e.code === 'Space' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
          e.preventDefault();
          this.toggleFlip();
        } else if (e.code === 'ArrowRight') {
          this.nextCard();
        } else if (e.code === 'ArrowLeft') {
          this.prevCard();
        }
      }
    });
  }

  renderDeckSelect() {
    this.dom.deckSelect.innerHTML = '';
    this.decks.forEach(deck => {
      const opt = document.createElement('option');
      opt.value = deck.id;
      opt.textContent = `${deck.name} (${deck.cards.length})`;
      if (deck.id === this.activeDeckId) opt.selected = true;
      this.dom.deckSelect.appendChild(opt);
    });
  }

  renderCard() {
    const deck = this.getActiveDeck();
    if (!deck || deck.cards.length === 0) {
      this.dom.cardFrontText.textContent = 'No cards in this deck yet!';
      this.dom.cardBackText.textContent = 'Click "Add Flashcard" above to create your first card.';
      this.dom.cardCounter.textContent = '0 of 0';
      this.dom.cardDeckName.textContent = deck ? deck.name : 'No Deck';
      this.dom.cardMasteryBadge.textContent = 'Empty';
      this.dom.cardMasteryBadge.className = 'card-status-badge';
      this.dom.cardElement.classList.remove('flipped');
      this.isFlipped = false;
      return;
    }

    if (this.currentCardIndex >= deck.cards.length) {
      this.currentCardIndex = 0;
    }

    const card = deck.cards[this.currentCardIndex];
    this.dom.cardElement.classList.remove('flipped');
    this.isFlipped = false;

    // Small delay for flip reset animation before setting text
    setTimeout(() => {
      this.dom.cardFrontText.textContent = card.front;
      this.dom.cardBackText.textContent = card.back;
    }, 150);

    this.dom.cardCounter.textContent = `Card ${this.currentCardIndex + 1} of ${deck.cards.length}`;
    this.dom.cardDeckName.textContent = deck.name;

    // Status badge
    const status = card.status || 'new';
    this.dom.cardMasteryBadge.className = `card-status-badge ${status}`;
    this.dom.cardMasteryBadge.textContent = status === 'mastered' ? 'Mastered' : (status === 'learning' ? 'Learning' : 'New');
  }

  toggleFlip() {
    this.isFlipped = !this.isFlipped;
    this.dom.cardElement.classList.toggle('flipped', this.isFlipped);
    sounds.playClick();
  }

  nextCard() {
    const deck = this.getActiveDeck();
    if (!deck || deck.cards.length <= 1) return;
    this.currentCardIndex = (this.currentCardIndex + 1) % deck.cards.length;
    this.renderCard();
    sounds.playClick();
  }

  prevCard() {
    const deck = this.getActiveDeck();
    if (!deck || deck.cards.length <= 1) return;
    this.currentCardIndex = (this.currentCardIndex - 1 + deck.cards.length) % deck.cards.length;
    this.renderCard();
    sounds.playClick();
  }

  shuffleCards() {
    const deck = this.getActiveDeck();
    if (!deck || deck.cards.length <= 1) return;

    for (let i = deck.cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck.cards[i], deck.cards[j]] = [deck.cards[j], deck.cards[i]];
    }

    this.currentCardIndex = 0;
    this.saveDecks();
    this.renderCard();
    sounds.playClick();
    showToast('Cards shuffled! 🔀', 'info');
  }

  setMastery(status) {
    const deck = this.getActiveDeck();
    if (!deck || deck.cards.length === 0) return;

    const card = deck.cards[this.currentCardIndex];
    card.status = status;
    this.saveDecks();

    if (status === 'mastered') {
      sounds.playSuccess();
      showToast('Marked as Mastered! 🌟', 'success');
    } else {
      sounds.playClick();
      showToast('Marked as Still Learning 🤔', 'info');
    }

    this.renderCard();
  }

  // Card Modal Handlers
  openCardModal() {
    this.editingCardId = null;
    this.dom.modalCardTitle.textContent = 'Add New Flashcard';
    this.dom.inputCardFront.value = '';
    this.dom.inputCardBack.value = '';
    this.dom.modalCard.classList.remove('hidden');
    this.dom.inputCardFront.focus();
  }

  openEditCardModal() {
    const deck = this.getActiveDeck();
    if (!deck || deck.cards.length === 0) {
      showToast('No card to edit!', 'warning');
      return;
    }
    const card = deck.cards[this.currentCardIndex];
    this.editingCardId = card.id;
    this.dom.modalCardTitle.textContent = 'Edit Flashcard';
    this.dom.inputCardFront.value = card.front;
    this.dom.inputCardBack.value = card.back;
    this.dom.modalCard.classList.remove('hidden');
    this.dom.inputCardFront.focus();
  }

  closeCardModal() {
    this.dom.modalCard.classList.add('hidden');
    this.editingCardId = null;
  }

  handleCardFormSubmit(e) {
    e.preventDefault();
    const front = this.dom.inputCardFront.value.trim();
    const back = this.dom.inputCardBack.value.trim();
    if (!front || !back) return;

    const deck = this.getActiveDeck();
    if (!deck) return;

    if (this.editingCardId) {
      const card = deck.cards.find(c => c.id === this.editingCardId);
      if (card) {
        card.front = front;
        card.back = back;
        showToast('Card updated! ✏️', 'success');
      }
    } else {
      deck.cards.push({
        id: 'card-' + Date.now(),
        front,
        back,
        status: 'new'
      });
      this.currentCardIndex = deck.cards.length - 1;
      showToast('New flashcard added! 🎉', 'success');
    }

    this.saveDecks();
    this.renderDeckSelect();
    this.renderCard();
    this.closeCardModal();
    if (window.quizArena) window.quizArena.populateDeckDropdown();
  }

  deleteCurrentCard() {
    const deck = this.getActiveDeck();
    if (!deck || deck.cards.length === 0) return;

    if (confirm('Are you sure you want to delete this flashcard?')) {
      deck.cards.splice(this.currentCardIndex, 1);
      if (this.currentCardIndex >= deck.cards.length) {
        this.currentCardIndex = Math.max(0, deck.cards.length - 1);
      }
      this.saveDecks();
      this.renderDeckSelect();
      this.renderCard();
      showToast('Card deleted.', 'info');
      if (window.quizArena) window.quizArena.populateDeckDropdown();
    }
  }

  // Deck Modal Handlers
  openDeckModal() {
    this.dom.inputDeckName.value = '';
    this.dom.modalDeck.classList.remove('hidden');
    this.dom.inputDeckName.focus();
  }

  closeDeckModal() {
    this.dom.modalDeck.classList.add('hidden');
  }

  handleDeckFormSubmit(e) {
    e.preventDefault();
    const name = this.dom.inputDeckName.value.trim();
    if (!name) return;

    const newDeck = {
      id: 'deck-' + Date.now(),
      name,
      cards: []
    };

    this.decks.push(newDeck);
    this.activeDeckId = newDeck.id;
    this.currentCardIndex = 0;
    this.saveDecks();
    this.renderDeckSelect();
    this.renderCard();
    this.closeDeckModal();
    showToast(`Deck "${name}" created!`, 'success');
    if (window.quizArena) window.quizArena.populateDeckDropdown();
  }

  deleteCurrentDeck() {
    if (this.decks.length <= 1) {
      showToast('You must keep at least one deck!', 'warning');
      return;
    }
    const deck = this.getActiveDeck();
    if (confirm(`Delete the entire "${deck.name}" deck and all its cards?`)) {
      this.decks = this.decks.filter(d => d.id !== deck.id);
      this.activeDeckId = this.decks[0].id;
      this.currentCardIndex = 0;
      this.saveDecks();
      this.renderDeckSelect();
      this.renderCard();
      showToast('Deck deleted.', 'info');
      if (window.quizArena) window.quizArena.populateDeckDropdown();
    }
  }
}

// ========================================================
// 6. QUIZ ARENA (CUSTOMIZABLE QUIZ)
// ========================================================

class QuizArena {
  constructor(flashcardEngine) {
    this.flashcardEngine = flashcardEngine;
    this.customQuestions = JSON.parse(localStorage.getItem(STORAGE_KEYS.CUSTOM_QUIZ_QUESTIONS)) || DEFAULT_CUSTOM_QUIZ;

    this.activeQuestions = [];
    this.currentQIndex = 0;
    this.score = 0;
    this.timerSeconds = 30;
    this.timerLeft = 30;
    this.timerInterval = null;
    this.hasAnswered = false;

    this.cacheDom();
    this.bindEvents();
    this.populateDeckDropdown();
    this.renderCustomQuestionsList();
  }

  saveCustomQuestions() {
    localStorage.setItem(STORAGE_KEYS.CUSTOM_QUIZ_QUESTIONS, JSON.stringify(this.customQuestions));
  }

  cacheDom() {
    this.dom = {
      // Views
      setupView: document.getElementById('quiz-setup-view'),
      playView: document.getElementById('quiz-play-view'),
      resultsView: document.getElementById('quiz-results-view'),
      // Tabs
      tabBtnDeck: document.getElementById('btn-mode-deck-quiz'),
      tabBtnCustom: document.getElementById('btn-mode-custom-quiz'),
      deckPanel: document.getElementById('deck-quiz-options'),
      customPanel: document.getElementById('custom-quiz-options'),
      // Inputs
      quizDeckSelect: document.getElementById('quiz-deck-select'),
      quizQCountSelect: document.getElementById('quiz-question-count'),
      quizTimeLimitSelect: document.getElementById('quiz-time-limit'),
      customTimeLimitSelect: document.getElementById('custom-quiz-time-limit'),
      btnStartDeckQuiz: document.getElementById('btn-start-deck-quiz'),
      btnStartCustomQuiz: document.getElementById('btn-start-custom-quiz'),
      // Custom questions management
      customList: document.getElementById('custom-questions-list'),
      btnAddCustomQ: document.getElementById('btn-add-custom-question'),
      modalCustomQ: document.getElementById('modal-custom-question'),
      formCustomQ: document.getElementById('form-custom-question'),
      inputCustomQText: document.getElementById('input-custom-q-text'),
      inputCustomQExplain: document.getElementById('input-custom-q-explain'),
      btnCloseCustomQ: document.getElementById('btn-close-custom-q-modal'),
      btnCancelCustomQ: document.getElementById('btn-cancel-custom-q-modal'),
      // Play view
      currentNum: document.getElementById('quiz-current-num'),
      totalNum: document.getElementById('quiz-total-num'),
      timerPill: document.getElementById('quiz-timer-pill'),
      timerVal: document.getElementById('quiz-timer-val'),
      currentScore: document.getElementById('quiz-current-score'),
      progressBar: document.getElementById('quiz-progress-bar'),
      questionText: document.getElementById('quiz-question-text'),
      optionsGrid: document.getElementById('quiz-options-grid'),
      feedbackBox: document.getElementById('quiz-feedback-box'),
      feedbackIndicator: document.getElementById('feedback-indicator'),
      feedbackIcon: document.getElementById('feedback-icon'),
      feedbackTitle: document.getElementById('feedback-title'),
      feedbackExplanation: document.getElementById('feedback-explanation'),
      btnNextQuestion: document.getElementById('btn-next-quiz-question'),
      // Result view
      resultBadgeIcon: document.getElementById('result-badge-icon'),
      resultTitle: document.getElementById('result-title'),
      resultSubtext: document.getElementById('result-subtext'),
      resultPct: document.getElementById('result-pct'),
      resultDetail: document.getElementById('result-detail'),
      btnRetry: document.getElementById('btn-quiz-retry'),
      btnBackSetup: document.getElementById('btn-quiz-back-setup')
    };
  }

  bindEvents() {
    // Mode tabs
    this.dom.tabBtnDeck.addEventListener('click', () => {
      this.dom.tabBtnDeck.classList.add('active');
      this.dom.tabBtnCustom.classList.remove('active');
      this.dom.deckPanel.classList.add('active');
      this.dom.customPanel.classList.remove('active');
    });

    this.dom.tabBtnCustom.addEventListener('click', () => {
      this.dom.tabBtnCustom.classList.add('active');
      this.dom.tabBtnDeck.classList.remove('active');
      this.dom.customPanel.classList.add('active');
      this.dom.deckPanel.classList.remove('active');
    });

    // Start quiz buttons
    this.dom.btnStartDeckQuiz.addEventListener('click', () => this.startDeckQuiz());
    this.dom.btnStartCustomQuiz.addEventListener('click', () => this.startCustomQuiz());

    // Gameplay navigation
    this.dom.btnNextQuestion.addEventListener('click', () => this.advanceToNextQuestion());
    this.dom.btnRetry.addEventListener('click', () => this.restartCurrentQuiz());
    this.dom.btnBackSetup.addEventListener('click', () => this.showSetupView());

    // Custom question modal
    this.dom.btnAddCustomQ.addEventListener('click', () => this.openCustomQModal());
    [this.dom.btnCloseCustomQ, this.dom.btnCancelCustomQ].forEach(b => b.addEventListener('click', () => this.closeCustomQModal()));
    this.dom.formCustomQ.addEventListener('submit', (e) => this.handleCustomQSubmit(e));
  }

  populateDeckDropdown() {
    this.dom.quizDeckSelect.innerHTML = '';
    this.flashcardEngine.decks.forEach(deck => {
      const opt = document.createElement('option');
      opt.value = deck.id;
      opt.textContent = `${deck.name} (${deck.cards.length} cards)`;
      if (deck.id === this.flashcardEngine.activeDeckId) opt.selected = true;
      this.dom.quizDeckSelect.appendChild(opt);
    });
  }

  renderCustomQuestionsList() {
    this.dom.customList.innerHTML = '';
    if (this.customQuestions.length === 0) {
      this.dom.customList.innerHTML = '<div style="padding: 1rem; color: var(--text-dim); text-align: center;">No custom questions yet. Click "+ Add New Question" above!</div>';
      return;
    }

    this.customQuestions.forEach((q, idx) => {
      const item = document.createElement('div');
      item.className = 'custom-q-item';
      item.innerHTML = `
        <span style="font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 80%;">
          ${idx + 1}. ${this.escapeHtml(q.question)}
        </span>
        <div class="custom-q-actions">
          <button class="btn btn-ghost btn-sm" data-idx="${idx}" title="Delete question">
            🗑️
          </button>
        </div>
      `;

      item.querySelector('button').addEventListener('click', () => {
        this.customQuestions.splice(idx, 1);
        this.saveCustomQuestions();
        this.renderCustomQuestionsList();
        showToast('Question deleted.', 'info');
      });

      this.dom.customList.appendChild(item);
    });
  }

  openCustomQModal() {
    this.dom.inputCustomQText.value = '';
    this.dom.inputCustomQExplain.value = '';
    for (let i = 0; i < 4; i++) {
      document.getElementById(`input-opt-${i}`).value = '';
    }
    document.getElementById('radio-opt-0').checked = true;
    this.dom.modalCustomQ.classList.remove('hidden');
    this.dom.inputCustomQText.focus();
  }

  closeCustomQModal() {
    this.dom.modalCustomQ.classList.add('hidden');
  }

  handleCustomQSubmit(e) {
    e.preventDefault();
    const qText = this.dom.inputCustomQText.value.trim();
    const explain = this.dom.inputCustomQExplain.value.trim();

    const options = [];
    for (let i = 0; i < 4; i++) {
      const optVal = document.getElementById(`input-opt-${i}`).value.trim();
      if (!optVal) {
        showToast('Please provide all 4 options.', 'warning');
        return;
      }
      options.push(optVal);
    }

    const selectedRadio = document.querySelector('input[name="custom-q-correct"]:checked');
    const correctIndex = parseInt(selectedRadio.value, 10);

    this.customQuestions.push({
      id: 'cq-' + Date.now(),
      question: qText,
      options,
      correctIndex,
      explanation: explain
    });

    this.saveCustomQuestions();
    this.renderCustomQuestionsList();
    this.closeCustomQModal();
    showToast('Custom question added!', 'success');
  }

  // --- Quiz Generation & Launching ---

  startDeckQuiz() {
    const selectedDeckId = this.dom.quizDeckSelect.value;
    const deck = this.flashcardEngine.decks.find(d => d.id === selectedDeckId);

    if (!deck || deck.cards.length < 2) {
      showToast('Need at least 2 cards in this deck to run a quiz!', 'warning');
      return;
    }

    const countChoice = this.dom.quizQCountSelect.value;
    const timeLimit = parseInt(this.dom.quizTimeLimitSelect.value, 10);

    let maxQ = countChoice === 'all' ? deck.cards.length : parseInt(countChoice, 10);
    maxQ = Math.min(maxQ, deck.cards.length);

    // Shuffle cards copy
    const shuffledCards = [...deck.cards].sort(() => 0.5 - Math.random());
    const pickedCards = shuffledCards.slice(0, maxQ);

    // Build multiple choice questions
    this.activeQuestions = pickedCards.map(card => {
      // Pick 3 distractors from deck cards or fallbacks
      const otherCards = deck.cards.filter(c => c.id !== card.id);
      const shuffledOthers = [...otherCards].sort(() => 0.5 - Math.random());
      const distractorAnswers = shuffledOthers.slice(0, 3).map(c => c.back);

      // If deck has fewer than 4 cards, add plausible fallback distractors
      const fallbacks = [
        'None of the above',
        'Refers to hardware architecture',
        'Standard server-side database routine',
        'Alternative configuration parameter'
      ];
      while (distractorAnswers.length < 3) {
        const fb = fallbacks[distractorAnswers.length % fallbacks.length];
        distractorAnswers.push(fb);
      }

      // Combine correct answer and distractors, then shuffle
      const allChoices = [card.back, ...distractorAnswers];
      const shuffledChoices = [...allChoices].sort(() => 0.5 - Math.random());
      const correctIdx = shuffledChoices.indexOf(card.back);

      return {
        question: card.front,
        options: shuffledChoices,
        correctIndex: correctIdx,
        explanation: `Answer: "${card.back}"`
      };
    });

    this.timerSeconds = timeLimit;
    this.launchQuizSession();
  }

  startCustomQuiz() {
    if (this.customQuestions.length === 0) {
      showToast('No custom questions found! Add some first.', 'warning');
      return;
    }

    const timeLimit = parseInt(this.dom.customTimeLimitSelect.value, 10);
    // Shuffle custom questions
    this.activeQuestions = [...this.customQuestions].sort(() => 0.5 - Math.random());
    this.timerSeconds = timeLimit;
    this.launchQuizSession();
  }

  launchQuizSession() {
    this.currentQIndex = 0;
    this.score = 0;
    this.dom.setupView.classList.add('hidden');
    this.dom.resultsView.classList.add('hidden');
    this.dom.playView.classList.remove('hidden');

    this.renderCurrentQuestion();
    sounds.playClick();
  }

  renderCurrentQuestion() {
    this.hasAnswered = false;
    clearInterval(this.timerInterval);

    const q = this.activeQuestions[this.currentQIndex];
    this.dom.currentNum.textContent = this.currentQIndex + 1;
    this.dom.totalNum.textContent = this.activeQuestions.length;
    this.dom.currentScore.textContent = this.score;

    // Progress bar
    const progressPct = ((this.currentQIndex) / this.activeQuestions.length) * 100;
    this.dom.progressBar.style.width = `${progressPct}%`;

    // Question
    this.dom.questionText.textContent = q.question;

    // Options
    this.dom.optionsGrid.innerHTML = '';
    const letters = ['A', 'B', 'C', 'D'];

    q.options.forEach((optText, idx) => {
      const btn = document.createElement('button');
      btn.className = 'quiz-option-btn';
      btn.innerHTML = `
        <span class="option-letter">${letters[idx]}</span>
        <span class="option-text">${this.escapeHtml(optText)}</span>
      `;
      btn.addEventListener('click', () => this.handleOptionSelection(idx));
      this.dom.optionsGrid.appendChild(btn);
    });

    // Hide feedback box
    this.dom.feedbackBox.classList.add('hidden');

    // Timer setup
    if (this.timerSeconds > 0) {
      this.timerLeft = this.timerSeconds;
      this.dom.timerPill.classList.remove('hidden');
      this.dom.timerVal.textContent = this.timerLeft;

      this.timerInterval = setInterval(() => {
        this.timerLeft--;
        this.dom.timerVal.textContent = this.timerLeft;
        if (this.timerLeft <= 0) {
          clearInterval(this.timerInterval);
          this.handleTimeout();
        }
      }, 1000);
    } else {
      this.dom.timerPill.classList.add('hidden');
    }
  }

  handleOptionSelection(selectedIndex) {
    if (this.hasAnswered) return;
    this.hasAnswered = true;
    clearInterval(this.timerInterval);

    const q = this.activeQuestions[this.currentQIndex];
    const isCorrect = (selectedIndex === q.correctIndex);
    const buttons = this.dom.optionsGrid.querySelectorAll('.quiz-option-btn');

    // Disable all option buttons
    buttons.forEach((btn, idx) => {
      btn.disabled = true;
      if (idx === q.correctIndex) {
        btn.classList.add('correct');
      } else if (idx === selectedIndex) {
        btn.classList.add('wrong');
      }
    });

    if (isCorrect) {
      this.score++;
      this.dom.currentScore.textContent = this.score;
      sounds.playSuccess();
      this.showFeedback(true, 'Correct! Excellent work!', q.explanation);
    } else {
      sounds.playWrong();
      this.showFeedback(false, 'Not quite right!', q.explanation);
    }
  }

  handleTimeout() {
    if (this.hasAnswered) return;
    this.hasAnswered = true;

    const q = this.activeQuestions[this.currentQIndex];
    const buttons = this.dom.optionsGrid.querySelectorAll('.quiz-option-btn');

    buttons.forEach((btn, idx) => {
      btn.disabled = true;
      if (idx === q.correctIndex) {
        btn.classList.add('correct');
      }
    });

    sounds.playWrong();
    this.showFeedback(false, 'Time is up! ⏰', q.explanation);
  }

  showFeedback(isCorrect, title, explanation) {
    this.dom.feedbackIndicator.className = `feedback-indicator ${isCorrect ? 'correct' : 'wrong'}`;
    this.dom.feedbackIcon.textContent = isCorrect ? '✓' : '✕';
    this.dom.feedbackTitle.textContent = title;
    this.dom.feedbackExplanation.textContent = explanation || '';

    // Update button text for last question
    if (this.currentQIndex === this.activeQuestions.length - 1) {
      this.dom.btnNextQuestion.textContent = 'View Quiz Summary 📊';
    } else {
      this.dom.btnNextQuestion.textContent = 'Next Question →';
    }

    this.dom.feedbackBox.classList.remove('hidden');
  }

  advanceToNextQuestion() {
    if (this.currentQIndex < this.activeQuestions.length - 1) {
      this.currentQIndex++;
      this.renderCurrentQuestion();
      sounds.playClick();
    } else {
      this.showResults();
    }
  }

  showResults() {
    clearInterval(this.timerInterval);
    this.dom.playView.classList.add('hidden');
    this.dom.resultsView.classList.remove('hidden');

    const total = this.activeQuestions.length;
    const pct = Math.round((this.score / total) * 100);

    this.dom.resultPct.textContent = `${pct}%`;
    this.dom.resultDetail.textContent = `${this.score} of ${total} Correct`;

    if (pct === 100) {
      this.dom.resultBadgeIcon.textContent = '🏆';
      this.dom.resultTitle.textContent = 'Flawless Victory!';
      this.dom.resultSubtext.textContent = 'You answered every single question correctly! Outstanding focus.';
      sounds.playChime();
    } else if (pct >= 70) {
      this.dom.resultBadgeIcon.textContent = '🌟';
      this.dom.resultTitle.textContent = 'Great Job!';
      this.dom.resultSubtext.textContent = 'Solid mastery of the material. Keep up the great streak.';
      sounds.playSuccess();
    } else {
      this.dom.resultBadgeIcon.textContent = '📚';
      this.dom.resultTitle.textContent = 'Good Effort!';
      this.dom.resultSubtext.textContent = 'Flip through your flashcards or review mistakes to nail the next round.';
    }
  }

  restartCurrentQuiz() {
    this.currentQIndex = 0;
    this.score = 0;
    // Re-shuffle current questions
    this.activeQuestions = [...this.activeQuestions].sort(() => 0.5 - Math.random());
    this.dom.resultsView.classList.add('hidden');
    this.dom.playView.classList.remove('hidden');
    this.renderCurrentQuestion();
    sounds.playClick();
  }

  showSetupView() {
    clearInterval(this.timerInterval);
    this.dom.playView.classList.add('hidden');
    this.dom.resultsView.classList.add('hidden');
    this.dom.setupView.classList.remove('hidden');
    this.populateDeckDropdown();
    this.renderCustomQuestionsList();
    sounds.playClick();
  }

  escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>"']/g, function(m) {
      switch (m) {
        case '&': return '&amp;';
        case '<': return '&lt;';
        case '>': return '&gt;';
        case '"': return '&quot;';
        case "'": return '&#039;';
        default: return m;
      }
    });
  }
}

// ========================================================
// 7. TAB NAVIGATION & INITIALIZATION
// ========================================================

document.addEventListener('DOMContentLoaded', () => {
  // Navigation Tabs switching
  const tabs = document.querySelectorAll('.nav-tab');
  const sections = document.querySelectorAll('.tab-pane');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.getAttribute('data-tab');

      tabs.forEach(t => {
        const isCurrent = t === tab;
        t.classList.toggle('active', isCurrent);
        t.setAttribute('aria-selected', isCurrent ? 'true' : 'false');
      });

      sections.forEach(s => {
        s.classList.toggle('active', s.id === `section-${target}`);
      });

      sounds.playClick();
    });
  });

  // Initialize Modules
  const pomodoro = new PomodoroTimer();
  const flashcards = new FlashcardEngine();
  const quizArena = new QuizArena(flashcards);

  // Global references for inter-module integration
  window.studyBuddy = {
    pomodoro,
    flashcards,
    quizArena
  };
  window.quizArena = quizArena;
});
