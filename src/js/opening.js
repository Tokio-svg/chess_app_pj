const OPENINGS = [
  // A14	English
  ['c4', 'e6', 'Nf3', 'd5', 'g3', 'Nf6', 'Bg2', 'Be7', 'O-O'],

  // A55	Old Indian, Main line
  ['d4', 'Nf6', 'c4', 'd6', 'Nc3', 'e5', 'Nf3', 'Nbd7', 'e4'],
  // A89	Dutch, Leningrad, Main Variation with Nc6
  ['d4', 'f5', 'c4', 'Nf6', 'g3', 'g6', 'Bg2', 'Bg7', 'Nf3', 'O-O', 'O-O', 'd6', 'Nc3', 'Nc6'],
  // A90	Dutch
  ['d4', 'f5', 'c4', 'Nf6', 'g3', 'e6', 'Bg2'],
  // D94	Grunfeld
  ['d4', 'Nf6', 'c4', 'g6', 'Nc3', 'd5', 'Nf3', 'Bg7', 'e3'],

  // B16	Caro-Kann, Bronstein-Larsen Variation
  ['e4', 'c6', 'd4', 'd5', 'Nc3', 'dxe4', 'Nxe4', 'Nf6', 'Nxf6+', 'gxf6'],
  // B19	Caro-Kann, Classical
  ['e4', 'c6', 'd4', 'd5', 'Nc3', 'dxe4', 'Nxe4', 'Bf5', 'Ng3', 'Bg6', 'h4', 'h6', 'Nf3', 'Nd7'],
]

// 棋譜を文字列にして返す（開発用）
function makeOpen(str) {
  const splited = str.split(' ');
  const notNum = splited.filter((item) => isNaN(item));
  return notNum;
}