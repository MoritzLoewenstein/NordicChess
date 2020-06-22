### TODO
- [ ] move gen
- [ ] position evaluation

### FEN RegEx
Goal of this RegEx is NOT to validate legal positions

#### Board
`([rnbqkpRNBQKP1-8]+\/){7}([rnbqkpRNBQKP1-8]+)`

#### Next Move
`[bw]`

#### Castling
`(-|KQ?k?q?|K?Qk?q?|K?Q?kq?|K?Q?k?q)`

#### En Passant
`(-|[a-h][36])`

#### Halfmove Clock
`\d+`

#### Fullmove Number
`\d+`