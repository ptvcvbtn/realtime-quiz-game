const questions = require('../config/questions.json');

class GameState {
  constructor() {
    this.players = new Map(); // key: socket.id, value: { name, status, answers }
    this.currentQuestionIndex = -1;
    this.gameStatus = 'WAITING'; // WAITING, QUESTION_ACTIVE, QUESTION_CLOSED, GAME_OVER
    this.questionStartTime = null;
    
    // Giới hạn số người sống sót qua 8 câu hỏi
    this.maxSurvivorsQuota = [50, 40, 30, 20, 10, 6, 3, 1];
  }

  addPlayer(socketId, name) {
    this.players.set(socketId, {
      id: socketId,
      name: name,
      status: 'ACTIVE',
      answers: {}
    });
  }

  removePlayer(socketId) {
    this.players.delete(socketId);
  }

  getCurrentQuestionData() {
    if (this.currentQuestionIndex < 0 || this.currentQuestionIndex >= questions.length) {
      return null;
    }
    const q = questions[this.currentQuestionIndex];
    return {
      index: this.currentQuestionIndex,
      totalQuestions: questions.length,
      question: q.question,
      options: q.options,
      duration: 30
    };
  }

  submitAnswer(socketId, selectedOption) {
    const player = this.players.get(socketId);
    if (!player || player.status !== 'ACTIVE' || this.gameStatus !== 'QUESTION_ACTIVE') {
      return false;
    }

    const now = Date.now();
    const responseTime = now - this.questionStartTime; // Tính theo mili-giây

    if (responseTime > 31000) return false;

    const currentQuestion = questions[this.currentQuestionIndex];
    const isCorrect = (selectedOption === currentQuestion.correct);

    player.answers[this.currentQuestionIndex] = {
      selectedOption,
      responseTime,
      isCorrect
    };

    return true;
  }

  processElimination() {
    const qIndex = this.currentQuestionIndex;
    const maxQuota = this.maxSurvivorsQuota[qIndex];

    const activePlayers = [];
    for (let [id, player] of this.players.entries()) {
      if (player.status === 'ACTIVE') {
        activePlayers.push(player);
      }
    }

    // Lọc người trả lời đúng
    const correctPlayers = activePlayers.filter(p => {
      const ans = p.answers[qIndex];
      return ans && ans.isCorrect === true;
    });

    // Sắp xếp theo thời gian phản hồi nhanh nhất (tăng dần mili-giây)
    correctPlayers.sort((a, b) => a.answers[qIndex].responseTime - b.answers[qIndex].responseTime);

    const survivors = correctPlayers.slice(0, maxQuota);
    const survivorIds = new Set(survivors.map(p => p.id));

    activePlayers.forEach(p => {
      if (!survivorIds.has(p.id)) {
        p.status = 'SPECTATOR';
      }
    });

    return {
      survivorsCount: survivors.length,
      eliminatedCount: activePlayers.length - survivors.length,
      maxQuota: maxQuota,
      survivorsList: survivors.map(p => ({
        name: p.name,
        time: (p.answers[qIndex].responseTime / 1000).toFixed(2)
      }))
    };
  }
}

module.exports = new GameState();