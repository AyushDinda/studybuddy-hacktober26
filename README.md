# Hacktoberfest Weekend Challenge: Build for a Friend

*This is a submission for the [Hacktoberfest Weekend Challenge: Build for a Friend](https://dev.to/challenges/hacktoberfest-weekend-2026-10-01)*

## What I Built

### StudyBuddy — Pomodoro, Flashcards & Quiz Arena

I built **StudyBuddy**, an all-in-one study companion designed to make studying more focused, organized, and interactive.

The idea behind StudyBuddy is simple: students often switch between different apps for focus sessions, revision, and self-testing. StudyBuddy brings these essential study tools together in one lightweight browser application.

### What it does

- **Pomodoro Timer**
  - Focus, short-break, and long-break modes
  - Customizable session durations
  - Start, pause, reset, and skip controls
  - Visual progress indicator
  - Daily focus-session tracking
  - Optional sound notifications

- **Interactive Flashcards**
  - Create custom decks
  - Add, edit, and delete flashcards
  - 3D card-flip interaction
  - Previous/next navigation
  - Shuffle cards
  - Mark cards as "Still Learning" or "Got It"
  - Track mastery of cards

- **Quiz Arena**
  - Generate quizzes from flashcard decks
  - Create custom multiple-choice questions
  - Choose the number of questions
  - Optional per-question timer
  - Randomized questions and answer choices
  - Instant feedback and explanations
  - Score and percentage results
  - Retry quizzes

The application stores study data directly in the browser using **LocalStorage**, so there is no account or backend required for the current version.

### Who I Built It For

I built StudyBuddy for **students and friends who want a simple way to stay consistent with studying** without having to manage several separate tools.

The goal was to make revision feel less like a collection of disconnected tasks and more like one simple study workflow:

**Focus → Revise → Test → Improve**

---

## Demo

### Live Demo

> Add your deployed StudyBuddy URL here after deployment.

`https://github.com/AyushDinda/studybuddy-hacktober26`

### Video Demo

> Add a short demo video here if available.

---

## Code

The complete source code is available on GitHub:

**Repository:**  
https://github.com/AyushDinda/studybuddy-hacktober26

The project is a client-side web application built with HTML, CSS, and JavaScript.

---

## How I Built It

StudyBuddy was developed with the help of **Antigravity and Gemini Flash 8**, which I used as an AI-powered development and problem-solving companion during the project.

### Technology Stack

- **HTML5** — application structure and semantic UI
- **CSS3** — responsive design, animations, styling, and 3D flashcard effects
- **JavaScript** — application logic and interactive functionality
- **LocalStorage API** — persistent browser-side study data
- **Web Audio API** — Pomodoro sounds and interaction feedback
- **Antigravity + Gemini Flash 8** — AI-assisted development, debugging, implementation guidance, and feature refinement

### Main Application Components

#### Pomodoro Timer

The Pomodoro system manages focus sessions and breaks through a dedicated timer implementation.

It supports:

- Focus sessions
- Short breaks
- Long breaks
- Custom durations
- Automatic session transitions
- Daily focus statistics
- Browser title countdown
- Sound notifications

#### Flashcard Engine

The flashcard system manages decks and cards entirely in the browser.

Users can create decks, add cards, edit cards, delete cards, shuffle cards, flip cards, and track whether they have mastered individual cards.

#### Quiz Arena

The quiz system can generate questions from an existing flashcard deck or allow users to build their own question bank.

When a quiz is generated from a flashcard deck, the application uses the stored flashcard content to construct multiple-choice questions and answer choices.

It also supports:

- Question randomization
- Answer randomization
- Question timers
- Instant feedback
- Explanations
- Score calculation
- Quiz results
- Retry functionality

#### Local Persistence

Study data is saved using browser LocalStorage, including:

- Pomodoro settings
- Focus statistics
- Flashcard decks
- Active deck
- Custom quiz questions
- Sound preferences

This allows the user to close or refresh the browser without immediately losing their study data.

---

## AI-Assisted Development

A major part of the development workflow was using **Antigravity with Gemini Flash 8** as an AI development companion.

Gemini Flash 8 helped with:

- Breaking the project into manageable features
- Reasoning about JavaScript implementation
- Debugging and troubleshooting
- Refining UI interactions
- Improving application logic
- Iterating on features
- Reviewing implementation approaches
- Helping turn the initial idea into a working browser application

The AI was used as a development collaborator rather than as a replacement for the application's own functionality.

The final StudyBuddy application is intentionally lightweight and client-side. It does **not** require a cloud AI API for its core Pomodoro, flashcard, or quiz functionality.

---

## Why Does Open Innovation Matter?

Open innovation makes it easier for individual developers and small teams to turn ideas into working software.

For a project like StudyBuddy, AI-assisted development helped reduce the time required to move from an idea to a functional prototype. Instead of spending all of the development time searching through documentation or getting stuck on individual implementation problems, I could use an AI development companion to explore approaches, debug issues, and iterate quickly.

The combination of open web technologies and AI-assisted development also keeps the project accessible.

StudyBuddy does not depend on a complex backend infrastructure. Anyone can inspect the source code, understand how the application works, modify it, and build their own version.

That is the part of open innovation that I value most:

> **Ideas become easier to experiment with, improve, share, and build upon.**

---

## My Agent Session

> Optional: Add your saved Antigravity/DevRelay agent session here if available.

Example:

`[View my agent session](YOUR_AGENT_SESSION_URL)`

---

## Prize Categories

### Build for a Friend

StudyBuddy is being submitted for the **Build for a Friend** category.

The project was created around a practical student problem: staying focused while studying, organizing revision material, and testing knowledge without constantly switching between different tools.

---

## Project Highlights

- Lightweight client-side application
- No login required
- No backend required
- Persistent browser storage
- Responsive interface
- Interactive 3D flashcards
- Custom flashcard decks
- Flashcard-based quiz generation
- Timed quizzes
- Instant quiz feedback
- Pomodoro productivity tracking
- Web Audio feedback
- AI-assisted development with Antigravity + Gemini Flash 8

---

## Built With

**HTML5 • CSS3 • JavaScript • LocalStorage API • Web Audio API • Antigravity • Gemini Flash 8**

---

Thanks for checking out **StudyBuddy**! 🚀
