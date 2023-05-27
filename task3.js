const crypto = require('crypto');

class RPSGame {
  constructor(moves) {
    this.moves = moves;
    this.numMoves = moves.length;
    this.halfMoves = Math.floor(this.numMoves / 2);
    this.key = this.generateRandomKey();
  }

  generateRandomKey() {
    return crypto.randomBytes(32).toString('hex');
  }

  calculateHMAC(move) {
    const hmac = crypto.createHmac('sha256', this.key);
    hmac.update(move);
    return hmac.digest('hex');
  }

  playGame(playerMove) {
    if (playerMove === '0') {
      return;
    }

    if (playerMove === '?') {
      this.printHelpTable();
      return;
    }

    const moveIndex = parseInt(playerMove, 10) - 1;
    if (isNaN(moveIndex) || moveIndex < 0 || moveIndex >= this.numMoves) {
      console.error('Error: Invalid move. Please enter a valid move number.');
      return;
    }

    const playerMoveText = this.moves[moveIndex];
    const computerMoveIndex = Math.floor(Math.random() * this.numMoves);
    const computerMoveText = this.moves[computerMoveIndex];

    console.log(`Your move: ${playerMoveText}`);
    console.log(`Computer move: ${computerMoveText}`);

    const result = this.calculateResult(moveIndex, computerMoveIndex);
    console.log(result);

    console.log(`HMAC key: ${this.key}`);
  }

  calculateResult(playerMoveIndex, computerMoveIndex) {
    if (playerMoveIndex === computerMoveIndex) {
      return 'It\'s a draw!';
    }

    const halfMovesIndexes = [];
    for (let i = 1; i <= this.halfMoves; i++) {
      halfMovesIndexes.push((playerMoveIndex + i) % this.numMoves);
    }

    if (halfMovesIndexes.includes(computerMoveIndex)) {
      return 'You win!';
    } else {
      return 'You lose!';
    }
  }

  printHelpTable() {
    const table = [];
    for (let i = 0; i < this.numMoves; i++) {
      const row = [];
      for (let j = 0; j < this.numMoves; j++) {
        if (i === j) {
          row.push('Draw');
        } else if ((i + 1) % this.numMoves === j || (i + this.halfMoves) % this.numMoves === j) {
          row.push('Win');
        } else {
          row.push('Lose');
        }
      }
      table.push(row);
    }

    console.log('\nRules:');
    console.log(''.padStart(8) + this.moves.join(' '.padStart(5)));
    for (let i = 0; i < this.numMoves; i++) {
      console.log(this.moves[i].padStart(8) + table[i].join(' '.padStart(5)));
    }
  }
}

const moves = process.argv.slice(2);
if (moves.length < 3 || moves.length % 2 !== 1) {
  console.error('Error: Incorrect number of arguments. Please provide an odd number >= 3 of non-repeating strings.');
  console.error('Example: node game.js rock paper scissors');
  process.exit(1);
}

const game = new RPSGame(moves);
console.log(`HMAC: ${game.key}`);
console.log('Available moves:');
moves.forEach((move, index) => {
  console.log(`${index + 1} - ${move}`);
});
console.log('0 - exit');
console.log('? - help');

const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('Enter your move: ', (playerMove) => {
  game.playGame(playerMove);
  rl.close();
});
