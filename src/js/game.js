// ---------------------------------------------
// DOM
// ---------------------------------------------
const thinkMessage = document.getElementById('thinkMessage');

// ---------------------------------------------
// 各種変数
// ---------------------------------------------
// 先読み深さ
const SEARCH_DEPTH = 2;
// ハイライトの色指定
const whiteSquareGrey = '#a9a9a9';
const blackSquareGrey = '#696969';

// ---------------------------------------------
// 設定
// ---------------------------------------------
const cfg = {
  draggable: true,
  position: 'start',
  onDrop: onDrop,
  onMouseoutSquare: removeHighlight,
  onMouseoverSquare: onMouseoverSquare,
};

// ---------------------------------------------
// Chess, Boardインスタンス作成
// ---------------------------------------------
const game = new Chess();
const calcGame = new Chess();
const board = new ChessBoard('board', cfg);

// ---------------------------------------------
// 移動可能位置ハイライト処理
// ---------------------------------------------
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

function highlightSquare (square) {
  const $square = $('#board .square-' + square);

  let background = whiteSquareGrey;
  if ($square.hasClass('black-3c85d')) background = blackSquareGrey;

  $square.css('background', background);
}

function removeHighlight () {
  $('#board .square-55d63').css('background', '')
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

  // 思考中メッセージON
  thinkMessage.style.display = 'block';

  setTimeout(async () => {
    await makeCPUmove();
    // 思考中メッセージOFF
    thinkMessage.style.display = 'none';
    board.position(game.fen());
    // ゲームを終了する
    if (game.game_over()) {
      alert('終了');
    }
  }, 200)

};


// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
// CPUプレイヤーの移動処理
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
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
  // 定跡をチェック
  const theoryMove = await checkTheory();
  if (theoryMove) return theoryMove;

  // CPUが動ける場所を変数に代入
  const cpuMoves = game.moves();

  // 配列の中身が0になったらゲームを終了する
  if (cpuMoves.length === 0) return null;

  // 思考時間計算用変数
  const startTime = Date.now();

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
// CPUプレイヤーの定跡チェック処理
// ---------------------------------------------
function checkTheory() {
  const history = game.history();

  if (history.length === 0) return OPENINGS[Math.floor(Math.random() * OPENINGS.length)];
  if (history.length > 25) return null;

  // 初手が一致する定跡を抽出
  const selectedOpenings = OPENINGS.filter((item) => item[0] === history[0]);
  const theoryMoves = [];

  for (const opening of selectedOpenings) {
    let count = 0;
    for (const [index, move] of opening.entries()) {
      if (move === history[index]) count++;
      else if (!history[index]) break;
      else {
        count = 0;
        break;
      }
    }
    if (count > 0 && opening.length > history.length) {
      theoryMoves.push(opening[count]);
    }
  }

  if (!theoryMoves.length) return null;

  const randomNum = Math.floor(Math.random() * theoryMoves.length);
  const theoryMove = theoryMoves[randomNum];

  return theoryMove;
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
    const score = await evaluate(calcGame, turn);
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
    const score = await evaluate(calcGame, turn);
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
    if ((cpuTurnFlg && maxScore > score) || (!cpuTurnFlg && maxScore < score)) {
      maxScore = score;
      nextAlfa = maxScore;
    }
    // CPUの手番の場合：下限値alfaよりも小さい値が出たら探索を終了
    // プレイヤーの手番の場合：下限値alfaよりも大きい値が出たら探索を終了
    if ((cpuTurnFlg && maxScore < alfa) || (!cpuTurnFlg && maxScore > alfa)) break;
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

// 位置による補正(indexはchess.board()に対応)
const POS_RATE = [
  [1, 1, 1,   1,   1,   1,   1, 1],
  [1, 1, 1,   1,   1,   1,   1, 1],
  [1, 1, 1.1, 1.1, 1.1, 1.1, 1, 1],
  [1, 1, 1.1, 1.2, 1.2, 1.1, 1, 1],
  [1, 1, 1.1, 1.2, 1.2, 1.1, 1, 1],
  [1, 1, 1.1, 1.1, 1.1, 1.1, 1, 1],
  [1, 1, 1,   1,   1,   1,   1, 1],
  [1, 1, 1,   1,   1,   1,   1, 1]
];

// チェック状態の補正
const CHECK_RATE = 1.05;

// 評価関数
function evaluate(game, color) {
  const board = game.board();
  let white = 0;
  let black = 0;
  if (game.in_checkmate()) return Infinity;

  for (const [rawIndex, raw] of board.entries()) {
    for (const [squareIndex, square] of raw.entries()) {
      if (!square) continue;
      // square.type='p'~'k'
      let pieceScore = PIECE_SCORE[square.type] * POS_RATE[rawIndex][squareIndex];
      if (square.color === 'w') white += pieceScore;
        else black += pieceScore;
    }
  }

  let score = color === 'w' ? white - black : black - white;

  if (game.in_check()) score * CHECK_RATE;  // 要修正

  return score;
}
