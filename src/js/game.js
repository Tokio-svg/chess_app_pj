// ---------------------------------------------
// Chessインスタンス作成
// ---------------------------------------------
const game = new Chess();

// ---------------------------------------------
// CPU思考用Chessインスタンス作成
// ---------------------------------------------
const calcGame = new Chess();

// ---------------------------------------------
// 設定
// ---------------------------------------------
const cfg = {
  draggable: true,
  position: 'start',
  // 駒が移動した後にonDrop関数を実行する
  onDrop: onDrop,
  onSnapEnd: onSnapEnd,
  onMouseoutSquare: removeHighlight,
  onMouseoverSquare: onMouseoverSquare,
};

// ---------------------------------------------
// ChessBoadインスタンス作成
// ---------------------------------------------
const board = new ChessBoard('board', cfg);

// ---------------------------------------------
// 駒が置かれた場合の処理
// ---------------------------------------------
function onDrop(source, target) {
  removeHighlight();

  // 駒の移動パターンをチェックする
  const move = game.move({
    from: source,  // 移動元の位置
    to: target,   // 移動後の位置
    promotion: 'q'
  });

  // 駒の移動に問題があれば元の位置に戻す
  if (move === null) return 'snapback';

  makeCPUmove();

  const playerMove = game.moves();
  // 配列の中身が0になったらゲームを終了する
  if (playerMove.length === 0) {
    alert('終了');
  }

};

// ---------------------------------------------
// 盤面更新処理
// ---------------------------------------------
function onSnapEnd () {
  board.position(game.fen());
}

// ---------------------------------------------
// ボタン操作処理
// ---------------------------------------------

// 盤面リセットボタン
$('#resetBtn').on('click', () => {
  game.reset();
  board.position(game.fen(), false);
});

// 視点変更ボタン
$('#flipBtn').on('click', board.flip);

// ---------------------------------------------
// 移動可能位置ハイライト処理
// ---------------------------------------------
// 変更後の色指定
const whiteSquareGrey = '#a9a9a9';
const blackSquareGrey = '#696969';

// マウスオーバー時
function onMouseoverSquare (square, piece) {
  const moves = game.moves({
    square: square,
    verbose: true,
  })
  if (moves.length === 0) return;
  highlightSquare(square);
  for (let i = 0; i < moves.length; i++) {
    highlightSquare(moves[i].to);
  }
}

// 色変更処理
function highlightSquare (square) {
  const $square = $('#board .square-' + square);

  let background = whiteSquareGrey;
  if ($square.hasClass('black-3c85d')) background = blackSquareGrey;

  $square.css('background', background);
}

// ハイライト解除処理
function removeHighlight () {
  $('#board .square-55d63').css('background', '')
}

// ---------------------------------------------
// CPUプレイヤーの移動処理
// ---------------------------------------------
async function makeCPUmove() {
  const cpuMove = await calcMove();

  if (!cpuMove) return;

  // 選択した場所へ駒を動かす
  game.move(cpuMove, { promotion: 'q' });
}

// ---------------------------------------------
// CPU思考処理
// ---------------------------------------------
async function calcMove() {
  // CPUが動ける場所を変数に代入
  const cpuMoves = game.moves();

  // 配列の中身が0になったらゲームを終了する
  if (cpuMoves.length === 0) return null;

  // 1つずつスコアを算出
  const baseFen = game.fen();
  const color = game.turn();
  const moves = [];
  let maxScore = null;
  for (const [index, cpuMove] of cpuMoves.entries()) {
    // 現在の盤面を計算用のインスタンスにセット
    calcGame.load(baseFen);
    // 計算用のインスタンスを1手移動
    calcGame.move(cpuMove, { promotion: 'q' });
    // 評価関数でスコアを計算
    const score = await evaluate(calcGame.board(), color);

    // 最大スコアが更新されたらscoresに格納
    if (maxScore === null || maxScore <= score) {
      maxScore = score;
      moves.push({ score: score, index: index });
    }
  }
  // movesの中からmaxScoreと値が一致する要素を抽出
  let maxMoves = moves.filter((move) => move.score === maxScore);
  // maxMovesの中からランダムで1つ選ぶ
  const randomNum = Math.floor(Math.random() * maxMoves.length);
  // 選ばれた要素のindexを取得
  const selectedIndex = maxMoves[randomNum].index;
  return cpuMoves[selectedIndex];

}

// ---------------------------------------------
// 盤面評価処理
// ---------------------------------------------

// ピース基本点
const PIECE_SCORE = {
  'p': 1000,
  'n': 3000,
  'b': 3500,
  'r': 5000,
  'q': 9000,
  'k': 1000000000,
}

// 位置による補正(indexはchess.board()と対応)
const POS_SCORE = [
  1, 1, 1,   1,   1,   1,   1, 1,
  1, 1, 1,   1,   1,   1,   1, 1,
  1, 1, 1.5, 1.5, 1.5, 1.5, 1, 1,
  1, 1, 1.5, 2,   2,   1.5, 1, 1,
  1, 1, 1.5, 2,   2,   1.5, 1, 1,
  1, 1, 1.5, 1.5, 1.5, 1.5, 1, 1,
  1, 1, 1,   1,   1,   1,   1, 1,
  1, 1, 1,   1,   1,   1,   1, 1
]

// 評価関数
function evaluate(board, color) {
  let score = 0;
  for (const raw of board) {
    for (const square of raw) {
      if (!square) continue;
      let pieceScore = PIECE_SCORE[square.type];
      if (square.color !== color) pieceScore = -pieceScore;
      score += pieceScore;
    }
  }
  return score;
}
