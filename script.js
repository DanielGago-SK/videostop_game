/* 
Hra 3 kocky - JS súbor
*/

//*** naťahaj potrebné objekty a zadefinuj potrebné premenné
cube1 = document.getElementById("cube1");
cube2 = document.getElementById("cube2");
cube3 = document.getElementById("cube3");
button_rst = document.getElementById("rst");
button_start = document.getElementById("start");
score_info = document.getElementById("score");
last_click = document.getElementById("last_click");
record_info = document.getElementById("record");
premium_info = document.getElementById("premium");
counter_info = document.getElementById("counter");
final_info = document.getElementById("final_info");
rules_button = document.getElementById("rules_button");
rules_info = document.getElementById("rules_info");
score = 0; // skóre
timer = 120; // dĺžka hry v sekundách
counter = timer; // časomiera - odpočítavanie
interval = 1000; // interval pre zmenu hodnoty kociek
game_running = false; // stav hry - nebeží...

// načítaj grafiku pre prémiu
set_premium_svg();

// ? je v pamäti uložený dajaký rekord
// tento kód sa uskutočný iba ak existoval záznam
if (sessionStorage.getItem("new_record")) {
  // daj do premennej hodnotu toho rekordu
  new_record = sessionStorage.getItem("new_record");
  // občas sa mi zobrazil rekord ako false, nie ako nula, tak preto nasledovná kontrola a korekcia...
  if (new_record == "false") {
    new_record = 0;
  }
  // ak neexistoval záznam tak ho vytvor a ulož, s nulou
} else {
  new_record = 0;
  sessionStorage.setItem("new_record", 0);
}

// ? je v pamäti uložená prémia
// obdobne ako pri rekorde - kontrola prémie
if (sessionStorage.getItem("premium")) {
  premium = sessionStorage.getItem("premium");
  if (premium == "true") {
    premium_true();
  } else {
    premium_false();
  }
} else {
  premium_false();
}

// definície pre vlastnosti kociek
// dizajn sa dá teda (čiastočne) ľahko modifikovať...
// farba podkladu kociek je ako farba textu aplikácie
color_cube_bgr = "var(--txt_color)";
/*color_cube_stroke = "#6f9473";*/
color_cube_stroke = "gray";
cube_stroke_width = 5;
color_circle_bgr = "#2f4858";
color_circle_stroke = "#000";
circle_stroke_width = 1;
box = 150;
circle_r = 14;

// ! na úvod kontrola či funguje vibrovanie (len Android to podporuje, iOS nie! a hra sa kvôli tomu zasekla...)
const canVibrate = window.navigator.vibrate;

// hneď na úvod sa zavolá funkcia "resize_cubes" a tá uskutoční aj reset hry, načitanie kociek a podobne
resize_cubes();

// pridaj aktívnu kontrolu na možnosť resize kociek!
window.addEventListener("resize", resize_cubes);
/* po novom môžem mať kontrolu "resize" neustále aktívnu - na to aby mi to neurobilo reset si dáva pozor - pri aktívnej hre sa vykoná táto funkcia bez resetu... */

//*** RESET HRY / príprava na jej rozbeh
//nulovanie premenných a prekreslenie obsahu na hracej ploche
function reset() {
  // zruš kontrolu tlačidla Reset, má fungovať iba ak beží hra...
  button_rst.removeEventListener("click", reset_the_game);
  button_rst.style.cursor = "auto";
  score = 0; // skóre 0
  counter = timer; // počítadlo na hodnotu časovača
  game_running = false; // hra nebeží
  last_click.innerText = "0"; // posledný klik - 0
  score_info.innerText = score; // skore zobraz - 0
  record_info.innerText = new_record; // nový rekord zobraz - aktúalny stav
  premium_this_game = false; // prémia v aktuálnej hre - zrušená
  // počítadlo času hry - zrušená červená farba textu a zobraz hodnotu časovača
  counter_info.style.color = "var(--txt_color)";
  counter_info.innerText = counter;
  // 7. objekt v poli je plná kocka...
  // takto je fajn vidieť že hra stojí
  cube1.innerHTML = cube_values[7];
  cube2.innerHTML = cube_values[7];
  cube3.innerHTML = cube_values[7];
  // aktivácia tlačidla s pravidlami, aby bolo k dispozícii
  rules_button.style.cursor = "help";
  rules_button.addEventListener("click", rules_show);
  // zruš kontrolu tlačidla Klik - bude Štart tlačidlo
  button_start.removeEventListener("click", click_control);
  // kontroluj či sa nestlačilo tlačidlo Štart - pre štart hry
  button_start.addEventListener("click", start_the_game);
}

//*** funkcia na rozbeh hry
function start_the_game() {
  // vibrácie na tlačítku
  if (canVibrate) window.navigator.vibrate(30);
  // zmeň stav hry na "beží"
  game_running = true;
  // tlačidlo "Štart" prekóduj
  button_start.style.backgroundColor = "yellowgreen";
  button_start.innerText = "Klik";
  // nahoď hneď už dajaké hodnoty kociek
  change_cubes();
  // a spusti intervaly na nahadzovanie kociek a kontrolu času hry
  interval_cubes = setInterval(change_cubes, interval);
  interval_stopwatch = setInterval(stopwatch, 1000);
  // počas hry zruš možnosť klikania na info tlačidlo, pre istotu...
  rules_button.removeEventListener("click", rules_show);
  rules_button.style.cursor = "not-allowed";
  // hra sa rozbehla, "Štart" už zablokuj, odblokuje sa "Klik"...
  button_start.removeEventListener("click", start_the_game);
  button_start.addEventListener("click", click_control);
  // aktivuj kontrolu tlačidla "Reset", má fungovať iba ak beží hra...
  button_rst.style.cursor = "pointer";
  button_rst.addEventListener("click", reset_the_game);
}

//*** funkcia len generuje nové hodnoty kociek a zobrazí / prekreslí ich
// ! keďže sa zapína a vypína jej časovanie tak musí byť ako samostatná funkcia !
function change_cubes() {
  // vygeneruj a daj hodnotu do premennej - bude treba pri kontrole stavu kociek
  cube_number1 = Math.floor(Math.random() * 6 + 1);
  // a prekresli ju na hracej ploche - 1. kocka
  cube1.innerHTML = cube_values[cube_number1];
  //2. kocka
  cube_number2 = Math.floor(Math.random() * 6 + 1);
  cube2.innerHTML = cube_values[cube_number2];
  // 3. kocka
  cube_number3 = Math.floor(Math.random() * 6 + 1);
  cube3.innerHTML = cube_values[cube_number3];
}

//*** funkcia pre stav keď hra beží a kliklo sa na tlačidlo - kontrola stavu kociek pri stlačení a zápis hodnôt skóre
function click_control() {
  // vibrácie na tlačítku
  if (canVibrate) window.navigator.vibrate(30);
  // ak sú všetky tri rovnaké - prémia + lepšie skóre...
  // ! táto kontrola musí byť prvá !!
  if (cube_number1 == cube_number2 && cube_number1 == cube_number3) {
    premium_true();
    score += 6;
    score_info.innerText = score;
    last_click.innerText = " + 6 bodov 👍";
  } else if (
    // ak sú aspoň dve rovnaké, pridaj body
    cube_number1 == cube_number2 ||
    cube_number1 == cube_number3 ||
    cube_number2 == cube_number3
  ) {
    score += 2;
    score_info.innerText = score;
    last_click.innerText = " + 2 body";
  } else {
    // žiadna zhoda, body dolu
    score -= 3;
    score_info.innerText = score;
    last_click.innerText = " -3 body 👎";
    if (score < 0) {
      // ak skóre padlo pod nulu - koniec...
      // ! a prémia je v čudu taktiež - globálne!
      premium_false();
      // stopni tú tragédiu...
      stop();
    }
  }
}

//*** dosiahla sa prémia - zatiaľ iba v tejto hre!
// zobrazí sa a uloží stav - len pre túto hru, teda nie aj do Storage!
function premium_true() {
  premium_this_game = true;
  premium_info.innerHTML = premium_diamond;
}

//*** prišli sme o prémiu
// ! toto je vždy volané len keď to je globálne!, takže aj výmaz zo Storage
function premium_false() {
  premium_this_game = false;
  premium = false;
  premium_info.innerHTML = "-";
  sessionStorage.setItem("premium", false);
}

//*** funkcia pre tlačidlo reset - stopni a resetni hru, ale rekordné skóre nenulujem
// stopni zobrazovanie kociek aj meranie času
function reset_the_game() {
  if (canVibrate) window.navigator.vibrate(30);
  // stopni časovače
  clearInterval(interval_cubes);
  clearInterval(interval_stopwatch);
  // prekresli tlačidlo štart (kontrola klikania sa zruší potom v resete...)
  button_start.style.backgroundColor = "green";
  button_start.innerText = "Štart";
  interval = 1000; // vráť rýchlosť ak bola spomalená
  // nahranú prémiu z tejto hry zruš... (ak nebola predtým už dajaká nahraná tak zruš ju rovno globálne)
  // * tu by stačilo kontrolovať len globálnu... A v prípade false vykonať funkcie premium_false, a inak by zostala globálna ako bola...
  if (premium_this_game && !premium) {
    premium_false();
  }
  // vykonaj reset
  reset();
}

//*** kontrola behu hry, či nevypršal čas a jeho zobrazenie...
function stopwatch() {
  // odpočet
  counter--;
  // zobraz novú hodnotu odpočtu času hry
  if (counter < 10) {
    // hodnota pod 10 sekúnd červená, blíži sa koniec hry...
    counter_info.style.color = "var(--bgr_color_red)";
  }
  counter_info.innerText = counter;
  if (counter == 0) {
    // tu nastal koniec hry - vypršal čas...
    // vykonaj funkciu stop
    stop();
  }
}

//*** zastav hru, koniec hry (nie je to to isté ako reset!, len dosť podobné)...
// tu totiž ide aj o ten záver - final funkciu
function stop() {
  // blokni hneď tlačidlo Klik - keby som chcel efektnejší nábeh konca aby sa to neprebíjalo...
  button_start.removeEventListener("click", click_control);
  // zruš aj okamžite kontrolu tlačidla Reset, má fungovať iba ak beží hra...
  button_rst.removeEventListener("click", reset_the_game);
  // stav hry - nebeží
  game_running = false;
  // stopni zobrazovanie kociek aj meranie času
  clearInterval(interval_cubes);
  clearInterval(interval_stopwatch);
  // tlačidlo Štart je zasa Štart
  button_start.style.backgroundColor = "green";
  button_start.innerText = "Štart";
  interval = 1000; // vráť rýchlosť ak bola spomalená
  // spusti funkciu na záverečné zhodnotenie
  final();
}

//*** záverečné zhodnotenie - zobrazenie finálnej obrazovky
function final() {
  // hoď obrazovku hore - dôležité iba pre telefóny na ležato, tam sa hrá mierne nižšie a obrazovka výsledkov je potom mimo...
  window.scrollTo({
    top: 0,
    left: 0,
    behavior: "smooth",
  });
  // vytvor end_status - kus html kódu ktorý sa zobrazí na obrazovke
  end_status = `
    <p>Koniec hry!</p>`;
  // výpis dosiahnutého skóre
  end_status += `
    <p>Počet bodov:&nbsp; ${score}</p>
    `;
  // kontrola nového rekordu, ak je, daj to vedieť
  if (score > new_record) {
    end_status += `
    <p><span style = "color: green;">Máš nový rekord!</span></p>
    `;
    // ulož novú hodnotu do premennej a do pamäti + hneď zobraz
    new_record = score;
    sessionStorage.setItem("new_record", new_record);
    record_info.innerText = new_record;
  }
  // kontrola dosiahnutej prémie (v tejto hre) a daj to vedieť
  if (premium_this_game) {
    // nastav záverečnú grafiku pre diamant - zväčši ho
    set_final_premium_svg();
    end_status += `
        <p>Aj prémia <span>${premium_diamond}</span> bola. <br> 👍</p>`;
    // grafiku pre diamant vráť naspäť!!
    set_premium_svg();
    // a ulož premiu aj globálne
    premium = premium_this_game;
    // možný zápis aj premium = true;
    sessionStorage.setItem("premium", true);
    // * zobrazená tá prémia už bola počas hry, netreba to riešiť...
  }
  // looser kontrola - body v mínuse...
  if (score < 0) {
    end_status += `
      <p>Skončil(a) si v mínuse...<br><span style="color: red;">SI "LOSER"!</span></p>
      <p style = "font-size: 1rem";>(1 kolo trochu spomalíme...)</p>`;
    // hráč to evidentne nestíha, spomalíme na jedno kolo... predĺž interval obnovy kociek
    interval = 1300; // na pevnú hodnotu, nie iba pridávať
  }
  // kontrola nulového stavu - slabý výkon...
  if (score == 0) {
    end_status += `
      <p>Skončil(a) si s nulovým skóre...<br><span style="color: red;">Si nula...</span></p>`;
  }
  // info o reštarte sa zobrazí neviditeľno, až neskôr sa zvidieľný - a je to potom bez trhania a pohybu, nie ako pri pridávaní p elementu...
  end_status += `<p id = "restart_click" style = "color: var(--txt_bgr_color); font-size: 1rem; margin-top: 0.5rem; padding: 2px 6px 2px 6px; border-radius: 4px;">Klikni na obrazovku pre reštart hry...</p>`;
  // zobraz ten blok
  final_info.innerHTML = end_status;
  final_info.style.display = "flex";
  // kontrola či sa nekliklo - ak áno tak skry tento blok a reset hry...
  setTimeout(() => {
    // aby sa v zápale hry nekliklo okamžite po konci na ten blok, tak je tu časovač na spustenie. Tlačidlá ovládania hry sú aj tak už neaktívne - môžem ten finál v budúcnosti nakódovať aj dajako efektnejšie...
    final_info.addEventListener("click", remove_final);
    // zviditeľni ten text s info o reštarte a čakaj na kliknutie
    document.getElementById("restart_click").style.color = "white";
    document.getElementById("restart_click").style.backgroundColor =
      "var(--bgr_color_red";
  }, 2000);
}

//*** odstráň blok s finálnymi informáciami a zruš mu zasa event listener na klik
function remove_final() {
  final_info.style.display = "none";
  final_info.removeEventListener("click", remove_final);
  if (canVibrate) window.navigator.vibrate(60);
  reset();
}

//*** ak sa kliklo na pravidlá, zobraz pravidlá a potom ich na klik zasa zruš
function rules_show() {
  if (canVibrate) window.navigator.vibrate(20);
  rules_info.style.height = "100vh";
  rules_info.addEventListener("click", function () {
    if (canVibrate) window.navigator.vibrate(20);
    rules_info.style.height = "0";
  });
}

//*** funkcia "resize"
// ak nastalo resize tak zasa zmeraj nové hodnoty šírky, predefinuj pole kociek a prekresli ich
function resize_cubes() {
  // zisti šírku pre kocky
  control_width = document.querySelector(".width").clientWidth;
  // prepočítaj možnú šírku a výšku pre jednu kocku
  svg_size = control_width / 3 - 24;
  // nech nie je viac ako 200, je to už príliž veľké...
  if (svg_size > 200) {
    svg_size = 200;
  }
  // zadefinuj nové vlastnosti kociek
  define_cube_array();
  // ak hra nebeží, tak aj reset - prekreslí to kocky. Ale ak beží, tak sa prekreslia automaticky...
  // ! a nemôžem ten Reset volať vždy, teda aj uprostred hry... Resetol by som hru...
  if (!game_running) {
    reset();
  }
}

// pole s grafikou kociek
// je tu aj nula - bez guličiek, keby sa to hodilo, a aj 7 - to je plná kocka
// tá nula mi zabezpečila aj to že môžem číslovať teraz kocky v poli rovno podľa hodnoty 1-6
// ! definíciu poľa musím mať ako funkciu, inak neprekreslím veľkosti kociek ak ich potrebujem meniť počas behu aplikácie (a kontrola resize)... treba to znovu zavolať...

function define_cube_array() {
  cube_values = [
    // 0
    `
		<svg width="${svg_size}" height="${svg_size}" viewBox = "0 0 160 160">
			<rect x="5" y="5" rx="10" ry="10" width="${box}" height="${box}"
				style="fill:${color_cube_bgr};stroke:${color_cube_stroke};stroke-width:${cube_stroke_width};" />
			</svg>`,
    // 1
    `
		<svg width="${svg_size}" height="${svg_size}" viewBox = "0 0 160 160">
			<rect x="5" y="5" rx="10" ry="10" width="${box}" height="${box}"
				style="fill:${color_cube_bgr};stroke:${color_cube_stroke};stroke-width:${cube_stroke_width};" />
			<circle cx="${box / 2 + 5}" cy="${
      box / 2 + 5
    }" r="${circle_r}" stroke="${color_circle_stroke}" stroke-width="${circle_stroke_width}" fill="${color_circle_bgr}" />
			</svg>`,
    // 2
    `
		<svg width="${svg_size}" height="${svg_size}" viewBox = "0 0 160 160">
			<rect x="5" y="5" rx="10" ry="10" width="${box}" height="${box}"
				style="fill:${color_cube_bgr};stroke:${color_cube_stroke};stroke-width:${cube_stroke_width};" />
			<circle cx="${box / 4}" cy="${
      box / 4
    }" r="${circle_r}" stroke="${color_circle_stroke}" stroke-width="${circle_stroke_width}" fill="${color_circle_bgr}" />

			<circle cx="${box - box / 4 + 10}" cy="${
      box - box / 4 + 10
    }" r="${circle_r}" stroke="${color_circle_stroke}" stroke-width="${circle_stroke_width}" fill="${color_circle_bgr}" />
		</svg>`,
    // 3
    `
		<svg width="${svg_size}" height="${svg_size}" viewBox = "0 0 160 160">
			<rect x="5" y="5" rx="10" ry="10" width="${box}" height="${box}"
				style="fill:${color_cube_bgr};stroke:${color_cube_stroke};stroke-width:${cube_stroke_width};" />

			<circle cx="${box - box / 4 + 10}" cy="${
      box / 4
    }" r="${circle_r}" stroke="${color_circle_stroke}" stroke-width="${circle_stroke_width}" fill="${color_circle_bgr}" />
			<circle cx="${box / 2 + 5}" cy="${
      box / 2 + 5
    }" r="${circle_r}" stroke="${color_circle_stroke}" stroke-width="${circle_stroke_width}" fill="${color_circle_bgr}" />
			<circle cx="${box / 4}" cy="${
      box - box / 4 + 10
    }" r="${circle_r}" stroke="${color_circle_stroke}" stroke-width="${circle_stroke_width}" fill="${color_circle_bgr}" />
		</svg>`,
    // 4
    `
		<svg width="${svg_size}" height="${svg_size}" viewBox = "0 0 160 160">
			<rect x="5" y="5" rx="10" ry="10" width="${box}" height="${box}"
				style="fill:${color_cube_bgr};stroke:${color_cube_stroke};stroke-width:${cube_stroke_width};" />
			<circle cx="${box / 4}" cy="${
      box / 4
    }" r="${circle_r}" stroke="${color_circle_stroke}" stroke-width="${circle_stroke_width}" fill="${color_circle_bgr}" />
			<circle cx="${box - box / 4 + 10}" cy="${
      box / 4
    }" r="${circle_r}" stroke="${color_circle_stroke}" stroke-width="${circle_stroke_width}" fill="${color_circle_bgr}" />
			<circle cx="${box / 4}" cy="${
      box - box / 4 + 10
    }" r="${circle_r}" stroke="${color_circle_stroke}" stroke-width="${circle_stroke_width}" fill="${color_circle_bgr}" />
			<circle cx="${box - box / 4 + 10}" cy="${
      box - box / 4 + 10
    }" r="${circle_r}" stroke="${color_circle_stroke}" stroke-width="${circle_stroke_width}" fill="${color_circle_bgr}" />
		</svg>`,
    // 5
    `
		<svg width="${svg_size}" height="${svg_size}" viewBox = "0 0 160 160">
			<rect x="5" y="5" rx="10" ry="10" width="${box}" height="${box}"
				style="fill:${color_cube_bgr};stroke:${color_cube_stroke};stroke-width:${cube_stroke_width};" />
			<circle cx="${box / 4}" cy="${
      box / 4
    }" r="${circle_r}" stroke="${color_circle_stroke}" stroke-width="${circle_stroke_width}" fill="${color_circle_bgr}" />
			<circle cx="${box - box / 4 + 10}" cy="${
      box / 4
    }" r="${circle_r}" stroke="${color_circle_stroke}" stroke-width="${circle_stroke_width}" fill="${color_circle_bgr}" />
			<circle cx="${box / 2 + 5}" cy="${
      box / 2 + 5
    }" r="${circle_r}" stroke="${color_circle_stroke}" stroke-width="${circle_stroke_width}" fill="${color_circle_bgr}" />
			<circle cx="${box / 4}" cy="${
      box - box / 4 + 10
    }" r="${circle_r}" stroke="${color_circle_stroke}" stroke-width="${circle_stroke_width}" fill="${color_circle_bgr}" />
			<circle cx="${box - box / 4 + 10}" cy="${
      box - box / 4 + 10
    }" r="${circle_r}" stroke="${color_circle_stroke}" stroke-width="${circle_stroke_width}" fill="${color_circle_bgr}" />
		</svg>`,
    // 6
    `
		<svg width="${svg_size}" height="${svg_size}" viewBox = "0 0 160 160">
			<rect x="5" y="5" rx="10" ry="10" width="${box}" height="${box}"
				style="fill:${color_cube_bgr};stroke:${color_cube_stroke};stroke-width:${cube_stroke_width};" />
			<circle cx="${box / 4}" cy="${
      box / 4
    }" r="${circle_r}" stroke="${color_circle_stroke}" stroke-width="${circle_stroke_width}" fill="${color_circle_bgr}" />
			<circle cx="${box - box / 4 + 10}" cy="${
      box / 4
    }" r="${circle_r}" stroke="${color_circle_stroke}" stroke-width="${circle_stroke_width}" fill="${color_circle_bgr}" />
			<circle cx="${box / 4}" cy="${
      box / 2 + 5
    }" r="${circle_r}" stroke="${color_circle_stroke}" stroke-width="${circle_stroke_width}" fill="${color_circle_bgr}" />
			<circle cx="${box - box / 4 + 10}" cy="${
      box / 2 + 5
    }" r="${circle_r}" stroke="${color_circle_stroke}" stroke-width="${circle_stroke_width}" fill="${color_circle_bgr}" />
			<circle cx="${box / 4}" cy="${
      box - box / 4 + 10
    }" r="${circle_r}" stroke="${color_circle_stroke}" stroke-width="${circle_stroke_width}" fill="${color_circle_bgr}" />
			<circle cx="${box - box / 4 + 10}" cy="${
      box - box / 4 + 10
    }" r="${circle_r}" stroke="${color_circle_stroke}" stroke-width="${circle_stroke_width}" fill="${color_circle_bgr}" />
		</svg>`,
    // 7 - full
    `
		<svg width="${svg_size}" height="${svg_size}" viewBox = "0 0 160 160">
			<rect x="5" y="5" rx="10" ry="10" width="${box}" height="${box}"
				style="fill:${color_cube_bgr};stroke:${color_cube_stroke};stroke-width:${cube_stroke_width};" />
			<circle cx="${box / 4}" cy="${
      box / 4
    }" r="${circle_r}" stroke="${color_circle_stroke}" stroke-width="${circle_stroke_width}" fill="${color_circle_bgr}" />
			<circle cx="${box / 2 + 5}" cy="${
      box / 4
    }" r="${circle_r}" stroke="${color_circle_stroke}" stroke-width="${circle_stroke_width}" fill="${color_circle_bgr}" />
			<circle cx="${box - box / 4 + 10}" cy="${
      box / 4
    }" r="${circle_r}" stroke="${color_circle_stroke}" stroke-width="${circle_stroke_width}" fill="${color_circle_bgr}" />
			<circle cx="${box / 4}" cy="${
      box / 2 + 5
    }" r="${circle_r}" stroke="${color_circle_stroke}" stroke-width="${circle_stroke_width}" fill="${color_circle_bgr}" />
			<circle cx="${box / 2 + 5}" cy="${
      box / 2 + 5
    }" r="${circle_r}" stroke="${color_circle_stroke}" stroke-width="${circle_stroke_width}" fill="${color_circle_bgr}" />
			<circle cx="${box - box / 4 + 10}" cy="${
      box / 2 + 5
    }" r="${circle_r}" stroke="${color_circle_stroke}" stroke-width="${circle_stroke_width}" fill="${color_circle_bgr}" />
			<circle cx="${box / 4}" cy="${
      box - box / 4 + 10
    }" r="${circle_r}" stroke="${color_circle_stroke}" stroke-width="${circle_stroke_width}" fill="${color_circle_bgr}" />
			<circle cx="${box / 2 + 5}" cy="${
      box - box / 4 + 10
    }" r="${circle_r}" stroke="${color_circle_stroke}" stroke-width="${circle_stroke_width}" fill="${color_circle_bgr}" />
			<circle cx="${box - box / 4 + 10}" cy="${
      box - box / 4 + 10
    }" r="${circle_r}" stroke="${color_circle_stroke}" stroke-width="${circle_stroke_width}" fill="${color_circle_bgr}" />
		</svg>`,
  ];
}

function set_final_premium_svg() {
  // svg grafika pre prémiu
  // výška a šírka je podľa veľkosti finálneho textu
  diamod_size = window.getComputedStyle(
    document.getElementById("final_info")
  ).fontSize;
  set_svg();
}

function set_premium_svg() {
  // svg grafika pre prémiu
  // výška a šírka je podľa veľkosti infotextu pre prémiu textu
  diamod_size = window.getComputedStyle(
    document.getElementById("premium")
  ).fontSize;
  set_svg();
}

function set_svg() {
  premium_diamond = `
<svg
width="${diamod_size}" height="${diamod_size}" 
  x="0px"
  y="0px"
viewBox="0 0 58 58" style="enable-background:new 0 0 58 58;" xml:space="preserve">
<polygon style="fill:#CC2E48;" points="29,55 0,19 58,19 "/>
<polygon style="fill:#FC3952;" points="58,19 0,19 10,3 48,3 "/>
<polygon style="fill:#F76363;" points="42.154,19 48,3 10,3 15.846,19 "/>
<polygon style="fill:#F49A9A;" points="42,19 29,3 16,19 "/>
<polygon style="fill:#CB465F;" points="15.846,19 29,55 42.154,19 "/>
<g>
</g>
<g>
</g>
<g>
</g>
<g>
</g>
<g>
</g>
<g>
</g>
<g>
</g>
<g>
</g>
<g>
</g>
<g>
</g>
<g>
</g>
<g>
</g>
<g>
</g>
<g>
</g>
<g>
</g>
</svg>`;
}
