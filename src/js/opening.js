const OPENINGS = [
  // A03	Bird's Opening
  ['f4', 'd5'],

  // A05	Reti Opening
  ['Nf3', 'Nf6', 'c4'],
  // A08	King's Indian Attack
  ['Nf3', 'd5', 'g3', 'c5', 'Bg2'],

  // A12	English with b3
  ['c4', 'c6', 'Nf3', 'd5', 'b3'],
  // A14	English
  ['c4', 'e6', 'Nf3', 'd5', 'g3', 'Nf6', 'Bg2', 'Be7', 'O-O'],
  // A19	English, Mikenas-Carls, Sicilian Variation
  ['c4', 'Nf6', 'Nc3', 'e6', 'e4', 'c5'],
  // A23	English, Bremen System, Keres Variation
  ['c4', 'e5', 'Nc3', 'Nf6', 'g3', 'c6'],
  // A24	English, Bremen System with ...g6
  ['c4', 'e5', 'Nc3', 'Nf6', 'g3', 'g6'],
  // A26	English
  ['c4', 'e5', 'Nc3', 'Nc6', 'g3', 'g6', 'Bg2', 'Bg7', 'd3', 'd6'],
  // A29	English, Four Knights, Kingside Fianchetto
  ['c4', 'e5', 'Nc3', 'Nc6', 'Nf3', 'Nf6', 'g3'],
  // A33	English, Symmetrical
  ['c4', 'c5', 'Nf3', 'Nf6', 'd4', 'cxd4', 'Nxd4', 'e6', 'Nc3', 'Nc6'],
  // A39	English, Symmetrical, Main line with d4
  ['c4', 'c5', 'Nc3', 'Nc6', 'g3', 'g6', 'Bg2', 'Bg7', 'Nf3', 'Nf6', 'O-O', 'O-O', 'd4'],

  // A42	Modern Defense, Averbakh System
  ['d4', 'd6', 'c4', 'g6', 'Nc3', 'Bg7', 'e4'],
  // A44	Old Benoni Defense
  ['d4', 'c5', 'd5', 'e5'],
  // A49	King's Indian, Fianchetto without c4
  ['d4', 'Nf6', 'Nf3', 'g6', 'g3'],
  // A52	Budapest Gambit
  ['d4', 'Nf6', 'c4', 'e5', 'dxe5', 'Ng4'],
  // A55	Old Indian, Main line
  ['d4', 'Nf6', 'c4', 'd6', 'Nc3', 'e5', 'Nf3', 'Nbd7', 'e4'],
  // A59	Benko Gambit
  ['d4', 'Nf6', 'c4', 'c5', 'd5', 'b5', 'cxb5', 'a6', 'bxa6', 'Bxa6', 'Nc3', 'd6', 'e4'],
  // A62	Benoni, Fianchetto Variation
  ['d4', 'Nf6', 'c4', 'c5', 'd5', 'e6', 'Nc3', 'exd5', 'cxd5', 'd6', 'Nf3', 'g6', 'g3', 'Bg7', 'Bg2', 'O-O'],
  // A68	Benoni, Four Pawns Attack
  ['d4', 'Nf6', 'c4', 'c5', 'd5', 'e6', 'Nc3', 'exd5', 'cxd5', 'd6', 'e4', 'g6', 'f4', 'Bg7', 'Nf3', 'O-O'],
  // A72	Benoni, Classical without 9.O-O
  ['d4', 'Nf6', 'c4', 'c5', 'd5', 'e6', 'Nc3', 'exd5', 'cxd5', 'd6', 'e4', 'g6', 'Nf3', 'Bg7', 'Be2', 'O-O'],
  // A83	Dutch, Staunton Gambit
  ['d4', 'f5', 'e4', 'fxe4', 'Nc3', 'Nf6', 'Bg5'],
  // A85	Dutch, with c4 & Nc3
  ['d4', 'f5', 'c4', 'Nf6', 'Nc3'],
  // A88	Dutch, Leningrad, Main Variation with c6
  ['d4', 'f5', 'c4', 'Nf6', 'g3', 'g6', 'Bg2', 'Bg7', 'Nf3', 'O-O', 'O-O', 'd6', 'Nc3', 'c6'],
  // A89	Dutch, Leningrad, Main Variation with Nc6
  ['d4', 'f5', 'c4', 'Nf6', 'g3', 'g6', 'Bg2', 'Bg7', 'Nf3', 'O-O', 'O-O', 'd6', 'Nc3', 'Nc6'],
  // A94	Dutch, Stonewall with Ba3
  ['d4', 'f5', 'c4', 'Nf6', 'g3', 'e6', 'Bg2', 'Be7', 'Nf3', 'O-O', 'O-O', 'd5', 'b3', 'c6', 'Ba3'],
  // A95	Dutch, Stonewall
  ['d4', 'f5', 'c4', 'Nf6', 'g3', 'e6', 'Bg2', 'Be7', 'Nf3', 'O-O', 'O-O', 'd5', 'Nc3', 'c6'],
  // A98	Dutch, Ilyin-Genevsky Variation with Qc2
  ['d4', 'f5', 'c4', 'Nf6', 'g3', 'e6', 'Bg2', 'Be7', 'Nf3', 'O-O', 'O-O', 'd6', 'Nc3', 'Qe8', 'Qc2'],
  // A99	Dutch, Ilyin-Genevsky Variation with b3
  ['d4', 'f5', 'c4', 'Nf6', 'g3', 'e6', 'Bg2', 'Be7', 'Nf3', 'O-O', 'O-O', 'd6', 'Nc3', 'Qe8', 'b3'],
  // D94	Grunfeld
  ['d4', 'Nf6', 'c4', 'g6', 'Nc3', 'd5', 'Nf3', 'Bg7', 'e3'],

  // B05	Alekhine's Defense, Modern
  ['e4', 'Nf6', 'e5', 'Nd5', 'd4', 'd6', 'Nf3', 'Bg4'],
  // B09	Pirc, Austrian Attack
  ['e4', 'd6', 'd4', 'Nf6', 'Nc3', 'g6', 'f4'],
  // B11	Caro-Kann, Two Knights, 3...Bg4
  ['e4', 'c6', 'Nc3', 'd5', 'Nf3', 'Bg4'],
  // B14	Caro-Kann, Panov-Botvinnik Attack
  ['e4', 'c6', 'd4', 'd5', 'exd5', 'cxd5', 'c4', 'Nf6', 'Nc3', 'e6'],
  // B16	Caro-Kann, Bronstein-Larsen Variation
  ['e4', 'c6', 'd4', 'd5', 'Nc3', 'dxe4', 'Nxe4', 'Nf6', 'Nxf6+', 'gxf6'],
  // B17	Caro-Kann, Steinitz Variation
  ['e4', 'c6', 'd4', 'd5', 'Nc3', 'dxe4', 'Nxe4', 'Nd7'],
  // B19	Caro-Kann, Classical
  ['e4', 'c6', 'd4', 'd5', 'Nc3', 'dxe4', 'Nxe4', 'Bf5', 'Ng3', 'Bg6', 'h4', 'h6', 'Nf3', 'Nd7'],
  // B21	Sicilian, 2.f4 and 2.d4
  ['e4', 'c5', 'f4'],
  // B22	Sicilian, Alapin
  ['e4', 'c5', 'c3'],
  // B26	Sicilian, Closed, 6.Be3
  ['e4', 'c5', 'Nc3', 'Nc6', 'g3', 'g6', 'Bg2', 'Bg7', 'd3', 'd6', 'Be3'],
  // B29	Sicilian, Nimzovich-Rubinstein
  ['e4', 'c5', 'Nf3', 'Nf6'],
  // B31	Sicilian, Rossolimo Variation
  ['e4', 'c5', 'Nf3', 'Nc6', 'Bb5', 'g6'],
  // B32	Sicilian
  ['e4', 'c5', 'Nf3', 'Nc6', 'd4', 'cxd4', 'Nxd4', 'e5'],
  // B34	Sicilian, Accelerated Fianchetto
  ['e4', 'c5', 'Nf3', 'Nc6', 'd4', 'cxd4', 'Nxd4', 'g6', 'Nxc6'],
  // B35	Sicilian, Accelerated Fianchetto, Modern Variation with Bc4
  ['e4', 'c5', 'Nf3', 'Nc6', 'd4', 'cxd4', 'Nxd4', 'g6', 'Nc3', 'Bg7', 'Be3', 'Nf6', 'Bc4'],
  // B39	Sicilian, Accelerated Fianchetto, Breyer Variation
  ['e4', 'c5', 'Nf3', 'Nc6', 'd4', 'cxd4', 'Nxd4', 'g6', 'c4', 'Bg7', 'Be3', 'Nf6', 'Nc3', 'Ng4'],
  // B42	Sicilian, Kan
  ['e4', 'c5', 'Nf3', 'e6', 'd4', 'cxd4', 'Nxd4', 'a6', 'Bd3'],
  // B43	Sicilian, Kan, 5.Nc3
  ['e4', 'c5', 'Nf3', 'e6', 'd4', 'cxd4', 'Nxd4', 'a6', 'Nc3'],
  // B46	Sicilian, Taimanov Variation
  ['e4', 'c5', 'Nf3', 'e6', 'd4', 'cxd4', 'Nxd4', 'Nc6', 'Nc3', 'a6'],
  // B49	Sicilian, Taimanov Variation
  ['e4', 'c5', 'Nf3', 'e6', 'd4', 'cxd4', 'Nxd4', 'Nc6', 'Nc3', 'Qc7', 'Be3', 'a6', 'Be2'],
  // B52	Sicilian, Canal-Sokolsky (Rossolimo) Attack
  ['e4', 'c5', 'Nf3', 'd6', 'Bb5+', 'Bd7'],
  // B53	Sicilian
  ['e4', 'c5', 'Nf3', 'd6', 'd4', 'cxd4', 'Qxd4'],
  // B55	Sicilian, Prins Variation, Venice Attack
  ['e4', 'c5', 'Nf3', 'd6', 'd4', 'cxd4', 'Nxd4', 'Nf6', 'f3', 'e5', 'Bb5+'],

  // C01	French, Exchange
  ['e4', 'e6', 'd4', 'd5', 'exd5', 'exd5', 'Nc3', 'Nf6', 'Bg5'],
  // C02	French, Advance
  ['e4', 'e6', 'd4', 'd5', 'e5'],
  // C04	French, Tarrasch, Guimard Main line
  ['e4', 'e6', 'd4', 'd5', 'Nd2', 'Nc6', 'Ngf3', 'Nf6'],
  // C06	French, Tarrasch
  ['e4', 'e6', 'd4', 'd5', 'Nd2', 'Nf6', 'e5', 'Nfd7', 'Bd3', 'c5', 'c3', 'Nc6', 'Ne2', 'cxd4', 'cxd4'],
  // C09	French, Tarrasch, Open Variation, Main line
  ['e4', 'e6', 'd4', 'd5', 'Nd2', 'c5', 'exd5', 'exd5', 'Ngf3', 'Nc6'],
  // C12	French, McCutcheon
  ['e4', 'e6', 'd4', 'd5', 'Nc3', 'Nf6', 'Bg5', 'Bb4'],
  // C14	French, Classical
  ['e4', 'e6', 'd4', 'd5', 'Nc3', 'Nf6', 'Bg5', 'Be7', 'e5', 'Nfd7', 'Bxe7', 'Qxe7'],
  // C19	French, Winawer, Advance
  ['e4', 'e6', 'd4', 'd5', 'Nc3', 'Bb4', 'e5', 'c5', 'a3', 'Bxc3+', 'bxc3', 'Ne7'],
  // C22	Center Game
  ['e4', 'e5', 'd4', 'exd4', 'Qxd4', 'Nc6'],
  // C24	Bishop's Opening
  ['e4', 'e5', 'Bc4', 'Nf6'],
  // C27	Vienna Game
  ['e4', 'e5', 'Nc3', 'Nf6', 'Bc4', 'Nxe4'],
  // C28	Vienna Game
  ['e4', 'e5', 'Nc3', 'Nf6', 'Bc4', 'Nc6'],
  // C29	Vienna Gambit
  ['e4', 'e5', 'Nc3', 'Nf6', 'f4'],
  // C32	King's Gambit Declined, Falkbeer Counter Gambit
  ['e4', 'e5', 'f4', 'd5', 'exd5', 'e4', 'd3', 'Nf6'],
  // C35	King's Gambit Accepted, Cunningham
  ['e4', 'e5', 'f4', 'exf4', 'Nf3', 'Be7'],
  // C36	King's Gambit Accepted, Abbazia Defense
  ['e4', 'e5', 'f4', 'exf4', 'Nf3', 'd5'],
  // C37	King's Gambit Accepted
  ['e4', 'e5', 'f4', 'exf4', 'Nf3', 'g5', 'Nc3'],
  // C38	King's Gambit Accepted
  ['e4', 'e5', 'f4', 'exf4', 'Nf3', 'g5', 'Bc4', 'Bg7'],
  // C39	King's Gambit Accepted
  ['e4', 'e5', 'f4', 'exf4', 'Nf3', 'g5', 'h4'],
  // C41	Philidor Defense
  ['e4', 'e5', 'Nf3', 'd6'],
  // C43	Petrov, Modern Attack
  ['e4', 'e5', 'Nf3', 'Nf6', 'd4', 'exd4', 'e5', 'Ne4', 'Qxd4'],
  // C45	Scotch Game
  ['e4', 'e5', 'Nf3', 'Nc6', 'd4', 'exd4', 'Nxd4'],
  // C49	Four Knights
  ['e4', 'e5', 'Nf3', 'Nc6', 'Nc3', 'Nf6', 'Bb5', 'Bb4'],
  // C52	Evans Gambit
  ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4', 'Bc5', 'b4', 'Bxb4', 'c3', 'Ba5'],
  // C54	Giuoco Piano
  ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4', 'Bc5', 'c3', 'Nf6', 'd4', 'exd4', 'cxd4'],
  // C56	Two Knights
  ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4', 'Nf6', 'd4', 'exd4', 'O-O', 'Nxe4'],
  // C59	Two Knights
  ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4', 'Nf6', 'Ng5', 'd5', 'exd5', 'Na5', 'Bb5+', 'c6', 'dxc6', 'bxc6', 'Be2', 'h6'],
  // C61	Ruy Lopez, Bird's Defense
  ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5', 'Nd4'],
  // C62	Ruy Lopez, Old Steinitz Defense
  ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5', 'd6'],
  // C63	Ruy Lopez, Schliemann Defense
  ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5', 'f5'],
  // C64	Ruy Lopez, Classical
  ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5', 'Bc5'],
  // C66	Ruy Lopez
  ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5', 'Nf6', 'O-O', 'd6'],
  // C67	Ruy Lopez
  ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5', 'Nf6', 'O-O', 'Nxe4'],
  // C69	Ruy Lopez, Exchange, Gligoric Variation
  ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5', 'a6', 'Bxc6', 'dc', 'O-O', 'f6'],
  // C72	Ruy Lopez, Modern Steinitz Defense, 5.O-O
  ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5', 'a6', 'Ba4', 'd6', 'O-O'],
  // C73	Ruy Lopez, Modern Steinitz Defense
  ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5', 'a6', 'Ba4', 'd6', 'Bxc6+', 'bxc6', 'd4'],
  // C76	Ruy Lopez, Modern Steinitz Defense, Fianchetto Variation
  ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5', 'a6', 'Ba4', 'd6', 'c3', 'Bd7', 'd4', 'g6'],
  // C79	Ruy Lopez, Steinitz Defense Deferred
  ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5', 'a6', 'Ba4', 'Nf6', 'O-O', 'd6'],
  // C81	Ruy Lopez, Open, Howell Attack
  ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5', 'a6', 'Ba4', 'Nf6', 'O-O', 'Nxe4', 'd4', 'b5', 'Bb3', 'd5', 'dxe5', 'Be6', 'Qe2'],
  // C82	Ruy Lopez, Open
  ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5', 'a6', 'Ba4', 'Nf6', 'O-O', 'Nxe4', 'd4', 'b5', 'Bb3', 'd5', 'dxe5', 'Be6', 'c3'],
  // C85	Ruy Lopez, Exchange Variation Doubly Deferred (DERLD)
  ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5', 'a6', 'Ba4', 'Nf6', 'O-O', 'Be7', 'Bxc6', 'dxc6'],
  // C86	Ruy Lopez, Worrall Attack
  ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5', 'a6', 'Ba4', 'Nf6', 'O-O', 'Be7', 'Qe2'],
  // C87	Ruy Lopez
  ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5', 'a6', 'Ba4', 'Nf6', 'O-O', 'Be7', 'Re1', 'd6'],
  // C89	Ruy Lopez, Marshall
  ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5', 'a6', 'Ba4', 'Nf6', 'O-O', 'Be7', 'Re1', 'b5', 'Bb3', 'O-O', 'c3', 'd5'],
  // C91	Ruy Lopez, Closed
  ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5', 'a6', 'Ba4', 'Nf6', 'O-O', 'Be7', 'Re1', 'b5', 'Bb3', 'O-O', 'c3', 'd6', 'd4'],
  // C93	Ruy Lopez, Closed, Smyslov Defense
  ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5', 'a6', 'Ba4', 'Nf6', 'O-O', 'Be7', 'Re1', 'b5', 'Bb3', 'O-O', 'c3', 'd6', 'h3', 'h6'],
  // C95	Ruy Lopez, Closed, Breyer
  ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5', 'a6', 'Ba4', 'Nf6', 'O-O', 'Be7', 'Re1', 'b5', 'Bb3', 'O-O', 'c3', 'd6', 'h3', 'Nb8', 'd4'],
  // C98	Ruy Lopez, Closed, Chigorin
  ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5', 'a6', 'Ba4', 'Nf6', 'O-O', 'Be7', 'Re1', 'b5', 'Bb3', 'O-O', 'c3', 'd6', 'h3', 'Na5', 'Bc2', 'c5', 'd4', 'Qc7', 'Nbd2', 'Nc6'],
  // C99	Ruy Lopez, Closed, Chigorin, 12...cd
  ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5', 'a6', 'Ba4', 'Nf6', 'O-O', 'Be7', 'Re1', 'b5', 'Bb3', 'O-O', 'c3', 'd6', 'h3', 'Na5', 'Bc2', 'c5', 'd4', 'Qc7', 'Nbd2', 'cxd4', 'cxd4'],
]

// 棋譜を文字列にして返す（開発用）
function makeOpen(str) {
  const splited = str.split(' ');
  const notNum = splited.filter((item) => isNaN(item));
  return notNum;
}