/* 
Hra 3 kocky - JS súbor
*/

// načítaj do premennej svg grafiku pre prémiu
// je to dlhý kód, tak nech to nevypisujem potom viac krát do kódu...
get_premium_svg();

/* v rámci prípravy na zmenu jazykov tu musím tie texty generovať takto... */
/* ak teda pridám zmenu jazykov, tak podľa zvoleného jazyka sa prepíše vnútorný html obsah */

/*rst.innerText = `Reset`;
start.innerText = `Start`;*/
/* ! zaujímavé že ten obsah elementu sa nahodí aj bez toho aby som si ten ID element v JS ku predtým načítal... objekt s id start nenačítavam nikde... JS teda aj samo vie asi podľa ID o aký objekt v html kóde ide... */
/*info_block.innerHTML = `
<p>Skóre: <span id="score">0</span></p>
			<p class="small">Posledný klik: <span id="last_click"></span></p>
			<p class="small">Rekord: <span id="record">0</span></p>
			<p>Prémia: <span id="premium"></span></p>
			<p>Čas do konca: <span id="counter"></span> s</p>
`;*/

rules_info.innerHTML = `
<p><b>Pravidlá:</b><br>
			Cieľom hry je získavať body za klikanie v "správnom čase". Treba sledovať hodnoty kociek. 
			Za dve rovnaké hodnoty sú 2 body, za tri rovnaké hodnoty 6 bodov (a "prémia"
			${premium_diamond}). Ak nie je zhoda, tak -3 body... Ak skončí hra v mínuse tak stratíš aj všetky doterajšie prémie zo všetkých hier...<br>
			Klikaj preto s rozvahou... 🙂<br>
			Hra končí keď sa dostaneš v skóre pod "0", alebo po 2 minútach. Tlačidlo Reset ruší iba aktuálnu hru,
			hodnota "Rekord" a "Prémia" zostanú, ale iba z daktorej plne dohranej hry, nie z aktuálnej -
			prerušenej!</p>
			<p style="background-color: var(--bgr_color_red); padding: 2px 6px 4px 6px; border-radius: 4px;">
				Klikni pre zrušenie nápovedy.</p> 
      <p>&copy;12/2021 Daniel Gago</p>
    `;

//*** naťahaj potrebné objekty a zadefinuj potrebné premenné
cube1 = document.getElementById("cube1");
cube2 = document.getElementById("cube2");
cube3 = document.getElementById("cube3");
button_rst = document.getElementById("rst");
button_start = document.getElementById("start");
info_block = document.getElementById("info_block");
premium_info = document.getElementById("premium");
last_click = document.getElementById("last_click");
counter_info = document.getElementById("counter");
score_info = document.getElementById("score");
record_info = document.getElementById("record");
final_info = document.getElementById("final_info");
rules_button = document.getElementById("rules_button");
rules_info = document.getElementById("rules_info");
score = 0; // skóre
timer = 120; // dĺžka hry v sekundách
counter = timer; // časomiera - odpočítavanie
interval = 1000; // interval pre zmenu hodnoty kociek
game_running = false; // stav hry - nebeží...
premium_this_game = 0;

// pokus o prevenciu voči refrešu stránky ak beží hra...
window.onbeforeunload = function (e) {
  e.preventDefault();
  return "Refreš nie je možný, hra beží...";
};
/* vcelku to funguje... 
/* môj text síce nezobrazí, ale pýta sa či sa má vykonať refreš alebo odchod zo stránky, no a o to mi šlo... */

// ? je v pamäti uložený dajaký rekord
// načítaj hodnotu
new_record = localStorage.getItem("new_record");
if (!new_record) {
  // ak je null - neexistoval, tak ho vytvor a ulož s nulou
  new_record = 0;
  localStorage.setItem("new_record", 0);
}
// ak tam bola hodnota tak sa potom zobrazí...

// ? je v pamäti uložená prémia
// obdobne ako pri rekorde - kontrola prémie
premium = localStorage.getItem("premium");
// ak je hodnota viac ako 0 tak sa zobrazí, ak je 0, alebo nebola - null, tak prémia nie je
if (premium > 0) {
  premium_true();
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

// aktivácia možnosti totálneho resetu hry - "Prémia", "Rekord", všetko sa vynuluje a reset hry...
// táto možnosť nebude nikde spomenutá, je iba "tajná" - aktivuje sa 4 krát kliknutím na logo DG !!!
total_reset = 0;
document.querySelector("#logo").addEventListener("click", wait_for_reset);

function wait_for_reset() {
  total_reset++;
  setTimeout (function() {
    // po 3 sekundách sa vynuluje stav, takže reset je možný iba ak sa 4 krát klikne na logo do 3 sekúnd!
    total_reset = 0;
  },3000);
  if (total_reset > 3) {
    total_reset = 0;
    // vynuluj nový rekord:
    new_record = 0;
    localStorage.setItem("new_record", 0);
    record_info.innerText = new_record;
    // vynuluj prémiu
    premium_false();
    // a reset hry...
    if (game_running) {reset_button_pressed();}
    else {reset_the_game};
}
};

//*** RESET HRY / príprava na jej rozbeh
//nulovanie premenných a prekreslenie obsahu na hracej ploche
function reset_the_game() {
  // zruš kontrolu tlačidla Reset, má fungovať iba ak beží hra...
  button_rst.removeEventListener("click", reset_button_pressed);
  button_rst.style.cursor = "auto";
  score = 0; // skóre 0
  counter = timer; // počítadlo na hodnotu časovača
  game_running = false; // hra nebeží
  last_click.innerText = "0"; // posledný klik - 0
  score_info.innerText = score; // skore zobraz - 0
  record_info.innerText = new_record; // nový rekord zobraz - aktuálny stav
  premium_this_game = 0; // prémia v aktuálnej hre - zrušená
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
  button_rst.addEventListener("click", reset_button_pressed);
}

//*** funkcia len generuje nové hodnoty kociek a zobrazí / prekreslí ich
// ! keďže sa zapína a vypína jej časovanie, tak musí byť ako samostatná funkcia !
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
    premium++; // už tu si nastavím stav
    premium_this_game++; // pomocný stav na počet prémií v danom kole
    premium_true(); //zobraz to
    score += 6;
    score_info.innerText = score;
    last_click.innerHTML = ` + 6 bodov ${thumbs_up}`;
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
    last_click.innerHTML = ` -3 body ${thumbs_down}`;
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
  premium_state = "";
  for (let p_index = 0; p_index < premium; p_index++) {
    premium_state += premium_diamond;
  }
  premium_info.innerHTML = premium_state;
}

//*** prišli sme o prémiu
// ! toto je vždy volané len keď to je globálne!, takže aj výmaz zo Storage
function premium_false() {
  premium_this_game = 0;
  premium = 0;
  premium_info.innerHTML = "-";
  localStorage.setItem("premium", 0);
}

//*** funkcia pre tlačidlo reset - stopni a resetni danú hru, ale rekordné skóre nenulujem
// stopni zobrazovanie kociek aj meranie času
function reset_button_pressed() {
  if (canVibrate) window.navigator.vibrate(30);
  // stopni časovače
  clearInterval(interval_cubes);
  clearInterval(interval_stopwatch);
  // prekresli tlačidlo štart (kontrola klikania sa zruší potom v resete...)
  button_start.style.backgroundColor = "green";
  button_start.innerText = "Štart";
  interval = 1000; // vráť rýchlosť ak bola spomalená
  // spomalená rýchlosť je iba ako pomôcka po neúspešnej hre, ak dakto použije reset tak o túto pomôcku jednoducho príde...
  // nahranú prémiu z tejto hry zruš... (ak nebola predtým už dajaká nahraná tak zruš ju rovno globálne)
  premium = premium - premium_this_game; // vrátim hodnotu premium do pôvodného stavu pred začiatkom hry
  // prekresli aktuálny stav prémie...
  if (premium > 0) {
    premium_true();
  } else {
    premium_false();
  }
  // vykonaj reset
  reset_the_game();
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

//*** zastav hru, koniec hry (nie je to to isté ako keď sa stlačí tlačidlo reset!, len dosť podobné)...
// tu totiž ide aj o ten záver - final funkciu
function stop() {
  // blokni hneď tlačidlo Klik - keby som chcel efektnejší nábeh konca aby sa to neprebíjalo...
  button_start.removeEventListener("click", click_control);
  // zruš aj okamžite kontrolu tlačidla Reset, má fungovať iba ak beží hra...
  button_rst.removeEventListener("click", reset_button_pressed);
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
  final_output_screen();
}

//*** záverečné zhodnotenie - zobrazenie finálnej obrazovky
function final_output_screen() {
  // hoď obrazovku hore - dôležité hlavne pre telefóny na ležato, tam sa hrá mierne nižšie a obrazovka výsledkov je potom mimo...
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
    localStorage.setItem("new_record", new_record);
    record_info.innerText = new_record;
  }
  // kontrola dosiahnutých prémií (v tejto hre) a daj to vedieť
  if (premium_this_game > 0) {
    if (premium_this_game == 1) {
      end_status += `
        <p>Aj prémia ${premium_diamond} bola. <br> ${thumbs_up}</p>`;
    } else {
      end_status += `
        <p>Aj prémie boli. <br>`;
        for (let pd = 0; pd < premium_this_game; pd++) {
          end_status += premium_diamond
        }
        end_status += `
         <br>${thumbs_up}</p>`;
    }
    // a ulož premiu aj globálne
    localStorage.setItem("premium", premium);
    // * zobrazená tá prémia už bola počas hry, netreba to riešiť...
  }
  // looser kontrola - body v mínuse...
  if (score < 0) {
    end_status += `
      <p>Skončil(a) si v mínuse...<br><span style="color: var(--bgr_color_red);">SI "LOSER"!</span> ${thumbs_down}</p>
      <p>Aj prémie sú komplet fuč...</p>
      <p style = "font-size: 1rem";>(1 kolo trochu spomalíme...)</p>`;
    // hráč to evidentne nestíha, spomalíme na jedno kolo... predĺž interval obnovy kociek
    interval = 1300; // na pevnú hodnotu, nie iba pridávať
    premium_false(); // a prémia je fuč...
  }
  // kontrola nulového stavu - slabý výkon...
  if (score == 0) {
    end_status += `
      <p>Skončil(a) si s nulovým skóre...<br><span style="color: var(--bgr_color_red);">Si nula...</span></p>
      <p style = "font-size: 1rem";>(1 kolo trochu spomalíme...)</p>`;
    // hráč to evidentne nestíha, spomalíme na jedno kolo... predĺž interval obnovy kociek
    interval = 1300; // na pevnú hodnotu, nie iba pridávať
    // ! je jasné źe hra po tejto zmene intervalu teraz netrvá 120 sekúnd reálne, ale nepotrebujem to dajako kriticky riešiť (dvoma časovačmi), tu o nič podstatné nejde, len o to aby sa spomalila...
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
  reset_the_game();
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
    reset_the_game();
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

function get_premium_svg() {
  // v premennej "premium_diamond" bude uložený kód pre svg diamant, kvôli jeho dĺžke, nech to nepíšem celé do kódy x krát 
  // width a height "1em" zabezpečuje že jeho veľkosť zobrazenia bude vždy adekvátna veľkosti okolitého textu kde sa zobrazí... To sa mi hodí, lebo v pravidlách je iná ako v samotnej hre...
  premium_diamond = `
<svg
width="1em" height="1em" 
  x="0px"
  y="0px"
viewBox="0 0 58 50" style="enable-background:new 0 0 58 58;" xml:space="preserve">
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

thumbs_up = `
<svg 
width="1.1em" height="1.1em" 
 x="0px" y="0px" fill="#ffc83d"
	 viewBox="596.9167 0.0194 1565.0834 1639.8086" enable-background="new 596.9167 0.0194 1565.0834 1639.8086" xml:space="preserve"
	>
<path d="M1520.5629,60.7246c9.2529,0,22.9001-2.2927,31.0228,1.2784c4.0228,1.7685,10.0901,1.592,14.4762,2.7188
	c5.8456,1.5018,11.6852,2.95,17.423,4.8376c19.8309,6.524,38.4539,17.5962,54.3069,31.1189
	c15.4873,13.2107,28.811,28.8823,38.5651,46.7913c10.3126,18.9348,15.6564,39.2017,20.9418,59.9346
	c5.438,21.3307,6.3975,44.4503,6.5536,66.3782c0.1575,22.0935-1.3568,45.1182-6.2789,66.6433
	c-4.7166,20.626-9.5502,40.6268-17.2726,60.4215c-8.1235,20.8223-19.2517,40.6216-29.2167,60.5945
	c-9.6312,19.3036-18.8459,38.775-28.1715,58.2219c-9.0332,18.8382-17.9552,38.7832-24.1283,58.7702
	c-6.0906,19.7205-11.4923,40.3191-10.5479,61.155c0.3005,6.6298,1.0413,21.0134,7.0928,25.2928
	c3.0446,2.1529,8.7776,0.9438,12.2129,0.8727c6.3768-0.1321,12.7501-0.3911,19.1221-0.6643
	c46.1556-1.9804,92.4683-1.7981,138.6613-1.7421c45.6135,0.0554,91.168,0.327,136.7052,3.2466
	c22.5062,1.4431,45.473,2.3863,67.7657,5.9072c20.1079,3.1758,39.5485,8.5963,55.7,21.558
	c15.6963,12.5963,29.2531,29.2695,40.9388,45.5461c11.8752,16.5402,23.2302,34.9225,30.1526,54.1568
	c3.2183,8.9421,6.8928,18.6378,7.8779,28.1332c1.1016,10.6202-0.9648,19.2577-6.2202,28.4807
	c-10.1318,17.7805-24.4211,32.9326-35.489,50.126c-5.583,8.6729-9.6936,17.2821-8.1272,27.8564
	c1.5747,10.6291,6.9783,20.636,12.1709,29.8923c9.8293,17.5203,21.5195,34.1235,30.4695,52.1269
	c4.1145,8.2762,7.9856,17.6038,7.1602,27.0314c-0.873,9.9706-6.8962,18.98-12.7485,26.7786
	c-12.3955,16.5182-27.3953,30.9061-39.7224,47.4825c-5.7537,7.7368-11.4421,16.1678-11.7715,26.1475
	c-0.349,10.5802,2.4435,20.917,6.0121,30.7833c7.3593,20.3463,17.4034,40.3459,23.2218,61.1707
	c6.0962,21.8181-0.4746,39.7147-13.5889,57.3821c-12.5927,16.9652-28.8911,30.9794-43.8359,45.7869
	c-14.4075,14.2753-27.1533,28.6671-27.001,50.0262c0.078,10.9647,0.1594,21.9293,0.2654,32.8938
	c0.1068,11.0503,1.4434,22.9386-1.6632,33.6997c-5.4886,19.0134-21.4039,36.1284-34.7365,50.1152
	c-14.4594,15.1687-30.6368,28.7886-47.7722,40.8331c-17.229,12.1102-34.8148,20.5139-55.1942,25.6375
	c-20.9213,5.2599-42.9412,7.8329-64.4313,9.6827c-90.5679,7.7957-181.6688,2.4065-272.3201-0.8159
	c-44.7479-1.5908-89.6749-4.4669-134.2426-8.8455c-10.2728-1.0093-20.5367-1.4325-30.8199-2.1771
	c-10.1438-0.7345-20.5139-3.3689-30.5206-5.2036c-21.0529-3.8597-42.129-7.6986-63.1381-11.7871
	c-42.7938-8.328-85.7592-15.8619-128.62-23.8524c-21.6165-4.0298-43.25-7.9535-64.874-11.9396
	c-10.5157-1.9385-21.0328-3.881-31.521-5.9642c-3.2131-0.6381-6.5777-1.077-7.1765-4.8949
	c-0.9216-5.8757-0.113-12.4637-0.1102-18.4089c0.0895-185.7694,0.0862-371.5388,0.087-557.3082
	c0.0001-11.146,0.0001-22.2924,0.0002-33.4384c0-2.7115-0.8728-7.2691,0.6964-9.6804c1.8351-2.8201,9.785-1.3683,12.4819-1.3834
	c9.8492-0.0552,19.8955,0.8073,29.6094-1.1854c9.9312-2.0372,19.0519-6.6622,27.5282-12.1067
	c34.0913-21.8972,59.651-57.7686,81.01-91.4886c23.2795-36.7521,43.9276-75.4404,62.1334-114.9429
	c18.3373-39.788,34.3848-80.5327,51.8765-120.6971c17.0248-39.0923,48.2561-65.2728,80.8578-91.2554
	c16.4827-13.1361,32.6666-26.548,46.3193-42.7003c13.8022-16.3293,24.9845-34.8267,33.7615-54.2959
	c18.1166-40.1859,30.1417-84.3115,36.2227-127.9681c6.2136-44.6116,12.6005-89.2005,14.9655-134.2462
	c0.3915-7.4563,1.6073-14.5817,7.3704-19.8748c2.4473-2.2476,5.3876-3.8947,8.4872-5.0599
	C1513.9449,63.4004,1519.2778,63.2971,1520.5629,60.7246C1530.4342,60.7246,1519.7723,62.3071,1520.5629,60.7246z
	 M654.1641,898.2689c0,113.5108,0,227.0218,0,340.5325c0,46.5209,0,93.0417,0,139.5626c0,23.2604,0,46.5209,0,69.7813
	c0,12.0956,0,24.1909,0,36.2863c0,5.5826,0,11.165,0,16.7476c2.9518,0.6001,3.0689,7.4297,3.9023,9.6901
	c5.8673,15.9106,20.7537,29.5836,36.6451,35.1024c9.34,3.2439,18.8117,3.2965,28.5798,3.3029
	c11.0439,0.0074,22.0878,0.012,33.1318,0.0145c46.0164,0.0112,92.0328-0.0095,138.0493,0.0101
	c19.0814,0.0082,36.9496-6.9194,49.56-21.6554c13.4414-15.7072,14.5669-34.699,14.5618-54.4558
	c-0.012-46.6202-0.0196-93.2406-0.025-139.8608c-0.0109-93.2407-0.0132-186.4812-0.0248-279.7219
	c-0.0057-46.3734,1.1533-92.9179-0.0865-139.2733c-0.5342-19.9727-7.4376-38.3519-23.3443-51.1132
	c-15.4163-12.3679-33.5844-13.338-52.5065-13.3804c-46.3998-0.1041-92.7999-0.1375-139.1995-0.0057
	c-20.9935,0.0595-42.7304-1.9652-61.1382,10.0648c-7.4174,4.8474-13.9482,11.0446-18.7111,18.5484
	c-2.1867,3.4451-3.9904,7.1271-5.4059,10.9533C657.395,891.446,656.8574,897.8079,654.1641,898.2689
	C654.1641,1099.2389,655.7422,897.9987,654.1641,898.2689z"/>
</svg>
`;

thumbs_down = `
<svg width="1em" height="1em" x="0px" y="0px" fill="#ffc83d" viewBox="0 0 1000 1000" enable-background="new 0 0 1000 1000" xml:space="preserve">
<g><g transform="translate(0.000000,512.000000) scale(0.100000,-0.100000)"><path d="M5703.7,5010.1c-354.2-36.4-785.1-126.4-1453.3-300.6c-601.2-158.9-859.7-203-1392-233.6l-212.5-11.5l-13.4,61.3c-15.3,78.5-126.4,185.7-208.7,201c-34.5,5.7-432.7,9.6-888.5,5.7c-800.4-5.7-827.2-7.7-878.9-45.9c-28.7-21.1-70.8-63.2-91.9-91.9c-40.2-51.7-40.2-61.3-40.2-2079.4c0-2025.8,0-2027.7,40.2-2081.4c21.1-28.7,68.9-72.8,103.4-97.6l65.1-44.1l863.6,5.7l865.5,5.8l67,51.7c36.4,28.7,78.5,80.4,90,114.9c13.4,34.5,30.6,78.5,38.3,97.7c9.6,30.6,34.5,19.2,187.7-82.3c459.5-302.5,679.7-631.9,1001.4-1503.1c212.5-572.5,277.6-670.2,832.9-1235c224-225.9,430.8-450,463.4-497.9c220.2-325.5,394.4-855.9,474.9-1436.1c38.3-281.5,72.8-386.8,160.8-478.7c164.7-174.2,409.7-147.4,608.9,63.2c277.6,293,446.1,790.8,446.1,1309.7c0,423.2-42.1,545.7-354.2,1039.7c-337,534.2-450,764-450,909.5c0,93.8,120.6,220.2,285.3,302.5l126.4,61.3l509.3-5.7c944-11.5,1771.2,47.9,1964.6,141.7c147.4,70.8,367.6,314,467.2,515.1c137.9,275.7,124.5,388.7-90,817.6c-88.1,176.2-120.6,260.4-111.1,289.1c5.8,23,59.4,120.6,116.8,216.4c105.3,178.1,178.1,367.6,178.1,469.1c0,105.3-76.6,258.5-239.3,472.9c-90,120.6-166.6,237.4-172.3,258.5c-5.8,23,13.4,107.2,44,185.7c155.1,404,137.9,501.7-164.7,913.4c-84.3,113-158.9,225.9-166.6,250.8c-7.7,24.9,9.6,155.1,40.2,308.3l51.7,266.2l-42.1,86.2c-53.6,109.1-231.7,277.6-390.6,365.7c-160.8,90-350.4,149.4-735.3,229.8C6906.2,4966,6098.1,5050.3,5703.7,5010.1z"/></g></g>
</svg>
`;
}