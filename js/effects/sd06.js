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
})(globalThis.AF = globalThis.AF || {});
