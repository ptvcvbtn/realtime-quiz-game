const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const gameState = require('./server/models/GameState');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(express.static(path.join(__dirname, 'public')));

let timerId = null;

io.on('connection', (socket) => {
  // Người chơi tham gia
  socket.on('player:join', ({ name }) => {
    gameState.addPlayer(socket.id, name);
    socket.emit('player:joined', { 
      socketId: socket.id, 
      status: gameState.players.get(socket.id).status 
    });
    io.emit('host:update-player-count', gameState.players.size);
  });

  // Host bấm bắt đầu câu hỏi tiếp theo
  socket.on('host:start-next-question', () => {
    gameState.currentQuestionIndex++;
    
    if (gameState.currentQuestionIndex >= 8) {
      gameState.gameStatus = 'GAME_OVER';
      const activePlayers = Array.from(gameState.players.values()).filter(p => p.status === 'ACTIVE');
      io.emit('game:over', { winners: activePlayers });
      return;
    }

    gameState.gameStatus = 'QUESTION_ACTIVE';
    gameState.questionStartTime = Date.now();
    const questionData = gameState.getCurrentQuestionData();

    io.emit('server:new-question', questionData);

    // Hẹn giờ 30 giây tự động chốt đáp án
    clearTimeout(timerId);
    timerId = setTimeout(() => {
      gameState.gameStatus = 'QUESTION_CLOSED';
      const result = gameState.processElimination();

      // Gửi kết quả riêng cho từng người chơi
      for (let [id, player] of gameState.players.entries()) {
        io.to(id).emit('server:round-result', {
          status: player.status,
          isCorrect: player.answers[gameState.currentQuestionIndex]?.isCorrect || false
        });
      }

      // Gửi tóm tắt kết quả cho Host
      io.emit('host:round-summary', result);
    }, 30000);
  });

  // Nhận đáp án từ người chơi
  socket.on('player:submit-answer', ({ selectedOption }) => {
    const success = gameState.submitAnswer(socket.id, selectedOption);
    if (success) {
      socket.emit('player:answer-ack', { message: "Đã ghi nhận đáp án!" });
    }
  });

  // Ngắt kết nối
  socket.on('disconnect', () => {
    gameState.removePlayer(socket.id);
    io.emit('host:update-player-count', gameState.players.size);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server đang chạy tại cổng ${PORT}`);
});