import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

const canvas = document.querySelector("#scene");
const loading = document.querySelector("#loading");
const fallback = document.querySelector("#fallback");
const readerPanel = document.querySelector("#reader-panel");
const issueButtons = document.querySelector("#issue-buttons");
const hint = document.querySelector("#interaction-hint");
const issueIndex = document.querySelector("#issue-index");
const intro = document.querySelector(".intro");
const readerTitle = document.querySelector("#reader-title");
const readerIssue = document.querySelector("#reader-issue");
const readerExcerpt = document.querySelector("#reader-excerpt");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const issues = [
  {
    id: "001", issue: "NO. 001 · VOL. VII", date: "18 OCTOBER 1926", title: "The Princes Convene",
    headline: "SEVEN PRINCES, ONE CITY — AND NO AGREEMENT",
    deck: "An emergency convocation was called last night as the foundries fell silent and the eastern quarter prepared for another night under curfew.",
    excerpt: "The seven seats were occupied shortly after midnight. No statement was issued when the meeting ended, though the lights in the old council tower remained burning until dawn.",
    left: "The bells of the Assembly Hall began at eleven, though no public summons had been posted. By midnight, seven motorcars had passed through the iron gates, each bearing the colours of a different princely house. The city was asked to remain indoors. The city, as usual, did not listen.\n\nA short communiqué released at first light described the meeting as a routine review of municipal security. Workers leaving the Aorta found the gates closed and the tramlines empty. Several witnesses reported a column of smoke rising from the council tower, but the watchmen declined to comment.\n\nInside the foundries, the furnaces have been cold for three nights. The Guild of Engineers attributes the stoppage to a shortage of refined coal. The unions point to the recent arrests. Neither explanation accounts for the heavy wagons seen entering the lower vaults.",
    right: "A source close to the eastern household, speaking on condition of anonymity, suggested that the Princes were not called together to discuss the strike. The subject, our correspondent was told, concerned a sealed room beneath the old observatory and a name absent from the public registers.\n\nThe Gazette has been unable to verify this account. We can confirm only that the observatory has been closed to visitors, that its clocks have stopped, and that the constabulary has established a second perimeter around the hill.\n\nFor the present, citizens are advised to carry their papers, avoid the lower passages after dusk, and disregard rumours concerning the seventh bell. The municipal office assures us that there is no cause for alarm."
  },
  {
    id: "002", issue: "NO. 002 · VOL. VII", date: "21 OCTOBER 1926", title: "The Aorta Disappearances",
    headline: "THREE WORKERS MISSING BENEATH THE AORTA",
    deck: "A night shift failed to return from the municipal pressure tunnels. The authorities insist that no public danger exists.",
    excerpt: "Their lamps were found still burning beside a locked service door. A fourth worker says he heard a train moving beneath the foundations, on a line that does not appear on any city plan.",
    left: "Three municipal workers were reported missing after a maintenance party entered the old pressure tunnels shortly before the second bell on Tuesday. Their names have been withheld pending notification of their families. The foreman, who returned alone, was taken to the Senatorium for observation.\n\nThe official report describes a partial collapse in an abandoned service passage. Yet the lamps recovered at the scene were still lit, their glass unbroken and their wicks newly trimmed. A length of wet black ribbon was found tied around the nearest handrail.\n\nResidents of the Aorta district have complained of a low vibration beneath the cobbles. It is strongest after midnight and seems to follow the route of the disused railway. The tram authority denies that any underground service is operating.",
    right: "The Gazette spoke with a retired signalman who remembers a second railway, built before the city walls were completed. Its plans were withdrawn after an accident in the northern cutting. He claims that the line was never dismantled, merely sealed behind the brickwork.\n\nA constable stationed near the old pump house told our reporter that the missing men had been seen entering the tunnel with a fourth figure. The constable declined to describe the person and was transferred before his statement could be recorded.\n\nThe families have asked the city to continue the search. The municipal office has instead announced a temporary restriction on access to all service passages. Citizens are reminded that entering the tunnels is a punishable offence."
  },
  {
    id: "003", issue: "NO. 003 · SPECIAL EDITION", date: "31 OCTOBER 1926", title: "The Night Register",
    headline: "WHO WAS SEEN AT THE WINTER ASSEMBLY?",
    deck: "An invitation without a sender. A guest list with one name too many. A night that the official record says never happened.",
    excerpt: "The Assembly's published register lists forty-two guests. Three independent accounts describe a forty-third place at the high table, set with a black glass and a folded red napkin.",
    left: "The annual Winter Assembly concluded before dawn under circumstances that the Palace Press Office has called entirely ordinary. The guest register, released yesterday, records forty-two attendees and no incidents. This newspaper has obtained a copy of an earlier list containing a forty-third name, written in a hand not recognised by the clerks.\n\nThe discrepancy would be unremarkable were it not for the testimony of two musicians and a kitchen porter. Each recalls a place at the high table that remained untouched throughout the evening. Each describes the same black glass, the same red napkin, and a chair turned slightly away from the room.\n\nA palace spokesperson dismissed the accounts as an attempt to embarrass the household. The musicians have since withdrawn their statements. The porter cannot be located.",
    right: "A sealed envelope was delivered to the Gazette this morning. It contained a pressed flower, a strip of photographic negative, and a note bearing only the words: COUNT AGAIN. The negative appears to show the Assembly Hall from the musicians' gallery. In the reflection of the far window, a figure can be seen standing behind the high table.\n\nOur photographic editor has not been able to identify the figure. The Palace Press Office has requested the original negative and threatened legal action if it is reproduced. We have declined to surrender it.\n\nReaders who possess a copy of the original guest list are invited to contact the newsroom. Correspondence will be treated in confidence."
  },
  {
    id: "004", issue: "NO. 004 · VOL. VIII", date: "04 NOVEMBER 1926", title: "The Iron Choir",
    headline: "MIDNIGHT SONG REPORTED IN THE LOWER FOUNDRY",
    deck: "Residents describe a chorus beneath the factory floor. The company says the building has been empty for eleven years.",
    excerpt: "A recording made from the street contains a sequence of notes, followed by what sounds like a roll call. One of the names belongs to a living member of the City Council.",
    left: "For eleven years, the Lower Foundry has stood behind a wall of corrugated iron, its windows bricked and its doors chained. On Wednesday night, residents of three adjoining streets reported hearing singing from beneath the floor. The sound began at twelve minutes past midnight and continued for precisely seven minutes.\n\nA local watchmaker recorded the final minute on a wax cylinder. The recording contains a low mechanical rhythm, a chorus of voices, and a series of names spoken in unison. The first six are difficult to distinguish. The seventh is perfectly clear.\n\nThe name belongs to a councillor who was photographed at a public reception on the same evening. The councillor's office has described the recording as a forgery and requested that the cylinder be destroyed.",
    right: "The Gazette has listened to the recording twice. It is not possible to determine how many voices are present. The rhythm resembles the old furnace sequence used to test pressure valves, although the plant has been disconnected from the municipal grid for more than a decade.\n\nA former engineer believes the sound could travel through the abandoned ventilation shafts. He also notes that the shafts were sealed with poured concrete, a procedure that would make the reported volume impossible.\n\nThe city has issued no new safety notice. Residents are advised to keep windows closed after midnight and to report any further singing to the district watch."
  },
  {
    id: "005", issue: "NO. 005 · THE ASTRAL REVIEW", date: "12 NOVEMBER 1926", title: "The Astral Review",
    headline: "A SECOND MOON OVER THE EASTERN QUARTER?",
    deck: "Photographers disagree about the light above the rooftops. The observatory has refused to publish its latest measurements.",
    excerpt: "For seventeen minutes, witnesses saw a pale disc above the chimneys. It appeared in wet glass and polished metal, but not in the sky photographed from the western hills.",
    left: "Reports of a second moon began arriving at the newsroom shortly after the first frost. At first, the accounts were dismissed as reflections from the gasworks. The witnesses, however, describe a disc that remained visible when the lamps were extinguished and the shutters closed.\n\nThree photographs have been submitted for examination. In each, the disc appears above the same group of chimneys. The plates were made with different cameras and at different times. None shows the object when viewed from beyond the eastern wall.\n\nThe Royal Observatory has declined to comment. A clerk, speaking privately, says that the instruments registered a shadow crossing the city from below rather than above.",
    right: "The phenomenon has produced a lively market in protective lenses, silvered mirrors and bottled night air. Several vendors have been fined for selling counterfeit charms. The Society for Practical Astronomy has advised the public not to look directly at the disc, though it has not explained what harm such an act might cause.\n\nA note delivered to this office bears the observatory seal and a warning in red ink: THE SKY IS NOT THE SOURCE. The handwriting has not been identified.\n\nThis edition will be distributed only in the eastern districts. Readers elsewhere may request a copy through the usual booksellers, provided they are prepared to wait."
  },
  {
    id: "006", issue: "NO. 006 · SUNDAY SUPPLEMENT", date: "21 NOVEMBER 1926", title: "The Sunday Supplement",
    headline: "A CITY GUIDE FOR THE CURIOUS AND THE CAREFUL",
    deck: "Restaurants, theatres, public houses and the smaller places one ought not to find without an introduction.",
    excerpt: "A practical guide to the city's public rooms, private clubs and the streets best avoided after the last tram.",
    left: "The winter visitor will find Heartwell a city of fine contradictions. Its avenues are broad, its stonework severe, and its public squares are often empty even on market days. The visitor should begin in the Crown district, where the principal hotels offer warm rooms and a respectable view of the river.\n\nThose seeking entertainment may prefer the Aorta, where the theatres remain open late and the music halls rarely ask a second question. The old quarter offers quieter pleasures: antiquarian bookshops, private reading rooms and a modest collection of curiosities in the former customs house.\n\nThe city's trams are reliable before dusk. After that hour, routes may change without notice. Visitors are advised to keep a printed timetable and to ask a uniformed official before boarding any carriage marked with a white lantern.",
    right: "A word about the public houses. The Copper Saint serves an excellent dark ale, though the proprietor has an unfortunate habit of closing the doors when strangers enter. The Lantern Room is more welcoming but should be avoided on Thursdays, when the upstairs rooms are reserved.\n\nThe municipal gardens are open until the second bell. The cemetery gates are not. The river walk is beautiful in clear weather and treacherous when the fog settles. A local guide may be hired from the steps of the central station, but references should be requested before payment.\n\nHeartwell rewards the curious, provided they remember that not every door is intended to open."
  }
];

let renderer, scene, camera, controls, cabinet, raycaster, mouse, dust;
let issueObjects = [];
let state = "room";
let activeIssue = null;
let spread = null;
let animationStart = 0;
let pointerDown = null;
let hoveredIssue = null;
let cameraStartPosition = new THREE.Vector3();
let cameraEndPosition = new THREE.Vector3();
let cameraStartTarget = new THREE.Vector3();
let cameraEndTarget = new THREE.Vector3();
const roomCameraPosition = new THREE.Vector3(0, 3.35, 10.6);
const roomCameraTarget = new THREE.Vector3(0, 2.15, -1.85);
const openCameraPosition = new THREE.Vector3(0, 2.3, 7.45);
const openCameraTarget = new THREE.Vector3(0, 2.05, 0.5);
const clock = new THREE.Clock();

function box(parent, size, position, material, cast = true, receive = true) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(size[0], size[1], size[2]), material);
  mesh.position.set(position[0], position[1], position[2]);
  mesh.castShadow = cast;
  mesh.receiveShadow = receive;
  parent.add(mesh);
  return mesh;
}

function canvasTexture(draw, width = 1024, height = 1400) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  draw(ctx, width, height);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = renderer ? renderer.capabilities.getMaxAnisotropy() : 4;
  texture.needsUpdate = true;
  return texture;
}

function woodTexture(base, grain) {
  return canvasTexture((ctx, w, h) => {
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 140; i++) {
      const y = (i / 140) * h + Math.sin(i * 1.7) * 5;
      ctx.strokeStyle = i % 7 === 0 ? "rgba(8,5,3,.28)" : grain;
      ctx.lineWidth = i % 7 === 0 ? 3 : 1;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.bezierCurveTo(w * .24, y + Math.sin(i) * 8, w * .7, y - Math.cos(i * 2) * 7, w, y + Math.sin(i * 1.3) * 5);
      ctx.stroke();
    }
  }, 512, 512);
}

function floorTexture() {
  return canvasTexture((ctx, w, h) => {
    ctx.fillStyle = "#28221c";
    ctx.fillRect(0, 0, w, h);
    const plankH = h / 8;
    for (let row = 0; row < 8; row++) {
      const y = row * plankH;
      ctx.fillStyle = row % 2 ? "#30271f" : "#352b21";
      ctx.fillRect(0, y, w, plankH - 3);
      ctx.strokeStyle = "rgba(9,7,5,.7)";
      ctx.lineWidth = 4;
      ctx.beginPath(); ctx.moveTo(0, y + plankH); ctx.lineTo(w, y + plankH); ctx.stroke();
      for (let c = 0; c < 8; c++) {
        const x = ((c + (row % 2) * .5) / 8) * w;
        ctx.fillStyle = "rgba(10,8,6,.4)";
        ctx.fillRect(x, y, 2, plankH - 4);
        for (let k = 0; k < 11; k++) {
          ctx.strokeStyle = "rgba(196,147,93,.045)";
          ctx.lineWidth = 1;
          const yy = y + (k / 11) * plankH;
          ctx.beginPath();
          ctx.moveTo(x + 4, yy); ctx.lineTo(Math.min(w, x + w / 8 - 5), yy + Math.sin(k * 2 + c) * 2); ctx.stroke();
        }
      }
    }
  }, 1024, 1024);
}

function drawWrapped(ctx, text, x, y, maxWidth, lineHeight, maxLines = 99) {
  const words = text.split(/\s+/);
  let line = "";
  let lines = 0;
  for (let i = 0; i < words.length; i++) {
    const next = line ? line + " " + words[i] : words[i];
    if (ctx.measureText(next).width > maxWidth && line) {
      ctx.fillText(line, x, y);
      y += lineHeight;
      lines++;
      line = words[i];
      if (lines >= maxLines) return y;
    } else line = next;
  }
  if (line && lines < maxLines) {
    ctx.fillText(line, x, y);
    y += lineHeight;
  }
  return y;
}

function drawParagraphs(ctx, text, x, y, maxWidth, lineHeight, maxLines) {
  const paragraphs = text.split("\n\n");
  let lines = 0;
  for (const paragraph of paragraphs) {
    const before = y;
    y = drawWrapped(ctx, paragraph, x, y, maxWidth, lineHeight, maxLines - lines);
    lines += Math.round((y - before) / lineHeight);
    y += 18;
    if (lines >= maxLines) break;
  }
  return y;
}

function drawPaperBase(ctx, w, h) {
  ctx.fillStyle = "#eee4cf";
  ctx.fillRect(0, 0, w, h);
  const gradient = ctx.createLinearGradient(0, 0, w, h);
  gradient.addColorStop(0, "rgba(255,255,255,.34)");
  gradient.addColorStop(.55, "rgba(255,255,255,0)");
  gradient.addColorStop(1, "rgba(112,78,43,.12)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, w, h);
  for (let i = 0; i < 230; i++) {
    const x = (i * 127.31 % w);
    const y = (i * 311.17 % h);
    ctx.fillStyle = i % 2 ? "rgba(92,67,42,.045)" : "rgba(255,255,255,.13)";
    ctx.fillRect(x, y, 2 + (i % 3), 2 + (i % 2));
  }
  ctx.strokeStyle = "rgba(79,55,35,.4)";
  ctx.lineWidth = 3;
  ctx.strokeRect(25, 24, w - 50, h - 48);
}

function makeCoverTexture(issue) {
  return canvasTexture((ctx, w, h) => {
    drawPaperBase(ctx, w, h);
    ctx.fillStyle = "#8f302a";
    ctx.fillRect(38, 42, w - 76, 13);
    ctx.font = "500 25px 'DM Mono', monospace";
    ctx.textAlign = "center";
    ctx.fillStyle = "#5d3328";
    ctx.fillText("HEARTWELL · CITY EDITION", w / 2, 91);
    ctx.font = "700 72px 'Cormorant Garamond', serif";
    ctx.fillStyle = "#762d27";
    ctx.fillText(issue.id === "005" ? "THE ASTRAL" : "THE HEARTWELL", w / 2, 180);
    ctx.font = "700 82px 'Cormorant Garamond', serif";
    ctx.fillText(issue.id === "005" ? "REVIEW" : "GAZETTE", w / 2, 258);
    ctx.fillStyle = "#302820";
    ctx.fillRect(90, 287, w - 180, 2);
    ctx.font = "500 22px 'DM Mono', monospace";
    ctx.fillStyle = "#7d342c";
    ctx.fillText(issue.issue + "    /    " + issue.date, w / 2, 330);
    ctx.textAlign = "left";
    ctx.font = "700 72px 'IM Fell English', serif";
    ctx.fillStyle = "#211f1b";
    const words = issue.headline.split(" ");
    let lines = [], line = "";
    for (const word of words) {
      const next = line ? line + " " + word : word;
      if (ctx.measureText(next).width > w - 150 && line) { lines.push(line); line = word; }
      else line = next;
    }
    if (line) lines.push(line);
    let y = 465;
    lines.slice(0, 4).forEach((part) => { ctx.fillText(part, 83, y); y += 82; });
    ctx.font = "italic 31px 'Cormorant Garamond', serif";
    ctx.fillStyle = "#5a5145";
    drawWrapped(ctx, issue.deck, 84, y + 9, w - 168, 38, 4);
    const top = y + 190;
    ctx.fillStyle = "#382f27";
    ctx.fillRect(82, top, w - 164, 2);
    ctx.fillStyle = "#8e302a";
    ctx.fillRect(82, top + 18, 18, 18);
    ctx.font = "500 20px 'DM Mono', monospace";
    ctx.fillStyle = "#6e332c";
    ctx.fillText("LATEST DISPATCHES FROM THE CITY", 116, top + 34);
    ctx.font = "italic 39px 'Cormorant Garamond', serif";
    ctx.fillStyle = "#29231d";
    ctx.fillText(issue.title.toUpperCase(), 84, top + 115);
    ctx.fillStyle = "#8e302a";
    ctx.fillRect(82, h - 150, w - 164, 3);
    ctx.font = "500 19px 'DM Mono', monospace";
    ctx.fillStyle = "#6e5a42";
    ctx.textAlign = "center";
    ctx.fillText("PRINTED IN HEARTWELL   ✦   PRICE: 2 CROWNS", w / 2, h - 100);
  });
}

function makePageTexture(issue, side) {
  return canvasTexture((ctx, w, h) => {
    drawPaperBase(ctx, w, h);
    const margin = 68;
    ctx.fillStyle = "#8d3029";
    ctx.fillRect(margin, 55, w - margin * 2, 5);
    ctx.font = "500 20px 'DM Mono', monospace";
    ctx.fillStyle = "#7c352d";
    ctx.textAlign = "left";
    ctx.fillText("THE HEARTWELL GAZETTE", margin, 92);
    ctx.textAlign = "right";
    ctx.fillText(issue.date + "   ·   " + issue.issue, w - margin, 92);
    ctx.fillStyle = "#5c5142";
    ctx.fillRect(margin, 112, w - margin * 2, 2);
    if (side === "left") {
      ctx.textAlign = "left";
      ctx.font = "700 75px 'IM Fell English', serif";
      ctx.fillStyle = "#28231d";
      let y = drawWrapped(ctx, issue.headline, margin, 225, w - margin * 2, 79, 3);
      ctx.font = "italic 32px 'Cormorant Garamond', serif";
      ctx.fillStyle = "#665847";
      y = drawWrapped(ctx, issue.deck, margin, y + 17, w - margin * 2, 37, 4);
      const imageY = y + 32;
      const imageH = 300;
      ctx.fillStyle = "#262a29";
      ctx.fillRect(margin, imageY, w - margin * 2, imageH);
      const sky = ctx.createLinearGradient(0, imageY, 0, imageY + imageH);
      sky.addColorStop(0, "#333c3c");
      sky.addColorStop(1, "#111615");
      ctx.fillStyle = sky;
      ctx.fillRect(margin, imageY, w - margin * 2, imageH);
      ctx.fillStyle = "#151717";
      for (let i = 0; i < 15; i++) {
        const x = margin + i * 58;
        const bh = 85 + ((i * 43) % 155);
        ctx.fillRect(x, imageY + imageH - bh, 45, bh);
        ctx.fillStyle = "#b18a55";
        for (let j = 0; j < 5; j++) ctx.fillRect(x + 8 + (j % 2) * 17, imageY + imageH - bh + 14 + j * 24, 5, 9);
        ctx.fillStyle = "#151717";
      }
      ctx.fillStyle = "rgba(179,142,91,.55)";
      ctx.fillRect(margin, imageY + imageH - 5, w - margin * 2, 5);
      ctx.font = "italic 20px 'Cormorant Garamond', serif";
      ctx.fillStyle = "#655846";
      ctx.fillText("A view of the city shortly before the second bell.", margin, imageY + imageH + 28);
      const textY = imageY + imageH + 76;
      ctx.strokeStyle = "rgba(82,61,42,.45)";
      ctx.beginPath(); ctx.moveTo(w / 2, textY - 19); ctx.lineTo(w / 2, h - 95); ctx.stroke();
      ctx.font = "24px 'Cormorant Garamond', serif";
      ctx.fillStyle = "#302a23";
      drawParagraphs(ctx, issue.left, margin, textY, 390, 28, 17);
    } else {
      ctx.textAlign = "left";
      ctx.font = "500 22px 'DM Mono', monospace";
      ctx.fillStyle = "#8f302a";
      ctx.fillText("FROM THE EDITOR", margin, 180);
      ctx.font = "italic 43px 'Cormorant Garamond', serif";
      ctx.fillStyle = "#29231e";
      let y = drawWrapped(ctx, issue.excerpt, margin, 242, w - margin * 2, 50, 5);
      ctx.fillStyle = "#8c302a";
      ctx.fillRect(margin, y + 6, w - margin * 2, 3);
      const colTop = y + 58;
      ctx.strokeStyle = "rgba(82,61,42,.4)";
      ctx.beginPath(); ctx.moveTo(w / 2, colTop); ctx.lineTo(w / 2, h - 320); ctx.stroke();
      ctx.font = "25px 'Cormorant Garamond', serif";
      ctx.fillStyle = "#302a23";
      drawParagraphs(ctx, issue.right, margin, colTop, 390, 29, 23);
      ctx.fillStyle = "#8f302a";
      ctx.fillRect(margin, h - 275, w - margin * 2, 2);
      ctx.font = "500 21px 'DM Mono', monospace";
      ctx.fillText("ALSO IN THIS ISSUE", margin, h - 235);
      ctx.font = "italic 29px 'Cormorant Garamond', serif";
      ctx.fillStyle = "#302a23";
      ctx.fillText("The municipal watch changes its route", margin, h - 182);
      ctx.fillText("A new notice appears at the eastern gate", margin, h - 137);
      ctx.fillText("Letters from readers · page four", margin, h - 92);
    }
    ctx.textAlign = "right";
    ctx.font = "500 18px 'DM Mono', monospace";
    ctx.fillStyle = "#846d4d";
    ctx.fillText(side === "left" ? "02" : "03", w - 65, h - 58);
  });
}

function addRoom() {
  scene.background = new THREE.Color("#151515");
  scene.fog = new THREE.FogExp2("#171614", 0.024);
  const floorMap = floorTexture();
  floorMap.wrapS = floorMap.wrapT = THREE.RepeatWrapping;
  floorMap.repeat.set(2, 2);
  const floorMat = new THREE.MeshStandardMaterial({ map: floorMap, roughness: .9 });
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(30, 30), floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -.03;
  floor.receiveShadow = true;
  scene.add(floor);
  const wallMap = woodTexture("#24201b", "rgba(170,133,91,.07)");
  const wallMat = new THREE.MeshStandardMaterial({ map: wallMap, color: "#9b8e79", roughness: .98 });
  box(scene, [16, 7.2, .22], [0, 3.55, -4.35], wallMat, false);
  box(scene, [.22, 7.2, 15], [-7.9, 3.55, 3], wallMat, false);
  box(scene, [.22, 7.2, 15], [7.9, 3.55, 3], wallMat, false);
  for (let x = -7.4; x <= 7.4; x += .7) {
    box(scene, [.012, 6.8, .012], [x, 3.5, -4.2], new THREE.MeshStandardMaterial({ color: "#5a4b3a", roughness: 1 }), false, false);
  }
  const rugMat = new THREE.MeshStandardMaterial({ color: "#4b2520", roughness: 1 });
  const rug = new THREE.Mesh(new THREE.PlaneGeometry(8.2, 5.2), rugMat);
  rug.rotation.x = -Math.PI / 2; rug.position.set(0, .012, 2.1); rug.receiveShadow = true; scene.add(rug);
  const rugBorder = new THREE.Mesh(new THREE.PlaneGeometry(7.85, 4.85), new THREE.MeshStandardMaterial({ color: "#7a5b39", roughness: 1, side: THREE.DoubleSide }));
  rugBorder.rotation.x = -Math.PI / 2; rugBorder.position.set(0, .02, 2.1); scene.add(rugBorder);
  const rugInner = new THREE.Mesh(new THREE.PlaneGeometry(7.58, 4.58), rugMat);
  rugInner.rotation.x = -Math.PI / 2; rugInner.position.set(0, .026, 2.1); scene.add(rugInner);
  addWindow(); addWallDecor(); addCabinet(); addSideTable(); addDust();
}

function addWindow() {
  const w = 2.35, h = 3.3, x = -5.4, y = 3.05, z = -4.18;
  const cityTexture = canvasTexture((ctx, cw, ch) => {
    const g = ctx.createLinearGradient(0, 0, 0, ch);
    g.addColorStop(0, "#1f3037"); g.addColorStop(.55, "#425056"); g.addColorStop(1, "#151a1b");
    ctx.fillStyle = g; ctx.fillRect(0, 0, cw, ch);
    ctx.fillStyle = "rgba(199,190,166,.13)";
    for (let i = 0; i < 16; i++) {
      const bx = i * 60 + 10, bh = 170 + ((i * 97) % 300);
      ctx.fillRect(bx, ch - bh, 43, bh);
      ctx.fillStyle = "#a98a58";
      for (let j = 0; j < 18; j++) {
        if ((i + j) % 3 !== 0) ctx.fillRect(bx + 8 + (j % 3) * 10, ch - bh + 10 + Math.floor(j / 3) * 22, 3, 6);
      }
      ctx.fillStyle = "rgba(199,190,166,.13)";
    }
    ctx.fillStyle = "rgba(196,190,173,.16)"; ctx.fillRect(0, ch * .61, cw, 2);
    ctx.fillStyle = "rgba(195,190,176,.1)"; ctx.fillRect(0, ch * .66, cw, 8);
  });
  const glass = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: cityTexture, color: "#b9b3a2" }));
  glass.position.set(x, y, z); scene.add(glass);
  const frame = new THREE.MeshStandardMaterial({ color: "#30251d", roughness: .72, metalness: .1 });
  box(scene, [.15, h + .28, .18], [x - w / 2, y, z + .03], frame);
  box(scene, [.15, h + .28, .18], [x + w / 2, y, z + .03], frame);
  box(scene, [w + .3, .16, .18], [x, y + h / 2, z + .03], frame);
  box(scene, [w + .3, .16, .18], [x, y - h / 2, z + .03], frame);
  box(scene, [.08, h, .12], [x, y, z + .04], frame, false, false);
  box(scene, [w, .08, .12], [x, y, z + .04], frame, false, false);
  const sill = new THREE.MeshStandardMaterial({ color: "#5a4634", roughness: .8 });
  box(scene, [w + .55, .16, .5], [x, y - h / 2 - .1, z + .18], sill);
  const glow = new THREE.PointLight("#91a9b5", 1.15, 8);
  glow.position.set(x, y, z + 1.1); scene.add(glow);
}

function addWallDecor() {
  const frameMat = new THREE.MeshStandardMaterial({ color: "#4a3828", roughness: .7, metalness: .22 });
  const canvasMat = new THREE.MeshStandardMaterial({ color: "#6a604e", roughness: 1 });
  for (const x of [4.8, 6.15]) {
    box(scene, [.82, 1.13, .1], [x, 3.75, -4.15], frameMat);
    box(scene, [.68, .98, .03], [x, 3.75, -4.08], canvasMat, false, false);
  }
  const plaque = new THREE.MeshStandardMaterial({ color: "#8b6a3d", roughness: .45, metalness: .55 });
  box(scene, [1.1, .26, .08], [0, 4.95, -4.13], plaque);
}

function addCabinet() {
  cabinet = new THREE.Group();
  cabinet.position.set(0, 0, -2.65);
  scene.add(cabinet);
  const woodMap = woodTexture("#3c271a", "rgba(205,155,99,.12)");
  woodMap.wrapS = woodMap.wrapT = THREE.RepeatWrapping;
  woodMap.repeat.set(2, 2);
  const wood = new THREE.MeshStandardMaterial({ map: woodMap, color: "#a98a65", roughness: .82 });
  const darkWood = new THREE.MeshStandardMaterial({ map: woodMap, color: "#65503a", roughness: .92 });
  const back = new THREE.MeshStandardMaterial({ color: "#201b16", roughness: 1 });
  const brass = new THREE.MeshStandardMaterial({ color: "#987348", metalness: .72, roughness: .32 });
  const innerGlow = new THREE.PointLight("#e8b66c", 2.1, 8);
  innerGlow.position.set(0, 3.6, -.9); cabinet.add(innerGlow);
  box(cabinet, [7.45, 4.65, .18], [0, 2.4, -.52], back, false);
  box(cabinet, [.24, 4.7, 1.22], [-3.6, 2.4, 0], wood);
  box(cabinet, [.24, 4.7, 1.22], [3.6, 2.4, 0], wood);
  box(cabinet, [7.45, .24, 1.22], [0, .18, 0], wood);
  box(cabinet, [7.45, .22, 1.22], [0, 4.72, 0], wood);
  box(cabinet, [7.45, .11, 1.22], [0, 4.48, 0], darkWood);
  for (const x of [-1.2, 1.2]) box(cabinet, [.17, 4.42, 1.1], [x, 2.43, 0], wood);
  for (const y of [1.55, 2.98]) {
    box(cabinet, [7.16, .14, 1.12], [0, y, 0], wood);
    box(cabinet, [7.18, .08, .12], [0, y - .03, .59], brass);
  }
  box(cabinet, [7.55, .09, 1.28], [0, 4.83, .02], brass);
  box(cabinet, [7.55, .09, 1.28], [0, .08, .02], brass);
  for (const x of [-3.48, 3.48]) for (const y of [.42, 4.35]) {
    const pin = new THREE.Mesh(new THREE.SphereGeometry(.045, 12, 8), brass);
    pin.position.set(x, y, .63); cabinet.add(pin);
  }
  const locations = [[-2.38, .99], [0, .99], [2.38, .99], [-2.38, 2.35], [0, 2.35], [2.38, 2.35]];
  issues.forEach((issue, index) => createFoldedIssue(issue, locations[index][0], locations[index][1]));
  const bookColors = ["#582a26", "#283b3a", "#6b5235", "#31302b", "#6c3029"];
  for (let i = 0; i < 5; i++) {
    const book = box(cabinet, [.28, .85 + (i % 2) * .12, .36], [-2.95 + i * .33, 3.72 + (i % 2) * .06, .16],
      new THREE.MeshStandardMaterial({ color: bookColors[i], roughness: .85 }));
    book.rotation.z = (i - 2) * .035;
    box(cabinet, [.22, .018, .37], [-2.95 + i * .33, 3.35 + (i % 2) * .06, .16], brass, false, false);
  }
  const clockGroup = new THREE.Group();
  clockGroup.position.set(2.3, 3.72, .28); cabinet.add(clockGroup);
  const clockBody = new THREE.Mesh(new THREE.CylinderGeometry(.38, .38, .12, 48), brass);
  clockBody.rotation.x = Math.PI / 2; clockGroup.add(clockBody);
  const clockFace = new THREE.Mesh(new THREE.CircleGeometry(.32, 48), new THREE.MeshStandardMaterial({ color: "#d5c6a5", roughness: .8 }));
  clockFace.position.z = .071; clockGroup.add(clockFace);
  const handMat = new THREE.MeshBasicMaterial({ color: "#3a2920" });
  const hand1 = new THREE.Mesh(new THREE.BoxGeometry(.018, .23, .012), handMat);
  hand1.position.set(0, .07, .09); hand1.rotation.z = -.5; clockGroup.add(hand1);
  const hand2 = new THREE.Mesh(new THREE.BoxGeometry(.018, .16, .012), handMat);
  hand2.position.set(.055, .015, .092); hand2.rotation.z = 1; clockGroup.add(hand2);
  addCabinetLamp(cabinet, -1.9, 3.55, .3);
}

function addCabinetLamp(parent, x, y, z) {
  const metal = new THREE.MeshStandardMaterial({ color: "#aa8149", metalness: .72, roughness: .32 });
  const shade = new THREE.MeshStandardMaterial({ color: "#d5a85e", emissive: "#6d3d13", emissiveIntensity: .8, roughness: .5 });
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(.035, .06, .4, 16), metal);
  stem.position.set(x, y - .2, z); parent.add(stem);
  const base = new THREE.Mesh(new THREE.CylinderGeometry(.18, .22, .07, 24), metal);
  base.position.set(x, y - .39, z); parent.add(base);
  const shadeMesh = new THREE.Mesh(new THREE.ConeGeometry(.26, .23, 24, 1, true), shade);
  shadeMesh.position.set(x, y + .04, z); shadeMesh.rotation.x = Math.PI; parent.add(shadeMesh);
  const bulb = new THREE.PointLight("#f0b85f", 1.4, 3);
  bulb.position.set(x, y - .02, z + .1); parent.add(bulb);
}

function createFoldedIssue(issue, x, y) {
  const group = new THREE.Group();
  group.position.set(x, y, -.02);
  group.rotation.y = (x < 0 ? 1 : -1) * .045;
  group.rotation.x = -.035;
  group.userData.issue = issue;
  const paperSide = new THREE.MeshStandardMaterial({ color: "#d6c6a8", roughness: .98 });
  const body = new THREE.Mesh(new THREE.BoxGeometry(.72, .98, .055), paperSide);
  body.castShadow = true; body.receiveShadow = true; group.add(body);
  const coverMaterial = new THREE.MeshStandardMaterial({
    map: makeCoverTexture(issue), roughness: .94, metalness: 0, emissive: "#20100a", emissiveIntensity: .08
  });
  const cover = new THREE.Mesh(new THREE.PlaneGeometry(.72, .98), coverMaterial);
  cover.position.z = .029; cover.userData.issueRoot = group; group.add(cover);
  const spine = new THREE.Mesh(new THREE.BoxGeometry(.035, .98, .065), new THREE.MeshStandardMaterial({ color: "#8c342c", roughness: .9 }));
  spine.position.x = -.355; spine.position.z = .006; group.add(spine);
  cabinet.add(group);
  issueObjects.push(group);
  return group;
}

function addSideTable() {
  const table = new THREE.Group();
  table.position.set(5.55, 0, .3); scene.add(table);
  const wood = new THREE.MeshStandardMaterial({ color: "#3f2c20", roughness: .82 });
  const brass = new THREE.MeshStandardMaterial({ color: "#997448", metalness: .65, roughness: .34 });
  box(table, [1.45, .14, 1.0], [0, 1.0, 0], wood);
  for (const x of [-.58, .58]) for (const z of [-.36, .36]) box(table, [.11, 1, .11], [x, .5, z], wood);
  box(table, [1.4, .08, .95], [0, .28, 0], brass);
  const book = box(table, [.58, .07, .42], [-.15, 1.12, 0], new THREE.MeshStandardMaterial({ color: "#712e28", roughness: .9 }));
  book.rotation.y = -.12;
  const cup = new THREE.Mesh(new THREE.CylinderGeometry(.12, .1, .18, 24), new THREE.MeshStandardMaterial({ color: "#b4a58b", roughness: .35 }));
  cup.position.set(.42, 1.2, .15); table.add(cup);
}

function addDust() {
  const count = 430;
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - .5) * 13;
    positions[i * 3 + 1] = Math.random() * 5.3 + .2;
    positions[i * 3 + 2] = (Math.random() - .5) * 9 - 1.2;
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  const material = new THREE.PointsMaterial({ color: "#d4b783", size: .018, transparent: true, opacity: .35, depthWrite: false });
  dust = new THREE.Points(geometry, material); scene.add(dust);
}

function createSpread(issue, sourcePosition) {
  const group = new THREE.Group();
  group.position.copy(sourcePosition); group.scale.setScalar(.08); scene.add(group);
  const pageWidth = 1.42, pageHeight = 1.92;
  const leftTexture = makePageTexture(issue, "left");
  const rightTexture = makePageTexture(issue, "right");
  const pageMaterialLeft = new THREE.MeshStandardMaterial({ map: leftTexture, roughness: .98, side: THREE.DoubleSide });
  const pageMaterialRight = new THREE.MeshStandardMaterial({ map: rightTexture, roughness: .98, side: THREE.DoubleSide });
  const leftHinge = new THREE.Group(), rightHinge = new THREE.Group();
  leftHinge.position.set(0, 0, .02); rightHinge.position.set(0, 0, .025);
  group.add(leftHinge, rightHinge);
  const leftPage = new THREE.Mesh(new THREE.PlaneGeometry(pageWidth, pageHeight), pageMaterialLeft);
  leftPage.position.x = -pageWidth / 2; leftPage.castShadow = true; leftHinge.add(leftPage);
  const rightPage = new THREE.Mesh(new THREE.PlaneGeometry(pageWidth, pageHeight), pageMaterialRight);
  rightPage.position.x = pageWidth / 2; rightPage.castShadow = true; rightHinge.add(rightPage);
  const cover = new THREE.Mesh(new THREE.PlaneGeometry(pageWidth, pageHeight), new THREE.MeshStandardMaterial({
    map: makeCoverTexture(issue), roughness: .95, side: THREE.DoubleSide, transparent: true, opacity: 1
  }));
  cover.position.set(pageWidth / 2, 0, .095); group.add(cover);
  const spine = new THREE.Mesh(new THREE.BoxGeometry(.035, pageHeight, .045), new THREE.MeshStandardMaterial({ color: "#8f302a", roughness: .9 }));
  spine.position.set(0, 0, .055); group.add(spine);
  for (let i = 0; i < 4; i++) {
    const edge = new THREE.Mesh(new THREE.BoxGeometry(pageWidth * 2, .012, .012), new THREE.MeshStandardMaterial({ color: i % 2 ? "#d6c6a8" : "#e7dcc8", roughness: 1 }));
    edge.position.set(0, -pageHeight / 2 + .035 + i * .012, -.015 - i * .006); group.add(edge);
  }
  return { group, leftHinge, rightHinge, cover, sourcePosition: sourcePosition.clone(), targetPosition: new THREE.Vector3(0, 2.15, 2.42) };
}

function easeInOut(t) {
  return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function startOpen(issueObject) {
  if (state !== "room") return;
  activeIssue = issueObject;
  const issue = issueObject.userData.issue;
  const source = issueObject.getWorldPosition(new THREE.Vector3());
  spread = createSpread(issue, source);
  state = "opening"; animationStart = performance.now();
  cameraStartPosition.copy(camera.position); cameraEndPosition.copy(openCameraPosition);
  cameraStartTarget.copy(controls.target); cameraEndTarget.copy(openCameraTarget);
  controls.enabled = false;
  hint.style.opacity = "0";
  issueIndex.style.opacity = "0"; issueIndex.style.pointerEvents = "none";
  intro.style.opacity = "0";
  document.querySelector("#scene-title").textContent = "An issue from the archive";
  document.querySelector("#scene-copy").textContent = "The paper has been handled, folded and kept.";
}

function updateSpread(progress, closing = false) {
  const t = easeInOut(progress);
  const cameraT = closing ? 1 - t : t;
  spread.group.position.lerpVectors(spread.sourcePosition, spread.targetPosition, t);
  spread.group.scale.setScalar(.08 + t * 1.12);
  spread.group.rotation.set(0, 0, Math.sin(t * Math.PI) * -.025);
  const foldAngle = (1 - t) * Math.PI / 2;
  spread.leftHinge.rotation.y = foldAngle;
  spread.rightHinge.rotation.y = -foldAngle;
  spread.cover.material.opacity = Math.max(0, 1 - Math.max(0, (t - .55) / .25));
  spread.cover.visible = t < .8;
  spread.leftHinge.visible = t > .23;
  spread.rightHinge.visible = t > .23;
  activeIssue.visible = t < .38;
  camera.position.lerpVectors(cameraStartPosition, cameraEndPosition, cameraT);
  controls.target.lerpVectors(cameraStartTarget, cameraEndTarget, cameraT);
  controls.update();
}

function finishOpen() {
  state = "open";
  spread.group.position.copy(spread.targetPosition);
  spread.group.scale.setScalar(1.2);
  spread.leftHinge.rotation.y = 0; spread.rightHinge.rotation.y = 0;
  spread.cover.visible = false; activeIssue.visible = false;
  readerTitle.textContent = activeIssue.userData.issue.headline;
  readerIssue.textContent = activeIssue.userData.issue.issue + " · " + activeIssue.userData.issue.date;
  readerExcerpt.textContent = activeIssue.userData.issue.excerpt;
  readerPanel.hidden = false;
  document.querySelector("#scene-title").textContent = activeIssue.userData.issue.title;
  document.querySelector("#scene-copy").textContent = "A printed account. Not necessarily the whole truth.";
}

function startClose() {
  if (state !== "open") return;
  state = "closing"; animationStart = performance.now();
  cameraStartPosition.copy(camera.position); cameraEndPosition.copy(roomCameraPosition);
  cameraStartTarget.copy(controls.target); cameraEndTarget.copy(roomCameraTarget);
  readerPanel.hidden = true;
}

function finishClose() {
  if (spread) {
    scene.remove(spread.group);
    spread.group.traverse((obj) => {
      if (obj.isMesh && obj.material) {
        const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
        mats.forEach((mat) => { if (mat.map) mat.map.dispose(); mat.dispose(); });
      }
    });
    spread = null;
  }
  if (activeIssue) activeIssue.visible = true;
  activeIssue = null; state = "room"; controls.enabled = true;
  controls.target.copy(roomCameraTarget); camera.position.copy(roomCameraPosition); controls.update();
  hint.style.opacity = "1";
  issueIndex.style.opacity = "1"; issueIndex.style.pointerEvents = "auto";
  intro.style.opacity = "1";
  document.querySelector("#scene-title").textContent = "The Gazette Cabinet";
  document.querySelector("#scene-copy").textContent = "A few issues were kept. The city has changed since they were printed.";
}

function makeIssueButtons() {
  issues.forEach((issue) => {
    const button = document.createElement("button");
    button.type = "button"; button.className = "issue-choice";
    button.innerHTML = "<span>" + issue.id + " · " + issue.title + "</span><span>" + issue.date.replace(" 1926", "") + "</span>";
    button.addEventListener("click", () => {
      const target = issueObjects.find((item) => item.userData.issue.id === issue.id);
      if (target) startOpen(target);
    });
    issueButtons.append(button);
  });
}

function setupLights() {
  scene.add(new THREE.HemisphereLight("#b4a58b", "#171411", 1.25));
  const key = new THREE.DirectionalLight("#e6cda0", 2.0);
  key.position.set(-4.5, 7.5, 5.5); key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  key.shadow.camera.left = -10; key.shadow.camera.right = 10;
  key.shadow.camera.top = 9; key.shadow.camera.bottom = -4;
  key.shadow.bias = -.0003; scene.add(key);
  const fill = new THREE.PointLight("#c18a54", .8, 12);
  fill.position.set(3.8, 4.2, 1.8); scene.add(fill);
}

function raycastIssue(clientX, clientY) {
  const rect = renderer.domElement.getBoundingClientRect();
  mouse.x = ((clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((clientY - rect.top) / rect.height) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);
  const hits = raycaster.intersectObjects(issueObjects, true);
  if (!hits.length) return null;
  let item = hits[0].object;
  while (item && !item.userData.issue) item = item.parent;
  return item || null;
}

function setupInteraction() {
  canvas.addEventListener("pointerdown", (event) => { pointerDown = { x: event.clientX, y: event.clientY }; });
  canvas.addEventListener("pointerup", (event) => {
    if (!pointerDown) return;
    const moved = Math.hypot(event.clientX - pointerDown.x, event.clientY - pointerDown.y);
    pointerDown = null;
    if (moved > 6 || state !== "room") return;
    const issue = raycastIssue(event.clientX, event.clientY);
    if (issue) startOpen(issue);
  });
  canvas.addEventListener("pointermove", (event) => {
    if (state !== "room") return;
    const issue = raycastIssue(event.clientX, event.clientY);
    if (issue !== hoveredIssue) {
      if (hoveredIssue) hoveredIssue.children.forEach((child) => {
        if (child.material && child.material.emissive) child.material.emissive.set("#20100a");
      });
      hoveredIssue = issue;
      if (hoveredIssue) hoveredIssue.children.forEach((child) => {
        if (child.material && child.material.emissive) child.material.emissive.set("#6d3024");
      });
      canvas.style.cursor = issue ? "pointer" : "grab";
    }
  });
  document.querySelector("#close-issue").addEventListener("click", startClose);
  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && state === "open") startClose();
  });
}

function resize() {
  if (!renderer || !camera) return;
  const width = Math.max(1, canvas.clientWidth);
  const height = Math.max(1, canvas.clientHeight);
  renderer.setSize(width, height, false);
  camera.aspect = width / height;
  camera.fov = width < 760 ? 64 : 42;
  camera.updateProjectionMatrix();
}

function animate() {
  requestAnimationFrame(animate);
  const delta = Math.min(clock.getDelta(), .04);
  if (dust) { dust.rotation.y += delta * .012; dust.position.y = Math.sin(clock.elapsedTime * .16) * .07; }
  if (state === "opening" || state === "closing") {
    const elapsed = performance.now() - animationStart;
    const duration = reducedMotion ? 80 : 1900;
    const t = Math.min(1, elapsed / duration);
    const progress = state === "opening" ? t : 1 - t;
    updateSpread(progress, state === "closing");
    if (t >= 1) {
      if (state === "opening") finishOpen();
      else finishClose();
    }
  } else if (state === "room") controls.update();
  renderer.render(scene, camera);
}

async function init() {
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.8));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(42, window.innerWidth / window.innerHeight, .1, 80);
    camera.position.copy(roomCameraPosition);
    raycaster = new THREE.Raycaster(); mouse = new THREE.Vector2();
    controls = new OrbitControls(camera, renderer.domElement);
    controls.target.copy(roomCameraTarget);
    controls.enableDamping = true; controls.dampingFactor = .045; controls.enablePan = false;
    controls.minDistance = 8.2; controls.maxDistance = 13.5;
    controls.minPolarAngle = 1.28; controls.maxPolarAngle = 1.72;
    controls.minAzimuthAngle = -.43; controls.maxAzimuthAngle = .43;
    await document.fonts.ready;
    setupLights(); addRoom(); makeIssueButtons(); setupInteraction(); resize();
    window.addEventListener("resize", resize);
    loading.classList.add("done");
    animate();
  } catch (error) {
    console.error("The Gazette Cabinet could not be initialized.", error);
    loading.classList.add("done"); fallback.hidden = false;
  }
}
init();