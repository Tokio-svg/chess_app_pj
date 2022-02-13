// Chessインスタンス作成
const game = new Chess();


// 駒が置かれた場合の処理
const onDrop = async function(source, target) {
  // 駒の移動パターンをチェックする
  const move = game.move({
    from: source,  // 移動元の位置
    to:   target   // 移動後の位置
  });

  // 駒の移動に問題があれば元の位置に戻す
  if (move === null) return 'snapback';

  await makeCPUmove();

  const playerMove = game.moves();
  // 配列の中身が0になったらゲームを終了する
  if (playerMove.length === 0) {
    alert('終了');
  }

};

// CPUプレイヤーの移動処理
const makeCPUmove = function() {
  // CPUが動ける場所を変数に代入
  const cpuMoves = game.moves();

  // 駒が動かせる場所をランダムに1つ選ぶ
  const randomNum = Math.floor(Math.random() * cpuMoves.length);

  // 選択した場所へ駒を動かす
  game.move(cpuMoves[randomNum]);

  // チェスボードの描画を更新する
  board.position(game.fen());
}

// 設定
const cfg = {
  draggable: true,
  position: 'start',
  // 駒が移動した後にonDrop関数を実行する
  onDrop: onDrop
};

// ChessBoadインスタンス作成
const board = new ChessBoard('board', cfg);

