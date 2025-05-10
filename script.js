$(document).ready(function () {
  // DOM Element selectors - centralized for easier maintenance
  const DOM = {
    gameBoard: document.getElementById("game-board"),
    startGameBtn: document.getElementById("start-game"),
    resetGameBtn: document.getElementById("reset-game"),
    difficultySelect: document.getElementById("difficulty"),
    playerNameInput: document.getElementById("player-name"),
    currentPlayerDisplay: document.getElementById("current-player"),
    statsDisplay: {
      timer: document.getElementById("timer"),
      moves: document.getElementById("moves"),
      score: document.getElementById("score"),
      matches: document.getElementById("matches"),
    },
    modals: {
      gameModal: document.getElementById("game-modal"),
      leaderboardModal: document.getElementById("leaderboard-modal"),
      closeModalBtn: document.querySelector(".close-modal"),
      closeLeaderboardBtn: document.querySelector(".close-leaderboard"),
      playAgainBtn: document.getElementById("play-again"),
      viewLeaderboardBtn: document.getElementById("view-leaderboard"),
      finalStats: {
        time: document.getElementById("final-time"),
        moves: document.getElementById("final-moves"),
        score: document.getElementById("final-score"),
      },
    },
    leaderboard: {
      showBtn: document.getElementById("show-leaderboard"),
      difficultyFilter: document.getElementById("leaderboard-difficulty"),
      tbody: document.getElementById("leaderboard-body"),
      noScoresMsg: document.getElementById("no-scores-message"),
    },
  };

  // Core game state
  const gameState = {
    cards: [],
    flippedCards: [],
    matchedPairs: 0,
    totalPairs: 0,
    moves: 0,
    score: 0,
    timer: 0,
    timerInterval: null,
    isGameStarted: false,
    isGamePaused: false,
    currentDifficulty: "medium",
    currentPlayer: "",
  };

  // Array of image objects used for the cards
  const cardImages = [
    { src: "Images/Mountains.jpg", alt: "Mountains" },
    { src: "Images/beach.jpg", alt: "Beach" },
    { src: "Images/Forest.jpg", alt: "Forest" },
    { src: "Images/Desert.jpg", alt: "Desert" },
    { src: "Images/Waterfalls.jpg", alt: "Waterfall" },
    { src: "Images/City.jpg", alt: "City" },
    { src: "Images/Sunset.jpg", alt: "Sunset" },
    { src: "Images/Lake.jpg", alt: "Lake" },
    { src: "Images/Clouds.jpg", alt: "Clouds" },
    { src: "Images/Ocean.jpg", alt: "Ocean" },
    { src: "Images/River.jpg", alt: "River" },
    { src: "Images/Mountain.jpg", alt: "Mountain" },
  ];

  // ====== Event Handling Functions ======

  /**
   * Sets up all button click and change events for the game
   */
  function setupEventListeners() {
    // Game control buttons
    DOM.startGameBtn.addEventListener("click", startGame);
    DOM.resetGameBtn.addEventListener("click", resetGame);
    DOM.difficultySelect.addEventListener("change", changeDifficulty);

    // Modal controls
    DOM.modals.closeModalBtn.addEventListener("click", closeModal);
    DOM.modals.playAgainBtn.addEventListener("click", function () {
      closeModal();
      resetGame();
      startGame();
    });

    // Leaderboard controls
    DOM.leaderboard.showBtn.addEventListener("click", showLeaderboard);
    DOM.modals.closeLeaderboardBtn.addEventListener(
      "click",
      closeLeaderboardModal
    );
    DOM.modals.viewLeaderboardBtn.addEventListener("click", function () {
      closeModal();
      showLeaderboard();
    });
    DOM.leaderboard.difficultyFilter.addEventListener("change", function () {
      displayLeaderboard(this.value);
    });

    // Player name handling
    DOM.playerNameInput.addEventListener("input", updatePlayerName);

    // Close modals when clicking outside
    window.addEventListener("click", function (event) {
      if (event.target === DOM.modals.gameModal) {
        closeModal();
      }
      if (event.target === DOM.modals.leaderboardModal) {
        closeLeaderboardModal();
      }
    });
  }

  // ====== Game Setup Functions ======

  /**
   * Initializes the game, setting up event listeners and initial state
   */
  function initGame() {
    setupEventListeners();
    loadPlayerName();
    setupGame();
  }

  /**
   * Loads player name from local storage
   */
  function loadPlayerName() {
    gameState.currentPlayer = localStorage.getItem("currentPlayer") || "";
    DOM.playerNameInput.value = gameState.currentPlayer;
    updatePlayerDisplay();
  }

  /**
   * Updates player name based on input field
   */
  function updatePlayerName() {
    gameState.currentPlayer = this.value.trim() || "Anonymous";
    localStorage.setItem("currentPlayer", gameState.currentPlayer);
    updatePlayerDisplay();
  }

  /**
   * Updates the player name display in the UI
   */
  function updatePlayerDisplay() {
    DOM.currentPlayerDisplay.textContent = `Playing as: ${gameState.currentPlayer}`;
  }

  /**
   * Sets up the game board based on current difficulty
   */
  function setupGame() {
    gameState.currentDifficulty = DOM.difficultySelect.value;
    updateGameBoard();
    DOM.resetGameBtn.disabled = true;
  }

  /**
   * Updates the game board based on selected difficulty
   */
  function updateGameBoard() {
    // Clear the game board
    DOM.gameBoard.innerHTML = "";

    // Set grid layout and card count based on difficulty
    let gridColumns, totalCards;
    switch (gameState.currentDifficulty) {
      case "easy":
        gridColumns = "repeat(4, 1fr)";
        totalCards = 12;
        break;
      case "medium":
        gridColumns = "repeat(4, 1fr)";
        totalCards = 16;
        break;
      case "hard":
        gridColumns = "repeat(6, 1fr)";
        totalCards = 24;
        break;
      default:
        gridColumns = "repeat(4, 1fr)";
        totalCards = 16;
    }

    // Apply grid style and prepare game state
    DOM.gameBoard.style.gridTemplateColumns = gridColumns;
    gameState.totalPairs = totalCards / 2;
    prepareCards(totalCards);
  }

  /**
   * Prepares and renders the cards on the game board
   * @param {number} totalCards - The total number of cards to display
   */
  function prepareCards(totalCards) {
    gameState.cards = [];

    // Select and shuffle images for the cards
    const selectedImages = selectRandomImages(gameState.totalPairs);

    // Create pair of cards for each selected image
    for (let i = 0; i < gameState.totalPairs; i++) {
      for (let j = 0; j < 2; j++) {
        gameState.cards.push({
          id: gameState.cards.length,
          imageIndex: i,
          image: selectedImages[i],
        });
      }
    }

    // Shuffle the cards using Fisher-Yates algorithm
    gameState.cards = shuffleCards(gameState.cards);

    // Create and append card elements to the game board
    const fragment = document.createDocumentFragment(); // Use a fragment for better performance

    gameState.cards.forEach((card) => {
      const cardElement = document.createElement("div");
      cardElement.className = "card";
      cardElement.dataset.id = card.id;
      cardElement.dataset.imageIndex = card.imageIndex;

      // Create card structure
      cardElement.innerHTML = `
        <div class="card-front">
          <img src="${card.image.src}" alt="${card.image.alt}" class="card-image">
        </div>
        <div class="card-back"></div>
      `;

      // Add click event to the card
      cardElement.addEventListener("click", handleCardClick);

      fragment.appendChild(cardElement);
    });

    DOM.gameBoard.appendChild(fragment);
  }

  /**
   * Selects random images for the current game
   * @param {number} numberOfPairs - The number of image pairs needed
   * @returns {Array} Array of selected image objects
   */
  function selectRandomImages(numberOfPairs) {
    // Create a new array and shuffle it
    const shuffledImages = [...cardImages].sort(() => Math.random() - 0.5);
    const selectedImages = [];

    // Select images, loop back if we need more than available
    for (let i = 0; i < numberOfPairs; i++) {
      if (i < shuffledImages.length) {
        selectedImages.push(shuffledImages[i]);
      } else {
        selectedImages.push(shuffledImages[i % shuffledImages.length]);
      }
    }

    return selectedImages;
  }

  /**
   * Shuffles an array using Fisher-Yates algorithm
   * @param {Array} cardsArray - The array of cards to shuffle
   * @returns {Array} The shuffled array
   */
  function shuffleCards(cardsArray) {
    // Create a copy to avoid modifying the original array
    const shuffled = [...cardsArray];

    // Start from the last element and work backwards
    for (
      let currentIndex = shuffled.length - 1;
      currentIndex > 0;
      currentIndex--
    ) {
      // Pick a random index from 0 to currentIndex
      const randomIndex = Math.floor(Math.random() * (currentIndex + 1));

      // Swap the elements at currentIndex and randomIndex
      [shuffled[currentIndex], shuffled[randomIndex]] = [
        shuffled[randomIndex],
        shuffled[currentIndex],
      ];
    }

    return shuffled;
  }

  // ====== Game Logic Functions ======

  /**
   * Handles card click events
   */
  function handleCardClick() {
    // Skip if game not started, paused, or card already flipped/matched
    if (
      !gameState.isGameStarted ||
      gameState.isGamePaused ||
      this.classList.contains("flipped") ||
      this.classList.contains("matched")
    ) {
      return;
    }

    // Get card data
    const cardId = parseInt(this.dataset.id);
    const imageIndex = parseInt(this.dataset.imageIndex);

    // Flip the card
    this.classList.add("flipped");

    // Add to flipped cards array
    gameState.flippedCards.push({
      id: cardId,
      imageIndex: imageIndex,
      element: this,
    });

    // Check for a pair if two cards are flipped
    if (gameState.flippedCards.length === 2) {
      gameState.moves++;
      updateStats();
      checkForMatch();
    }
  }

  /**
   * Checks if the two flipped cards match
   */
  function checkForMatch() {
    const card1 = gameState.flippedCards[0];
    const card2 = gameState.flippedCards[1];
    gameState.isGamePaused = true;

    if (card1.imageIndex === card2.imageIndex) {
      // Cards match
      setTimeout(() => {
        card1.element.classList.add("matched");
        card2.element.classList.add("matched");
        gameState.matchedPairs++;

        // Calculate score bonus
        gameState.score += 10;
        if (gameState.moves <= gameState.totalPairs * 2) {
          gameState.score += 5; // Bonus for efficient matching
        }

        updateStats();

        // Check if game is complete
        if (gameState.matchedPairs === gameState.totalPairs) {
          gameComplete();
        }

        gameState.flippedCards = [];
        gameState.isGamePaused = false;
        saveMatchedCard(card1.imageIndex);
      }, 500);
    } else {
      // Cards don't match - flip back
      setTimeout(() => {
        card1.element.classList.remove("flipped");
        card2.element.classList.remove("flipped");
        gameState.flippedCards = [];
        gameState.isGamePaused = false;
      }, 1000);
    }
  }

  /**
   * Saves matched card to local storage (for collection feature)
   * @param {number} imageIndex - The index of the matched image
   */
  function saveMatchedCard(imageIndex) {
    const matchedCards = JSON.parse(
      localStorage.getItem("matchedCards") || "[]"
    );

    // Only save if not already in collection
    if (!matchedCards.some((card) => card.imageIndex === imageIndex)) {
      matchedCards.push({
        imageIndex: imageIndex,
        image: cardImages[imageIndex % cardImages.length],
        discoveredAt: new Date().toISOString(),
        difficulty: gameState.currentDifficulty,
      });
      localStorage.setItem("matchedCards", JSON.stringify(matchedCards));
    }
  }

  /**
   * Starts a new game
   */
  function startGame() {
    if (gameState.isGameStarted) return;

    // Reset game state
    gameState.isGameStarted = true;
    gameState.matchedPairs = 0;
    gameState.moves = 0;
    gameState.score = 0;
    gameState.timer = 0;

    // Update UI
    DOM.resetGameBtn.disabled = false;
    updateStats();
    startTimer();

    // Show all cards briefly, then flip them back
    const allCards = document.querySelectorAll(".card");
    allCards.forEach((card) => card.classList.add("flipped"));

    setTimeout(() => {
      allCards.forEach((card) => card.classList.remove("flipped"));
    }, 5000);

    DOM.startGameBtn.textContent = "Game in Progress";
    DOM.startGameBtn.disabled = true;
  }

  /**
   * Resets the current game
   */
  function resetGame() {
    // Stop timer and reset game state
    clearInterval(gameState.timerInterval);
    gameState.isGameStarted = false;
    gameState.isGamePaused = false;
    gameState.flippedCards = [];
    gameState.matchedPairs = 0;
    gameState.moves = 0;
    gameState.score = 0;
    gameState.timer = 0;

    // Update UI
    updateStats();

    const allCards = document.querySelectorAll(".card");
    allCards.forEach((card) => {
      card.classList.remove("flipped", "matched");
    });

    DOM.startGameBtn.textContent = "Start Game";
    DOM.startGameBtn.disabled = false;
    DOM.resetGameBtn.disabled = true;
  }

  /**
   * Changes the difficulty level of the game
   */
  function changeDifficulty() {
    // Store new difficulty
    gameState.currentDifficulty = this.value;

    // Only update board if game not in progress
    if (!gameState.isGameStarted) {
      updateGameBoard();
    } else {
      alert(
        "Please finish or reset the current game before changing difficulty."
      );
      this.value = gameState.currentDifficulty; // Reset dropdown to current difficulty
    }
  }

  /**
   * Starts the game timer
   */
  function startTimer() {
    clearInterval(gameState.timerInterval);
    gameState.timerInterval = setInterval(() => {
      gameState.timer++;
      updateStats();
    }, 1000);
  }

  /**
   * Updates game statistics display
   */
  function updateStats() {
    // Format time as MM:SS
    const minutes = Math.floor(gameState.timer / 60);
    const seconds = gameState.timer % 60;
    const formattedTime = `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;

    // Update stats display
    DOM.statsDisplay.timer.textContent = formattedTime;
    DOM.statsDisplay.moves.textContent = gameState.moves;
    DOM.statsDisplay.score.textContent = gameState.score;
    DOM.statsDisplay.matches.textContent = `${gameState.matchedPairs}/${gameState.totalPairs}`;
  }

  /**
   * Handles game completion
   */
  function gameComplete() {
    // Stop timer and calculate final score
    clearInterval(gameState.timerInterval);
    const timeBonus = Math.max(0, 300 - gameState.timer) * 2; // Bonus for quick completion
    gameState.score += timeBonus;
    updateStats();

    // Save score and show completion modal
    saveHighScore();

    // Update final stats in modal
    DOM.modals.finalStats.time.textContent = DOM.statsDisplay.timer.textContent;
    DOM.modals.finalStats.moves.textContent = gameState.moves;
    DOM.modals.finalStats.score.textContent = gameState.score;
    DOM.modals.gameModal.style.display = "flex";

    // Reset game state
    gameState.isGameStarted = false;
    DOM.startGameBtn.textContent = "Start New Game";
    DOM.startGameBtn.disabled = false;
  }

  // ====== Leaderboard Functions ======

  /**
   * Saves high score to local storage
   */
  function saveHighScore() {
    const highScores = JSON.parse(localStorage.getItem("highScores") || "[]");

    // Add new score
    highScores.push({
      player: gameState.currentPlayer,
      difficulty: gameState.currentDifficulty,
      score: gameState.score,
      moves: gameState.moves,
      time: gameState.timer,
      date: new Date().toLocaleDateString(),
    });

    // Sort by score (highest first) and keep top 5
    highScores.sort((a, b) => b.score - a.score);
    const topScores = highScores.slice(0, 5);

    // Save to localStorage
    localStorage.setItem("highScores", JSON.stringify(topScores));
  }

  /**
   * Shows the leaderboard modal
   */
  function showLeaderboard() {
    displayLeaderboard("all");
    DOM.modals.leaderboardModal.style.display = "flex";
  }

  /**
   * Displays leaderboard based on difficulty filter
   * @param {string} filter - The difficulty filter to apply ("all", "easy", "medium", or "hard")
   */
  function displayLeaderboard(filter) {
    const highScores = JSON.parse(localStorage.getItem("highScores") || "[]");
    DOM.leaderboard.tbody.innerHTML = "";

    // Filter scores by difficulty (if not "all")
    let filteredScores =
      filter === "all"
        ? highScores
        : highScores.filter((score) => score.difficulty === filter);

    // Sort by score (highest first)
    filteredScores.sort((a, b) => b.score - a.score);

    // Show message if no scores
    if (filteredScores.length === 0) {
      DOM.leaderboard.noScoresMsg.style.display = "block";
      return;
    }

    DOM.leaderboard.noScoresMsg.style.display = "none";

    // Document fragment to optimize the leaderboard rows
    const fragment = document.createDocumentFragment();

    // Create table rows for each score
    filteredScores.forEach((entry, index) => {
      // Format time as MM:SS
      const minutes = Math.floor(entry.time / 60);
      const seconds = entry.time % 60;
      const formattedTime = `${minutes.toString().padStart(2, "0")}:${seconds
        .toString()
        .padStart(2, "0")}`;

      // Create table row
      const row = document.createElement("tr");

      // Add special class for top 3 ranks
      const rankClass =
        index === 0
          ? "rank-1"
          : index === 1
          ? "rank-2"
          : index === 2
          ? "rank-3"
          : "";

      // Add table cells
      row.innerHTML = `
        <td class="${rankClass}">${index + 1}</td>
        <td>${entry.player || "Anonymous"}</td>
        <td>${entry.score}</td>
        <td>${entry.difficulty}</td>
        <td>${entry.moves}</td>
        <td>${formattedTime}</td>
        <td>${entry.date}</td>
      `;

      fragment.appendChild(row);
    });

    DOM.leaderboard.tbody.appendChild(fragment);
  }

  /**
   * Closes the game completion modal
   */
  function closeModal() {
    DOM.modals.gameModal.style.display = "none";
  }

  /**
   * Closes the leaderboard modal
   */
  function closeLeaderboardModal() {
    DOM.modals.leaderboardModal.style.display = "none";
  }

  // Initialize the game when document is ready
  initGame();
});
