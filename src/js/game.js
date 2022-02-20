// ---------------------------------------------
// DOM
// ---------------------------------------------
const thinkMessage = document.getElementById('thinkMessage');
const whiteScore = document.getElementById('whiteScore');
const progressStatus = document.getElementById('progress');
const cpuMoved = document.getElementById('cpuMoved');

// ---------------------------------------------
// 各種変数
// ---------------------------------------------
// 先読み深さ
let SEARCH_DEPTH = 3;
// ハイライトの色指定
const whiteSquareGrey = '#a9a9a9';
const blackSquareGrey = '#696969';
// プレイヤーの色
const player = 'w';
// ゲーム進行度
let progress = 14;
// 良さそうな手を格納する配列
const wellMoves = ['c3', 'c4', 'c5', 'c6', 'd3', 'd4', 'd5', 'd6', 'e3', 'e4', 'e5', 'e6',  'f3', 'f4', 'f5', 'f6',
'Nc3', 'Nf3', 'Nc6', 'Nf3', 'Bc2', 'Bc7', 'Bg2', 'Bg7', 'O-O', 'O-O-O'];

// ---------------------------------------------
// 設定
// ---------------------------------------------
const cfg = {
  draggable: true,
  position: 'start',
  onDragStart: onDragStart,
  onDrop: onDrop,
  onMouseoutSquare: removeHighlight,
  onMouseoverSquare: onMouseoverSquare,
  // onMoveEnd: onMoveEnd,
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

// chess.board()表示ボタン
$('#boardBtn').on('click', () => {
  console.log(game.board());
});

// ---------------------------------------------
// 駒を掴んだ時の処理
// ---------------------------------------------
function onDragStart(source, piece, position, orientation) {
  if ((player === 'w' && game.turn() === 'w' && piece.search(/^w/) === -1) ||
      (player === 'b' && game.turn() === 'b' && piece.search(/^b/) === -1)) {
    return false
  }
}

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
    setStatus();
    // ゲームを終了する
    if (game.game_over()) {
      alert('終了');
    }
  }, 200)

};

// ---------------------------------------------
// 現在のステータス表示処理
// ---------------------------------------------
function setStatus() {
  const score = evaluate(game, 'w');
  whiteScore.textContent = score;
  progressStatus.textContent = progress;
}

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
  if (theoryMove) {
    cpuMoved.textContent = theoryMove;
    return theoryMove;
  }

  // CPUが動ける場所を変数に代入
  const cpuMoves = game.moves();

  // 配列の中身が0になったらゲームを終了する
  if (cpuMoves.length === 0) return null;

  // 良さそうな手に並び替え
  const sortedMoves = await sortMoves(cpuMoves);

  await adjustEvaluation(game);

  // 思考時間計算用変数
  const startTime = Date.now();

  // 1つずつスコアを算出
  const baseFen = game.fen();
  const turn = game.turn();
  const moves = [];
  let maxScore = null;
  let alfa = null;
  for (const [index, cpuMove] of sortedMoves.entries()) {

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
  console.log('予想スコア:'+maxScore);
  cpuMoved.textContent = sortedMoves[selectedIndex];

  return sortedMoves[selectedIndex];

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
// 局面のスコア探索処理
// ---------------------------------------------

// SEARCH_DEPTH + 1手先までを探索して最善手候補を配列として返す
async function getNodeScore(fen, move, turn, depth, alfa, limitDepth=SEARCH_DEPTH) {
  // 現在の盤面を計算用のインスタンスにセット
  calcGame.load(fen);
  // 計算用のインスタンスを1手移動
  calcGame.move(move, { promotion: 'q' });
  const cpuTurnFlg = (limitDepth - depth) % 2 === 0; // CPUの手番の場合はtrue

  // 深度が0ならスコアを計算して返す
  if (depth === 0) {
    const score = await evaluate(calcGame, turn);
    return cpuTurnFlg ? score : -score;
  }

  // 深度が1以上なら移動可能な手を取得して各手に対して再帰的に処理する
  const baseFen = calcGame.fen();
  const legalMoves = calcGame.moves();
  // 良さそうな手に並び替え
  const sortedMoves = await sortMoves(legalMoves);
  const nextTurn = turn === 'w' ? 'b' : 'w';
  let nextAlfa = null;
  let maxScore = null;

  // 移動可能な手が存在しない場合はスコアを計算して返す
  if (legalMoves.length === 0) {
    const score = await evaluate(calcGame, turn);
    return cpuTurnFlg ? score : -score;
  }

  for (const legalMove of sortedMoves) {
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
      // 優先度の高い手リストに追加
      if (!cpuTurnFlg && !wellMoves.includes(legalMove)) wellMoves.push(legalMove);
    }
    // CPUの手番の場合：下限値alfaよりも小さい値が出たら探索を終了
    // プレイヤーの手番の場合：上限値alfaよりも大きい値が出たら探索を終了
    if (alfa !== null && ((cpuTurnFlg && score < alfa) || (!cpuTurnFlg && score > alfa))) {
      maxScore = score;
      break;
    }
  }
  return maxScore;
}

// ---------------------------------------------
// 候補手ソート
// ---------------------------------------------
function sortMoves(moves) {
  if (!wellMoves.length) return moves;
  const isGood = moves.filter((item) => wellMoves.includes(item));
  const isNotGood = moves.filter((item) => !wellMoves.includes(item));
  return isGood.concat(isNotGood);
}
