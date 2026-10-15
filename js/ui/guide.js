/* UI · หน้า "วิธีเล่น" (สอนเล่นเบื้องต้น)
   ใส่ลิงก์วิดีโอสอนเล่นที่ TUTORIAL_VIDEO ได้ (ไฟล์ .mp4/.webm ในโฟลเดอร์ assets/ หรือลิงก์ YouTube) ถ้าเว้นว่างจะไม่แสดงช่องวิดีโอ */
'use strict';
const TUTORIAL_VIDEO='';   // เช่น 'assets/tutorial.mp4' หรือ 'https://www.youtube.com/embed/xxxxxxxxxxx'
function videoHTML(){
  const u=TUTORIAL_VIDEO.trim();if(!u)return '';
  if(/youtube\.com\/embed\/|youtube-nocookie\.com\/embed\//.test(u))return `<div class="gd-video"><iframe src="${esc(u)}" title="วิดีโอสอนเล่น" allow="accelerometer;encrypted-media;picture-in-picture" allowfullscreen loading="lazy"></iframe></div>`;
  return `<div class="gd-video"><video src="${esc(u)}" controls preload="metadata" playsinline></video></div>`;
}
function guideHTML(){
  const phases=[
    ['Start','ตั้ง Unit และ Element ที่นอนอยู่ให้ตั้งขึ้นทั้งหมด'],
    ['Draw','จั่วการ์ด 1 ใบ และรับ Element 1 ใบ (ผู้เล่นคนแรกเทิร์นแรกจั่วเพิ่มแทน)'],
    ['Main','ลงการ์ด อัญเชิญ Unit ใช้ความสามารถ Unit ที่ลงเทิร์นนี้ยังโจมตีไม่ได้'],
    ['Attack','ให้ Unit ที่ตั้งอยู่โจมตี โจมตีได้หลายครั้งถ้ามี Unit หลายใบ'],
    ['Ultimate','ใช้การ์ด Ultimate ถ้าเงื่อนไขครบ'],
    ['End','จบเทิร์น ส่งต่อให้อีกฝ่าย']
  ];
  const first=[
    'กดแท็บ "เล่น" เลือกโหมด "เล่นกับบอท" และเลือกเด็คตัวอย่างให้ทั้งสองฝั่ง',
    'กดเริ่มเกม ระบบจะแจกการ์ดให้ ดูมือของคุณที่ด้านล่างของจอ',
    'ใน Main Phase ลอง Invite Unit 1 ใบ โดยใช้ Element ธาตุตรงกับ Unit',
    'จบเทิร์น รอบอทเล่น แล้วเทิร์นถัดไป Unit ที่ลงไว้จะโจมตีได้',
    'เลือก Unit ที่ตั้งอยู่ กดโจมตี แล้วเลือกเป้าหมาย ถ้าฝั่งตรงข้ามไม่มี Unit ตั้งอยู่ ตีเข้า Avatar ได้เลย',
    'ลองเล่นจนจบเกม ถ้าสงสัยจุดไหน กดปุ่ม "กติกา" บนหน้าเกม หรือ "ส่งข้อเสนอแนะ" บอกเราได้'
  ];
  const kinds=[
    ['Avatar','ตัวแทนของคุณ มี HP 10 ถ้า HP เหลือ 0 คุณแพ้'],
    ['Unit','ตัวละครที่ลงสนามและโจมตี มีค่า ATK / DEF / CRI'],
    ['Equipment','อุปกรณ์ ติดกับ Unit ได้ 1 ใบ'],
    ['Domain','สนามพิเศษ มีได้ฝั่งละ 3 ใบ ห้ามชื่อซ้ำ'],
    ['Enchant','เวทที่วางใน Magic Area ได้ 3 ช่อง'],
    ['Ultimate','ไม้ตายที่ใช้ใน Ultimate Phase']
  ];
  return `${navHTML()}
  <div class="hero"><span class="ot-badge"><i></i>วิธีเล่น · สอนเล่นเบื้องต้น</span><h1>เริ่มเล่น AvastFall TCG ใน 5 นาที</h1><p class="muted">สรุปกติกาฉบับ Revised ที่เกมนี้ใช้ อ่านจบแล้วลองเล่นกับบอทได้ทันที ถ้าติดตรงไหนระหว่างเล่น กดปุ่ม "กติกา" บนหน้าเกมเปิดดูได้ตลอด</p><div class="ot-cta"><button class="btn pri" data-act="page" data-v="play">ไปลองเล่นเลย</button></div></div>
  ${videoHTML()}
  <section class="gd"><h2>1. เป้าหมายของเกม</h2><p>ใช้ Unit โจมตีให้ HP ของ Avatar ฝ่ายตรงข้ามจาก 10 เหลือ 0 ก่อน และระวังอย่าให้เด็คหลักของตัวเองหมด เพราะถ้าจั่วการ์ดประจำเทิร์นไม่ได้ คุณจะแพ้</p></section>
  <section class="gd"><h2>2. ชนิดของการ์ด</h2><div class="gd-grid">${kinds.map(([a,b])=>`<div class="note"><b>${a}</b><br>${b}</div>`).join('')}</div><p class="muted">เด็คหลัก 60 ใบ (รวม Avatar) ชื่อซ้ำได้ไม่เกิน 4 ใบ และมี Element Deck อีก 8 ใบ</p></section>
  <section class="gd"><h2>3. Element คือทรัพยากรของคุณ</h2><p>การ์ดส่วนใหญ่ต้องจ่ายด้วย Element แบ่งเป็น 2 แบบ</p><div class="gd-grid"><div class="note"><b>Invite (อัญเชิญ Unit)</b><br>ใช้ Element ธาตุตรงกับ Unit ตาม Cost</div><div class="note"><b>Spend (Enchant, Equipment, Domain, Ultimate)</b><br>ใช้ Element ธาตุไหนก็ได้</div></div><p class="muted">Element ที่ใช้แล้วจะนอน (Rest) และกลับมาตั้งอีกครั้งใน Start Phase ของเรา</p></section>
  <section class="gd"><h2>4. ลำดับในหนึ่งเทิร์น</h2><ol class="gd-phases">${phases.map(([a,b])=>`<li><b>${a}</b><span>${b}</span></li>`).join('')}</ol></section>
  <section class="gd"><h2>5. การโจมตี</h2><p>เลือก Unit ที่ตั้งอยู่ ให้มันนอน แล้วเลือกเป้าหมาย ถ้า ATK ของเราเท่ากับหรือมากกว่า DEF ของเป้า เป้าจะถูกทำลาย ถ้าน้อยกว่าจะไม่มีอะไรเกิดขึ้น</p><p>จะโจมตี Avatar ได้ต่อเมื่อฝ่ายตรงข้ามไม่มี Unit หรือ Unit ทุกใบนอนอยู่ ดาเมจที่ได้เท่ากับค่า CRI ของ Unit ที่โจมตี</p></section>
  <section class="gd"><h2>6. Counter ตอบโต้ในเทิร์นฝ่ายตรงข้าม</h2><p>ตอนที่ฝ่ายตรงข้ามประกาศโจมตี คุณใช้ความสามารถของ Unit หรือร่าย Spell ตอบโต้ได้ โดยใช้ Element ที่เหลือจากเทิร์นของตัวเอง ผลทำงานแบบใบสุดท้ายที่ใช้ทำก่อน</p></section>
  <section class="gd"><h2>7. ลองเล่นรอบแรก</h2><ol class="gd-first">${first.map(t=>`<li>${t}</li>`).join('')}</ol><div class="ot-cta"><button class="btn pri" data-act="page" data-v="play">เริ่มเล่นกับบอท</button> <button class="btn" data-act="feedback">ส่งข้อเสนอแนะ / แจ้งบั๊ก</button></div></section>`;
}
