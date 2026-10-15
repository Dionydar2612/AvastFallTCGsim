/* AvastFall TCG – สคริปต์เอฟเฟกต์การ์ดชุด SD02 Record of the Future
   หนึ่งการ์ด = FX[id] หนึ่งรายการ + (ถ้าจำเป็น) NOTES[id] อธิบายการตีความ
   ถ้าแก้ข้อความการ์ดใน card-api ให้แก้สคริปต์ตรงนี้ แล้วอัปเดตข้อความใน js/data/snapshot.js ให้ตรงกัน */
(function (AF) {
'use strict';
const H = AF.H, FX = AF.FX = AF.FX || {}, NOTES = AF.notes = AF.notes || {};
const opp = AF.opp, stat = AF.stat, place = AF.place, log = AF.log;
const hasName = AF.hasName, tribeHas = AF.tribeHas, addMod = AF.addMod;
const fxOf = c => FX[c.def.id] || {};
const { killAdvent, killSpell, myHasName, isKnight, prophecyAb, enterByEffect } = AF.fxKit;

/* =============================================================== SD02 Record of the Future */
FX['SD02-001'] = { abilities: [{ id: 'peek', kw: 'ACTIVATE 1/turn', zone: 'avatar', label: 'เปิดการ์ดบนสุด ถ้าเป็นอาลักษณ์ จั่ว 2',
  can: ({ G, p }) => G.players[p].deck.length > 0,
  resolve: async ({ G, p }) => {
    const t = G.players[p].deck[0]; if (!t) return;
    log(G, `${G.players[p].name} เปิดการ์ดบนสุด: ${t.def.name}`, p, { reveal: [t.uid] });
    if (tribeHas(t, 'อาลักษณ์')) { log(G, 'เป็นเผ่า "อาลักษณ์" → จั่ว 2 ใบ', p); H.draw(G, p, 2); }
  } }] };
const arrange3 = { resolve: async ({ G, p }) => { await H.arrangeTop(G, p, 3); } };
FX['SD02-002'] = { advent: arrange3, abilities: [prophecyAb('DEF +1 จนจบเทิร์นคู่แข่ง', async ({ G, self }) => { if (self.zone === 'field') addMod(G, self, { def: 1, until: 'oppTurnEnd' }); })] };
FX['SD02-003'] = { advent: { resolve: async ({ G, p }) => {
  const P = G.players[p]; const t = P.deck[0]; if (!t) return;
  const bottom = await H.yesNo(G, p, `ดูการ์ดบนสุด: ${t.def.name} — ย้ายไปไว้ใต้ Main Deck?`, 'ย้ายไปใต้', 'คงไว้ที่เดิม');
  if (bottom) place(G, t, 'deckBottom');
  log(G, `${P.name} ดูการ์ดบนสุดของ Main Deck`, p);
  await AF.emit(G, 'arrange', { player: p });
} } };
FX['SD02-004'] = { advent: arrange3, abilities: [prophecyAb('DEF +1 จนจบเทิร์นคู่แข่ง', async ({ G, self }) => { if (self.zone === 'field') addMod(G, self, { def: 1, until: 'oppTurnEnd' }); })] };
FX['SD02-005'] = { abilities: [
  { id: 'lib', kw: 'ACTIVATE 1/turn', zone: 'field', label: 'นอน แล้วจั่ว 1 ทิ้ง 1', can: ({ self }) => self.state === 'stand',
    pay: async ({ G, self }) => { self.state = 'rest'; },
    resolve: async ({ G, p }) => { H.draw(G, p, 1); await H.discardFromHand(G, p, 1); } },
  prophecyAb('จั่วการ์ด 1 ใบ', async ({ G, p }) => { H.draw(G, p, 1); }, { id: 'proph' })] };
FX['SD02-006'] = {
  on: { attackDeclared: async ({ G, self, p, item, target }) => {
    if (target === 'avatar' || target === self || target.owner !== p || item.controller === p || self.zone !== 'field') return;
    if (AF.standElems(G.players[p]).length < 1) return;
    const yes = await H.yesNo(G, p, `${self.def.name}: จ่าย 1 Element เพื่อเปลี่ยนเป้าหมายการโจมตีมาที่ใบนี้?`, 'จ่ายและเปลี่ยนเป้าหมาย', 'ไม่');
    if (yes) { AF.spendElems(G, p, 1); item.target = self; log(G, `เป้าหมายการโจมตีเปลี่ยนมาที่ ${self.def.name}`, p); }
  } },
  abilities: [prophecyAb('DEF +2 จนจบเทิร์นคู่แข่ง', async ({ G, self }) => { if (self.zone === 'field') addMod(G, self, { def: 2, until: 'oppTurnEnd' }); })]
};
FX['SD02-007'] = { abilities: [prophecyAb('เลือก Unit ฝ่ายละ 1 ใบ วางบนสุด Main Deck', async ({ G, p, self }) => {
  const mine = await H.pickUnit(G, p, H.myUnits(G, p), 'เลือก Unit ฝ่ายเรา 1 ใบ วางไว้บนสุดของ Main Deck เรา');
  const theirs = await H.pickUnit(G, p, H.oppUnits(G, p, null, self), 'เลือก Unit ฝ่ายตรงข้าม 1 ใบ วางไว้บนสุดของ Main Deck เขา');
  for (const u of [mine, theirs]) if (u && u.zone === 'field') { H.removeUnit(G, u, 'deckTop'); log(G, `${u.def.name} ถูกวางไว้บนสุดของ Main Deck`, u.owner); }
}, { uses: 2 })] };
FX['SD02-008'] = { advent: { resolve: async ({ G, p }) => {
  const o = opp(p);
  const c = await H.choose(G, o, 'ฝ่ายตรงข้ามต้องเลือก 1 อย่าง', ['ให้ฝ่ายเราจั่วการ์ด 2 ใบ', 'ทิ้งการ์ดบนมือของคุณ 2 ใบ']);
  if (c === 0) H.draw(G, p, 2); else await H.discardFromHand(G, o, 2);
} } };
FX['SD02-009'] = {
  abilities: [prophecyAb('เลือก Unit ฝ่ายตรงข้าม ATK -2 จนจบเทิร์นคู่แข่ง', async ({ G, p, self }) => {
    const u = await H.pickUnit(G, p, H.oppUnits(G, p, null, self), 'เลือก Unit ฝ่ายตรงข้าม 1 ใบ ได้รับ ATK -2');
    if (u) addMod(G, u, { atk: -2, until: 'oppTurnEnd' });
  })],
  on: { attackDeclared: async ({ G, self, p, attacker, target }) => {
    if (attacker !== self) return;
    const t = G.players[p].deck[0]; if (!t) return;
    log(G, `${self.def.name} โจมตี: เปิดการ์ดบนสุด ${t.def.name}`, p, { reveal: [t.uid] });
    if (t.def.kind === 'Unit' && target !== 'avatar') { addMod(G, target, { def: -3, until: 'turnEnd' }); log(G, `${target.def.name} ได้รับ DEF -3`, p); }
  } }
};
FX['SD02-010'] = { spell: { resolve: async ({ G, p }) => { await H.arrangeTop(G, p, 3); } },
  prophecySpell: async ({ G, p }) => { G.players[p].spellDiscountUntil = G.turn + 1; log(G, 'SPELL ทุกใบของเราลดค่าใช้จ่าย 1 Element จนจบเทิร์นฝ่ายตรงข้าม (ขั้นต่ำ 1)', p); } };
FX['SD02-011'] = { spell: { resolve: async ({ G, p }) => { await H.digTop(G, p, { n: 3, title: 'เลือก Counter 1 ใบขึ้นมือ', filter: c => !!fxOf(c).counter }); } } };
FX['SD02-012'] = { counter: {
  when: (G, r, last) => last.controller !== r && last.kind === 'spell' && last.source.def.type === 'Spell',
  resolve: async ({ G, p, target }) => { H.cancel(G, target); } },
  prophecySpell: async ({ G, p }) => { H.draw(G, p, 1); } };
FX['SD02-013'] = { counter: {
  when: (G, r, last) => last.kind === 'attack' && last.target !== 'avatar' && last.target.owner === r,
  resolve: async ({ G, p, target }) => { const u = target.target; if (u !== 'avatar' && u.zone === 'field') { addMod(G, u, { def: 3, until: 'battle' }); log(G, `${u.def.name} ได้รับ DEF +3 จนจบการต่อสู้`, p); } } } };
FX['SD02-014'] = { counter: {
  when: (G, r, last) => last.kind === 'attack' && last.target !== 'avatar' && last.target.owner === r,
  resolve: async ({ G, p, target }) => { const a = target.attacker; if (a.zone === 'field') { addMod(G, a, { atk: -3, until: 'battle' }); log(G, `${a.def.name} ได้รับ ATK -3 จนจบการต่อสู้`, p); } } } };
FX['SD02-015'] = { counter: {
  when: (G, r, last) => last.kind === 'unit-ability' && last.controller !== r,
  resolve: async ({ G, p, target }) => { H.cancel(G, target); } } };
FX['SD02-016'] = { spell: { resolve: async ({ G, p }) => {
  const O = G.players[opp(p)];
  const spells = O.hand.filter(c => c.def.type === 'Spell');
  log(G, `${G.players[p].name} ดูการ์ดบนมือของ ${O.name}`, p);
  const ch = await H.pickCards(G, p, { title: 'ดูการ์ดบนมือฝ่ายตรงข้าม เลือก Spell สูงสุด 2 ใบเพื่อทิ้ง', cards: spells, optional: true, max: 2, kind: 'reveal', ctx: { all: O.hand.slice() } });
  for (const c of ch) { place(G, c, 'discard'); log(G, `${c.def.name} ถูกทิ้ง`, opp(p)); }
} } };
FX['SD02-017'] = { equip: { def: 1 }, abilities: [{ id: 'pen', kw: 'ACTIVATE 1/turn', zone: 'equip', label: 'ดูบนสุด ถ้าเป็น Counter ให้ผู้สวมใส่ DEF +1',
  can: ({ G, p }) => G.players[p].deck.length > 0,
  resolve: async ({ G, p, self }) => {
    const t = G.players[p].deck[0]; if (!t) return;
    if (!fxOf(t).counter) { log(G, `${G.players[p].name} ดูการ์ดบนสุด (ไม่ใช่ Counter)`, p); return; }
    log(G, `${G.players[p].name} เปิดเผย Counter: ${t.def.name}`, p, { reveal: [t.uid] });
    const bottom = await H.yesNo(G, p, `${t.def.name} เป็น Counter — คงไว้บนสุด หรือย้ายไปใต้ Main Deck?`, 'ย้ายไปใต้', 'คงไว้บนสุด');
    if (bottom) place(G, t, 'deckBottom');
    if (self.host && self.host.zone === 'field') { addMod(G, self.host, { def: 1, until: 'oppTurnEnd' }); log(G, `${self.host.def.name} ได้รับ DEF +1 จนจบเทิร์นคู่แข่ง`, p); }
  } }] };
FX['SD02-018'] = { on: { arrange: async ({ G, self, p, player }) => {
  if (player !== p || self.dflag === G.turn) return;
  self.dflag = G.turn;
  const t = G.players[p].deck[0]; if (!t) return;
  if (fxOf(t).counter) { log(G, `${self.def.name}: เปิดเผย ${t.def.name} (Counter) — Counter ใบแรกในเทิร์นถัดไปลดค่าใช้จ่าย 1`, p, { reveal: [t.uid] }); G.players[p].counterDiscount = { turn: G.turn + 1, used: false }; }
  else log(G, `${self.def.name}: ดูการ์ดบนสุดอีกครั้ง (ไม่ใช่ Counter)`, p);
} } };
FX['SD02-019'] = {
  counter: { when: (G, r, last) => last.controller !== r, resolve: async (c) => AF.FX['SD02-019']._eff(c) },
  ultimate: { resolve: async (c) => AF.FX['SD02-019']._eff(c) },
  _eff: async ({ G, p, self, item, target }) => {
    if (item && item.isCounter && target && target.kind === 'ultimate') { H.cancel(G, target); log(G, `ยกเลิกผลของ ULTIMATE ${target.label}`, p); }
    const n = G.players[p].counterCount;
    const u = await H.pickUnit(G, p, H.oppUnits(G, p, null, self), 'เลือก Unit ฝ่ายตรงข้าม 1 ใบ');
    if (!u) return;
    if (n >= 2) { H.removeUnit(G, u, 'discard'); log(G, `${u.def.name} ถูกส่งลงกองทิ้ง (Counter สำเร็จ ${n} ครั้งในเทิร์นนี้)`, opp(p)); } else log(G, `Counter สำเร็จ ${n} ครั้ง — ยังไม่ถึง 2 ครั้ง`, p);
    if (n >= 3) H.draw(G, p, 1);
  }
};

/* ------------------------------------------------------------- คำอธิบายการตีความ (แสดงในหน้า "ข้อสังเกต" และตัวตรวจการ์ด) */
NOTES["SD02-002"] = "PROPHECY ระบบใช้เป็นความสามารถที่สั่งเองได้ใน Main Phase เทิร์นละ 1 ครั้งต่อการ์ด (หนังสือกติกาไม่ได้ระบุจังหวะ)";
NOTES["SD02-007"] = "\"ได้เพียง 2 ครั้ง\" ตีความเป็น 2 ครั้งต่อเทิร์น ต้องเลือก Unit ฝ่ายละ 1 ใบ ถ้ามี";
NOTES["SD02-009"] = "DEF -3 ใส่เป้าหมายการโจมตี จนจบเทิร์น";
NOTES["SD02-010"] = "ลดค่าใช้จ่าย SPELL ของฝ่ายเราเท่านั้น (ข้อความเขียนว่า \"ทุกใบ\")";
NOTES["SD02-011"] = "ไม่มีค่าร่ายพิมพ์ไว้บนการ์ด ระบบจึงนับเป็น 0 Element";
NOTES["SD02-019"] = "ใช้เป็น Counter ได้กับทุกอย่างที่ฝ่ายตรงข้ามทำ นับ Counter สำเร็จรวมใบนี้ด้วย ถ้าตอบโต้ Ultimate ของฝ่ายตรงข้าม จะยกเลิก Ultimate นั้นด้วย";

})(globalThis.AF = globalThis.AF || {});
