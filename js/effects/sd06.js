/* AvastFall TCG – สคริปต์เอฟเฟกต์การ์ดชุด SD06
   หนึ่งการ์ด = FX[id] หนึ่งรายการ + (ถ้าจำเป็น) NOTES[id] อธิบายการตีความ
   ถ้าแก้ข้อความการ์ดใน card-api ให้แก้สคริปต์ตรงนี้ แล้วอัปเดตข้อความใน js/data/snapshot.js ให้ตรงกัน */
(function (AF) {
'use strict';
const H = AF.H, FX = AF.FX = AF.FX || {}, NOTES = AF.notes = AF.notes || {};
const log = AF.log, place = AF.place;

/* =============================================================== SD06 */
const BOOK = 'ตำราพิชัยสงคราม', WATER = 'น้ำ';
const books = P => P.hand.filter(c => c.def.name.includes(BOOK));

/* ---- 001 ซุนวู นักยุทธศาสตร์ไร้รูปแบบ (Avatar) */
FX['SD06-001'] = { abilities: [{
  id: 'art', kw: 'ACTIVATE 1/turn', zone: 'avatar', label: '[Spend 2 Water] ทิ้ง “ตำราพิชัยสงคราม” 1 ใบ: นำ Unit ฝ่ายตรงข้าม 1 ใบไปไว้ใต้ Main Deck',
  can: ({ G, p, self }) => AF.standElems(G.players[p], WATER).length >= 2 && books(G.players[p]).length > 0 && H.oppUnits(G, p, null, self).length > 0,
  pay: async ({ G, p }) => {
    AF.spendElems(G, p, 2, WATER);
    const [c] = await H.pickCards(G, p, { title: 'ซุนวู: เลือกการ์ดที่มีคำว่า “ตำราพิชัยสงคราม” ในชื่อจากมือเพื่อทิ้ง', cards: books(G.players[p]) });
    if (c) { place(G, c, 'discard'); log(G, `${G.players[p].name} ทิ้ง ${c.def.name}`, p); }
  },
  targets: async ({ G, p, self }) => (await H.pickUnit(G, p, H.oppUnits(G, p, null, self), 'ซุนวู: เลือก Unit ฝ่ายตรงข้าม 1 ใบ นำไปไว้ใต้ Main Deck ของฝ่ายตรงข้าม')) || false,
  resolve: async ({ G, p }, u) => {
    if (!u || u.zone !== 'field') return;
    await H.removeUnit(G, u, 'deckBottom');
    log(G, `${u.def.name} ถูกนำไปไว้ใต้ Main Deck ของ ${G.players[u.owner].name}`, p);
  } }] };
NOTES['SD06-001'] = 'ค่า Spend ต้องใช้ Element ธาตุน้ำ 2 ใบ ทิ้งการ์ดเป็นค่าใช้จ่ายก่อนเลือกเป้าหมาย (ตามรูปแบบเดียวกับ SD03-009) ถ้า Unit มี Equipment สวมอยู่ Equipment จะลงกองทิ้งตามปกติ';
/* ---- 002 จางอิ่ง สายลับไร้เงา */
FX['SD06-002'] = { advent: { resolve: async ({ G, p }) => {
  const O = G.players[AF.opp(p)];
  if (!O.hand.length) { log(G, 'ฝ่ายตรงข้ามไม่มีการ์ดบนมือ', p); return; }
  const c = O.hand[Math.floor(G.rng() * O.hand.length)];
  place(G, c, 'deckBottom'); log(G, `การ์ดบนมือของ ${O.name} 1 ใบถูกนำไปไว้ใต้ Main Deck`, p);
  H.draw(G, AF.opp(p), 1);
} } };

/* ---- 003 เติ้งจือ ทูตม้าเร็ว */
FX['SD06-003'] = { advent: { resolve: async ({ G, p }) => {
  await H.digTop(G, p, { n: 2, title: 'เติ้งจือ: เลือกการ์ดที่มีคำว่า “ตำราพิชัยสงคราม” ในชื่อ 1 ใบขึ้นมือ', filter: c => c.def.name.includes(BOOK) });
} } };

/* ---- 005 เฉินเต้า ทหารล่อศึก */
FX['SD06-005'] = { admonish: async ({ G, p }) => {
  const c = H.oppUnits(G, p, u => u.state === 'rest');
  const u = await H.pickUnit(G, p, c, 'เฉินเต้า: เลือก Unit ฝ่ายตรงข้ามที่นอนอยู่ 1 ใบ นำไปไว้ใต้ Main Deck');
  if (u) { await H.removeUnit(G, u, 'deckBottom'); log(G, `${u.def.name} ถูกนำไปไว้ใต้ Main Deck`, p); }
} };

/* ---- 018 กระโจมบัญชาการลับ (Domain) */
FX['SD06-018'] = { abilities: [{
  id: 'tent', kw: 'ACTIVATE 1/turn', zone: 'domain', label: 'ทิ้ง “ตำราพิชัยสงคราม” 1 ใบจากมือ แล้วจั่ว 2',
  can: ({ G, p }) => books(G.players[p]).length > 0,
  pay: async ({ G, p }) => {
    const [c] = await H.pickCards(G, p, { title: 'กระโจมบัญชาการลับ: เลือก “ตำราพิชัยสงคราม” จากมือเพื่อทิ้ง', cards: books(G.players[p]) });
    if (c) { place(G, c, 'discard'); log(G, `${G.players[p].name} ทิ้ง ${c.def.name}`, p); }
  },
  resolve: async ({ G, p }) => { H.draw(G, p, 2); } }] };
NOTES['SD06-018'] = 'ค่าใช้จ่ายคือการทิ้งการ์ด (ทิ้งก่อนแล้วจึงจั่ว 2 ใบ)';
})(globalThis.AF = globalThis.AF || {});
