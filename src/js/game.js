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

// 先読み深さ
const SEARCH_DEPTH = 2;

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

// 履歴表示ボタン
$('#histBtn').on('click', () => {
  console.log(game.history());
});

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

  // 思考時間計算用変数
  let startTime = Date.now();

  // 1つずつスコアを算出
  const baseFen = game.fen();
  const turn = game.turn();
  const moves = [];
  let maxScore = null;
  let alfa = -Infinity;
  for (const [index, cpuMove] of cpuMoves.entries()) {

    const score = await getNodeScore(baseFen, cpuMove, turn, SEARCH_DEPTH, alfa);

    // 最大スコアが更新されたらscoresに格納
    if (maxScore === null || maxScore <= score) {
      maxScore = score;
      moves.push({ score: score, index: index });
      // 下限値alfaを更新
      alfa = maxScore;
    }
  }

  // movesの中からmaxScoreと値が一致する要素を抽出
  let maxMoves = moves.filter((move) => move.score === maxScore);
  // maxMovesの中からランダムで1つ選ぶ
  const randomNum = Math.floor(Math.random() * maxMoves.length);
  // 選ばれた要素のindexを取得
  const selectedIndex = maxMoves[randomNum].index;
  // 思考時間を出力
  console.log((Date.now() - startTime) + 'ms');

  return cpuMoves[selectedIndex];

}

// ---------------------------------------------
// 探索処理
// ---------------------------------------------

// SEARCH_DEPTH + 1手先までを探索して最善手候補を配列として返す
async function getNodeScore(fen, move, turn, depth, alfa) {
  // 現在の盤面を計算用のインスタンスにセット
  calcGame.load(fen);
  // 計算用のインスタンスを1手移動
  calcGame.move(move, { promotion: 'q' });
  const cpuTurnFlg = (SEARCH_DEPTH - depth) % 2 === 0; // CPUの手番の場合はtrue

  // 深度が0ならスコアを計算して返す
  if (depth === 0) {
    const score = await evaluate(calcGame.board(), turn);
    return cpuTurnFlg ? score : -score;
  }

  // 深度が1以上なら移動可能な手を取得して各手に対して再帰的に処理する
  const baseFen = calcGame.fen();
  const legalMoves = calcGame.moves();
  const nextTurn = turn === 'w' ? 'b' : 'w';
  let nextAlfa = cpuTurnFlg ? -Infinity : Infinity;
  let maxScore = null;

  // 移動可能な手が存在しない場合はスコアを計算して返す
  if (legalMoves.length === 0) {
    const score = await evaluate(calcGame.board(), turn);
    return cpuTurnFlg ? score : -score;
  }

  for (const legalMove of legalMoves) {
    const score = await getNodeScore(baseFen, legalMove, nextTurn, depth - 1, nextAlfa);

    if (maxScore === null) {
      maxScore = score;
      nextAlfa = maxScore;
      continue;
    }
    // 最大スコアが更新されたらmaxScoreを変更
    if (cpuTurnFlg && maxScore > score) {
      maxScore = score;
      nextAlfa = maxScore;
    }
    if (!cpuTurnFlg && maxScore < score) {
      maxScore = score;
      nextAlfa = maxScore;
    }
    // CPUの手番の場合：下限値alfaよりも小さい値が出たら探索を終了
    if (cpuTurnFlg && maxScore < alfa) break;
    // プレイヤーの手番の場合：下限値alfaよりも大きい値が出たら探索を終了
    if (!cpuTurnFlg && maxScore > alfa) break;
  }
  return maxScore;
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
  'k': 4000,
}

// 位置による補正(indexはchess.board()と対応)
const POS_SCORE = [
  [1, 1, 1,   1,   1,   1,   1, 1],
  [1, 1, 1,   1,   1,   1,   1, 1],
  [1, 1, 1.1, 1.1, 1.1, 1.1, 1, 1],
  [1, 1, 1.1, 1.2, 1.2, 1.1, 1, 1],
  [1, 1, 1.1, 1.2, 1.2, 1.1, 1, 1],
  [1, 1, 1.1, 1.1, 1.1, 1.1, 1, 1],
  [1, 1, 1,   1,   1,   1,   1, 1],
  [1, 1, 1,   1,   1,   1,   1, 1]
]

// 評価関数
function evaluate(board, color) {
  let score = 0;
  for (const [rawIndex, raw] of board.entries()) {
    for (const [squareIndex, square] of raw.entries()) {
      if (!square) continue;
      // square.type='p'~'k'
      let pieceScore = PIECE_SCORE[square.type] * POS_SCORE[rawIndex][squareIndex];
      if (square.color !== color) pieceScore = -pieceScore;
      score += pieceScore;
    }
  }
  return score;
}
