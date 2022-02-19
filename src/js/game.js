// ---------------------------------------------
// DOM
// ---------------------------------------------
const thinkMessage = document.getElementById('thinkMessage');

// ---------------------------------------------
// 各種変数
// ---------------------------------------------
// 先読み深さ
let SEARCH_DEPTH = 2;
// 良さそうな手を格納する配列
const wellMoves = [];
// ハイライトの色指定
const whiteSquareGrey = '#a9a9a9';
const blackSquareGrey = '#696969';
// プレイヤーの色
const player = 'w';
// ゲーム進行度
let progress = 14;

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
  let alfa = -Infinity;
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
  console.log(sortedMoves[selectedIndex]);

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
  // 良さそうな手に並び替え
  const sortedMoves = await sortMoves(legalMoves);
  const nextTurn = turn === 'w' ? 'b' : 'w';
  let nextAlfa = cpuTurnFlg ? -Infinity : Infinity;
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
      if (!wellMoves.includes(legalMove)) wellMoves.push(legalMove);
    }
    // CPUの手番の場合：下限値alfaよりも小さい値が出たら探索を終了
    // プレイヤーの手番の場合：下限値alfaよりも大きい値が出たら探索を終了
    if ((cpuTurnFlg && maxScore < alfa) || (!cpuTurnFlg && maxScore > alfa)) break;
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

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
// 盤面評価処理
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

// ---------------------------------------------
// 評価関数
// ---------------------------------------------
function evaluate(game, color) {
  const board = game.board();
  let white = 0;
  let black = 0;
  if (game.in_checkmate()) return Infinity;

  // ピーススコア
  for (const [rawIndex, raw] of board.entries()) {
    for (const [squareIndex, square] of raw.entries()) {
      if (!square) continue;
      // square.type='p'~'k'
      const middleScore = PIECE_SCORE[square['type']]['mid']
        + POS_RATE[square['type']]['mid'][square['color']][rawIndex][squareIndex];

      const endScore = PIECE_SCORE[square['type']]['end']
        + POS_RATE[square['type']]['end'][square['color']][rawIndex][squareIndex];

      const pieceScore = (middleScore * (1 - progress)) + (endScore * progress);
      if (square['color'] === 'w') white += pieceScore;
        else black += pieceScore;
    }
  }


  const score = color === 'w' ? white - black : black - white;

  return score;
}

// ---------------------------------------------
// 評価値調整処理
// ---------------------------------------------
function adjustEvaluation(game) {
  // 良さそうな手リストの古い要素を削除
  if (wellMoves.length > 100) {
    wellMoves.splice(0, wellMoves.length - 100);
  }
  // 候補手が20以下の場合は読みを4手先に変更
  // const numOfMove = game.moves().length;
  // if (numOfMove <= 20) SEARCH_DEPTH = 3;
  //   else SEARCH_DEPTH = 2;
  // ポーン以外のピースの数から進捗度を計算
  const gameBoard = game.board();
  const count = gameBoard.filter((item) => {
    if (!item) return false;
    if (item.type === 'p' || item.type === 'k') return false;
    return true;
  });
  progress = (14 - count.length) / 14;
}

// ピース基本点
const PIECE_SCORE = {
  'p': {
    'mid': 142,
    'end': 207
  },
  'n': {
    'mid': 784,
    'end': 868
  },
  'b': {
    'mid': 828,
    'end': 916
  },
  'r': {
    'mid': 1286,
    'end': 1378
  },
  'q': {
    'mid': 2528,
    'end': 2698
  },
  'k': {
    'mid': 0,
    'end': 0
  },
}

// 位置による補正(indexはchess.board()に対応)
const POS_RATE = {
  'p': {
    'mid': {
      'w': [
        [0, 0, 0, 0, 0, 0, 0, 0],
        [-4, 20, -8, -4, -4, -8, 20, -4],
        [-6, -8, -6, -2, -2, -6, -8, -6],
        [-6, 5, 3, 21, 21, 3, 5, -6],
        [-17, -9, 20, 35, 35, 20, -9, -17],
        [-18, -2, 19, 24, 24, 19, -2, -18],
        [-11, 6, 7, 3, 3, 7, 6, -11],
        [0, 0, 0, 0, 0, 0, 0, 0],
      ],
      'b': [
        [0, 0, 0, 0, 0, 0, 0, 0],
        [-11, 6, 7, 3, 3, 7, 6, -11],
        [-18, -2, 19, 24, 24, 19, -2, -18],
        [-17, -9, 20, 35, 35, 20, -9, -17],
        [-6, 5, 3, 21, 21, 3, 5, -6],
        [-6, -8, -6, -2, -2, -6, -8, -6],
        [-4, 20, -8, -4, -4, -8, 20, -4],
        [0, 0, 0, 0, 0, 0, 0, 0],
      ]
    },
    'end': {
      'w': [
        [0, 0, 0, 0, 0, 0, 0, 0],
        [3, -9, 1, 18, 18, 1, -9, 3],
        [8, -5, 2, 4, 4, 2, -5, 8],
        [8, 9, 7, -6, -6, 7, 9, 8],
        [3, 3, -8, -3, -3, -8, 3, 3],
        [-4, -5, 5, 4, 4, 5, -5, -4],
        [7, -4, 8, -2, -2, 8, -4, 7],
        [0, 0, 0, 0, 0, 0, 0, 0],
      ],
      'b': [
        [0, 0, 0, 0, 0, 0, 0, 0],
        [7, -4, 8, -2, -2, 8, -4, 7],
        [-4, -5, 5, 4, 4, 5, -5, -4],
        [3, 3, -8, -3, -3, -8, 3, 3],
        [8, 9, 7, -6, -6, 7, 9, 8],
        [8, -5, 2, 4, 4, 2, -5, 8],
        [3, -9, 1, 18, 18, 1, -9, 3],
        [0, 0, 0, 0, 0, 0, 0, 0],
      ]
    }
  },

  'n': {
    'mid': {
      'w': [
        [-195, -67, -42, -29, -29, -42, -67, -195],
        [-63, -19, 5, 14, 14, 5, -19, -63],
        [-11, 37, 56, 65, 65, 56, 37, -11],
        [-26, 16, 38, 50, 50, 38, 16, -26],
        [-25, 18, 43, 47, 47, 43, 18, -25],
        [-71, -22, 0, 9, 9, 0, -22, -71],
        [-83, -43, -21, -10, -10, -21, -43, -83],
        [-161, -96, -80, -73, -73, -80, -96, -161],
      ],
      'b': [
        [-161, -96, -80, -73, -73, -80, -96, -161],
        [-83, -43, -21, -10, -10, -21, -43, -83],
        [-71, -22, 0, 9, 9, 0, -22, -71],
        [-25, 18, 43, 47, 47, 43, 18, -25],
        [-26, 16, 38, 50, 50, 38, 16, -26],
        [-11, 37, 56, 65, 65, 56, 37, -11],
        [-63, -19, 5, 14, 14, 5, -19, -63],
        [-195, -67, -42, -29, -29, -42, -67, -195],
      ]
    },
    'end': {
      'w': [
        [-109, -89, -50, -13, -13, -50, -89, -109],
        [-65, -50, -24, 13, 13, -24, -50, -65],
        [-54, -38, -7, 27, 27, -7, -38, -54],
        [-46, -25, 3, 40, 40, 3, -25, -46],
        [-41, -25, 6, 38, 38, 6, -25, -41],
        [-50, -39, -7, 28, 28, -7, -39, -50],
        [-69, -54, -17, 9, 9, -17, -54, -69],
        [-105, -82, -46, -14, -14, -46, -82, -105],
      ],
      'b': [
        [-105, -82, -46, -14, -14, -46, -82, -105],
        [-69, -54, -17, 9, 9, -17, -54, -69],
        [-50, -39, -7, 28, 28, -7, -39, -50],
        [-41, -25, 6, 38, 38, 6, -25, -41],
        [-46, -25, 3, 40, 40, 3, -25, -46],
        [-54, -38, -7, 27, 27, -7, -38, -54],
        [-65, -50, -24, 13, 13, -24, -50, -65],
        [-109, -89, -50, -13, -13, -50, -89, -109],
      ]
    }
  },

  'b': {
    'mid': {
      'w': [
        [-35, -11, -19, -29, -29, -19, -11, -35],
        [-23, 17, 6, -2, -2, 6, 17, -23],
        [-17, 16, 12, 2, 2, 12, 16, -17],
        [-11, 27, 16, 9, 9, 16, 27, -11],
        [-11, 28, 21, 10, 10, 21, 28, -11],
        [-9, 27, 21, 11, 11, 21, 27, -9],
        [-20, 20, 12, 1, 1, 12, 20, -20],
        [-44, -13, -25, -34, -34, -25, -13, -44],
      ],
      'b': [
        [-44, -13, -25, -34, -34, -25, -13, -44],
        [-20, 20, 12, 1, 1, 12, 20, -20],
        [-9, 27, 21, 11, 11, 21, 27, -9],
        [-11, 28, 21, 10, 10, 21, 28, -11],
        [-11, 27, 16, 9, 9, 16, 27, -11],
        [-17, 16, 12, 2, 2, 12, 16, -17],
        [-23, 17, 6, -2, -2, 6, 17, -23],
        [-35, -11, -19, -29, -29, -19, -11, -35],
      ]
    },
    'end': {
      'w': [
        [-55, -32, -36, -17, -17, -36, -32, -55],
        [-34, -10, -12, ,6, 6, -12, -10, -34],
        [-24, -2, 0, 13, 13, 0, -2, -24],
        [-26, -4, -7, 14, 14, -7, -4, -26],
        [-26, -3, -5, 16, 16, -5, -3, -26],
        [-23, 0, -3, 16, 16, -3, 0, -23],
        [-34, -9, -14, ,4, 4, -14, -9, -34],
        [-58, -31, -37, -19, -19, -37, -31, -58],
      ],
      'b': [
        [-58, -31, -37, -19, -19, -37, -31, -58],
        [-34, -9, -14, ,4, 4, -14, -9, -34],
        [-23, 0, -3, 16, 16, -3, 0, -23],
        [-26, -3, -5, 16, 16, -5, -3, -26],
        [-26, -4, -7, 14, 14, -7, -4, -26],
        [-24, -2, 0, 13, 13, 0, -2, -24],
        [-34, -10, -12, ,6, 6, -12, -10, -34],
        [-55, -32, -36, -17, -17, -36, -32, -55],
      ]
    }
  },

  'r': {
    'mid': {
      'w': [
        [-23, -15, -11, -5, -5, -11, -15, -23],
        [-12, 4, 8, 12, 12, 8, 4, -12],
        [-21, -7, 0, 2, 2, 0, -7, -21],
        [-22, -7, 0, 1, 1, 0, -7, -22],
        [-22, -6, -1, 2, 2, -1, -6, -22],
        [-21, -9, -4, 2, 2, -4, -9, -21],
        [-21, -8, -3, 0, 0, -3, -8, -21],
        [-25, -16, -16, -9, -9, -16, -16, -25],
      ],
      'b': [
        [-25, -16, -16, -9, -9, -16, -16, -25],
        [-21, -8, -3, 0, 0, -3, -8, -21],
        [-21, -9, -4, 2, 2, -4, -9, -21],
        [-22, -6, -1, 2, 2, -1, -6, -22],
        [-22, -7, 0, 1, 1, 0, -7, -22],
        [-21, -7, 0, 2, 2, 0, -7, -21],
        [-12, 4, 8, 12, 12, 8, 4, -12],
        [-23, -15, -11, -5, -5, -11, -15, -23],
      ]
    },
    'end': {
      'w': [
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
      ],
      'b': [
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
      ]
    }
  },

  'q': {
    'mid': {
      'w': [
        [-1, -4, -1, 0, 0, -1, -4, -1,],
        [-2, 7, 7, 6, 6, 7, 7, -2],
        [-2, 6, 8, 10, 10, 8, 6, -2],
        [-3, 9, 8, 7, 7, 8, 9, -3],
        [-1, 8, 10, 7, 7, 10, 8, -1],
        [-2, 6, 9, 9, 9, 9, 6, -2],
        [-4, 6, 9, 8, 8, 9, 6, -4],
        [0, -4, -3, -1, -1, -3, -4, 0],
      ],
      'b': [
        [0, -4, -3, -1, -1, -3, -4, 0],
        [-4, 6, 9, 8, 8, 9, 6, -4],
        [-2, 6, 9, 9, 9, 9, 6, -2],
        [-1, 8, 10, 7, 7, 10, 8, -1],
        [-3, 9, 8, 7, 7, 8, 9, -3],
        [-2, 6, 8, 10, 10, 8, 6, -2],
        [-2, 7, 7, 6, 6, 7, 7, -2],
        [-1, -4, -1, 0, 0, -1, -4, -1,],
      ]
    },
    'end': {
      'w': [
        [-74, -55, -43, -30, -30, -43, -55, -74],
        [-55, -30, -21, -6, -6, -21, -30, -55],
        [-40, -16, -10, 3, 3, -10, -16, -40],
        [-27, -5, 10, 21, 21, 10, -5, -27],
        [-29, -5, 9, 19, 19, 9, -5, -29],
        [-39, -17, -8, 5, 5, -8, -17, -39],
        [-56, -30, -21, -5, -5, -21, -30, -56],
        [-71, -56, -42, -29, -29, -42, -56, -71],
      ],
      'b': [
        [-71, -56, -42, -29, -29, -42, -56, -71],
        [-56, -30, -21, -5, -5, -21, -30, -56],
        [-39, -17, -8, 5, 5, -8, -17, -39],
        [-29, -5, 9, 19, 19, 9, -5, -29],
        [-27, -5, 10, 21, 21, 10, -5, -27],
        [-40, -16, -10, 3, 3, -10, -16, -40],
        [-55, -30, -21, -6, -6, -21, -30, -55],
        [-74, -55, -43, -30, -30, -43, -55, -74],
      ]
    }
  },

  'k': {
    'mid': {
      'w': [
        [64, 87, 49, 0, 0, 49, 87, 64],
        [87, 120, 64, 25, 25, 64, 120, 87],
        [122, 159, 85, 36, 36, 85, 159, 122],
        [145, 176, 112, 69, 69, 112, 176, 145],
        [169, 191, 136, 108, 108, 136, 191, 169],
        [198, 253, 168, 120, 120, 168, 253, 198],
        [277, 305, 241, 183, 183, 241, 305, 277],
        [272, 325, 273, 190, 190, 273, 325, 272],
      ],
      'b': [
        [272, 325, 273, 190, 190, 273, 325, 272],
        [277, 305, 241, 183, 183, 241, 305, 277],
        [198, 253, 168, 120, 120, 168, 253, 198],
        [169, 191, 136, 108, 108, 136, 191, 169],
        [145, 176, 112, 69, 69, 112, 176, 145],
        [122, 159, 85, 36, 36, 85, 159, 122],
        [87, 120, 64, 25, 25, 64, 120, 87],
        [64, 87, 49, 0, 0, 49, 87, 64],
      ]
    },
    'end': {
      'w': [
        [5, 60, 75, 75, 75, 75, 60, 5],
        [40, 99, 128, 141, 141, 128, 99, 40],
        [87, 164, 174, 189, 189, 174, 164, 87],
        [98, 166, 197, 194, 194, 197, 166, 98],
        [103, 152, 168, 169, 169, 168, 152, 103],
        [86, 138, 165, 173, 173, 165, 138, 86],
        [57, 98, 138, 131, 131, 138, 98, 57],
        [0, 41, 80, 93, 93, 80, 41, 0],
      ],
      'b': [
        [0, 41, 80, 93, 93, 80, 41, 0],
        [57, 98, 138, 131, 131, 138, 98, 57],
        [86, 138, 165, 173, 173, 165, 138, 86],
        [103, 152, 168, 169, 169, 168, 152, 103],
        [98, 166, 197, 194, 194, 197, 166, 98],
        [87, 164, 174, 189, 189, 174, 164, 87],
        [40, 99, 128, 141, 141, 128, 99, 40],
        [5, 60, 75, 75, 75, 75, 60, 5],
      ]
    }
  },
};
