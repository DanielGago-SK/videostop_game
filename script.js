/** naťahaj potrebné objekty a zadefinuj potrebné premenné **/

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
current = 0; /* aktuálny klik */
score = 0; /* skóre */
counter = 120; /* časomiera - odpočítavanie */
timer = 120; /* dĺžka hry v sekundách */
change_interval = 1000; /* interval pre zmenu hodnoty kociek */
game_running = false;


// ? je v pamäti uložený dajaký rekord? 
if (sessionStorage.getItem("new_record")) {
  new_record = sessionStorage.getItem("new_record");
  if (new_record == "false") {
    new_record = 0;
  }
} else {
  new_record = 0;
  sessionStorage.setItem("new_record", 0);
}


// ? je v pamäti uložená prémia?
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


// ? aké veľké budú kocky? 
// ? aká je šírka pre ne? 
/* ak nad 500px tak budú 150px, inak len 100px */
control_width = document.querySelector(".width").clientWidth;
if (control_width > 499) {
  box = 150;
  circle_r = 14;
} else {
  box = 100;
  circle_r = 10;
}


/* pole s grafikou kociek */
/* je tu aj nula - bez guličiek, keby sa to hodilo, a aj 7 - to je plná kocka */
/* tá nula mi zabezpečila aj to že môžem číslovať teraz pole rovno podľa hodnoty 1-6 */
color_cube_bgr = "rgb(222, 184, 135)";
/* alebo si vytiahni hodnotu farby z CSS ka
color_cube_bgr = getComputedStyle(
  document.documentElement,
  null
).getPropertyValue("--txt_color");*/
color_cube_stroke = "#6f9473";
cube_stroke_width = 4;
color_circle_bgr = "#2f4858";
color_circle_stroke = "#000";
circle_stroke_width = 1;

define_array()
// ! definíciu poľa musím mať ako funkciu, inak neprekreslím veľkosti kociek ak ich potrebujem meniť počas behu aplikácie... treba to znovu zavolať... 

function define_array() {
cube_values = [
  /* 0 */
  `
		<svg width="${box + 10}" height="${box + 10}">
			<rect x="5" y="5" rx="10" ry="10" width="${box}" height="${box}"
				style="fill:${color_cube_bgr};stroke:${color_cube_stroke};stroke-width:${cube_stroke_width};" />
			</svg>`,
  /* 1 */
  `
		<svg width="${box + 10}" height="${box + 10}">
			<rect x="5" y="5" rx="10" ry="10" width="${box}" height="${box}"
				style="fill:${color_cube_bgr};stroke:${color_cube_stroke};stroke-width:${cube_stroke_width};" />
			<circle cx="${box / 2 + 5}" cy="${
    box / 2 + 5
  }" r="${circle_r}" stroke="${color_circle_stroke}" stroke-width="${circle_stroke_width}" fill="${color_circle_bgr}" />
			</svg>`,
  /* 2 */
  `
		<svg width="${box + 10}" height="${box + 10}">
			<rect x="5" y="5" rx="10" ry="10" width="${box}" height="${box}"
				style="fill:${color_cube_bgr};stroke:${color_cube_stroke};stroke-width:${cube_stroke_width};" />
			<circle cx="${box / 4}" cy="${
    box / 4
  }" r="${circle_r}" stroke="${color_circle_stroke}" stroke-width="${circle_stroke_width}" fill="${color_circle_bgr}" />

			<circle cx="${box - box / 4 + 10}" cy="${
    box - box / 4 + 10
  }" r="${circle_r}" stroke="${color_circle_stroke}" stroke-width="${circle_stroke_width}" fill="${color_circle_bgr}" />
		</svg>`,
  /* 3 */
  `
		<svg width="${box + 10}" height="${box + 10}">
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
  /* 4 */
  `
		<svg width="${box + 10}" height="${box + 10}">
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
  /* 5 */
  `
		<svg width="${box + 10}" height="${box + 10}">
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
  /* 6 */
  `
		<svg width="${box + 10}" height="${box + 10}">
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
  /* 7 - full */
  `
		<svg width="${box + 10}" height="${box + 10}">
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

// ! na úvod kontrola či funguje vibrovanie (len Android to podporuje, iOS nie! a hra sa kvôli tomu zasekla...)
const canVibrate = window.navigator.vibrate;

/* hneď na úvod reset hry */
reset();

/* tlačidlo štart kontroluje štart hry, ale aj klikanie počas hry*/
/* išlo by to riešiť aj pomocou pridávania a odoberania dvoch rôznych listenner-ov - každý by bol aktívny inokedy ale v praxi to vyslovene netreba */
/* ak by boli dva listenery tak by sa kódy v podmienke prerobili na samostatné funkcie ktoré by sa volali nezávisle od seba */
button_start.addEventListener("click", () => {
  if (canVibrate) window.navigator.vibrate(30);
  /*ak hra nebežala, tak ju spusti... */
  if (!game_running) {
    /* reset pre istotu... */
    reset();
    /* stav hry zmeň na beží */
    game_running = true;
    /* tlačidlo "Štart" prekóduj */
    button_start.style.backgroundColor = "yellowgreen";
    button_start.innerText = "Klik";
    /* nahoď hneď už dajaké hodnoty kociek */
    change_cubes();
    /* a spusti intervaly na nahadzovanie kociek a kontrolu času hry */
    interval_cubes = setInterval(change_cubes, change_interval);
    interval_stopwatch = setInterval(stopwatch, 1000);
    /* počas hry zruš možnosť klikania na info tlačidlo, pre istotu... */
    rules_button.removeEventListener("click", rules_show);
    /* aj možnosť resize kociek! */
    window.removeEventListener("resize", resize_cubes);
    /* hra sa rozbehla, tak návrat */
    return;
  }

  /* kód pre stav keď hra beží, kontrola stavu kociek pri stlačení... */
  /* a zápis hodnôt skóre */

  if (cube_number1 == cube_number2 && cube_number1 == cube_number3) {
    /* ak sú všetky tri rovnaké - prémia + lepšie skóre... */
    // ! táto kontrola musí byť prvá !!
    premium_true();
    score += 6;
    score_info.innerText = score;
    last_click.innerText = "+ 6 bodov 👍";
  } else if (
    /* ak sú dve rovnaké, pridaj body */
    cube_number1 == cube_number2 ||
    cube_number1 == cube_number3 ||
    cube_number2 == cube_number3
  ) {
    score += 2;
    score_info.innerText = score;
    last_click.innerText = " + 2 body";
  } else {
    /* žiadna zhoda, body dolu */
    score -= 3;
    score_info.innerText = score;
    last_click.innerText = "-3 body 👎";
    if (score < 0) {
      /* ak skóre padlo pod nulu, koniec... A prémia je v čudu taktiež. */
      premium_false();
      /* stopni tú tragédiu... */
      stop();
    }
  }
});

function premium_true() {
  /* dosiahla sa prémia - zatiaľ iba kontrola v tejto hre! */
  /* zobrazí sa a uloží stav - len pre túto hru */
  premium_this_game = true;
  premium_info.innerText = "♥";
  premium_info.style.color = "red";
}

function premium_false() {
  /* prišli sme o prémiu - toto je vždy volané len keď to je globálne!, takže aj výmaz zo storage */
  premium_this_game = false;
  premium = false;
  premium_info.innerText = "-";
  premium_info.style.color = "burlywood";
  sessionStorage.setItem("premium", false);
}

button_rst.addEventListener("click", () => {
  if (canVibrate) window.navigator.vibrate(30);
  /* tlačidlo reset - stopni a resetni hru, ale rekordné skóre nenulujem */
  /* stopni zobrazovanie kociek aj meranie času */
  if (!game_running) {
    return; /* ak hra nebežala, nie je čo resetovať... */
  }
  clearInterval(interval_cubes);
  clearInterval(interval_stopwatch);
  button_start.style.backgroundColor = "green";
  button_start.innerText = "Štart";
  change_interval = 1000; /* vráť rýchlosť ak bola spomalená */
  /* nahranú prémiu z tejto hry zruš... (ak nebola predtým už dajaká nahraná tak zruš aj tú globálnu) */
  if (premium_this_game && !premium) {
    premium_false();
  }
  /* mrkni či sa počas hry neotočilo mobilom, bolo to bloknuté... */
  resize_cubes();
  reset();
});

function change_cubes() {
  /* funkcia len nahadzuje nové hodnoty kociek a zobrazí ich */
  cube_number1 = Math.floor(Math.random() * 6 + 1);
  cube1.innerHTML = cube_values[cube_number1];
  cube_number2 = Math.floor(Math.random() * 6 + 1);
  cube2.innerHTML = cube_values[cube_number2];
  cube_number3 = Math.floor(Math.random() * 6 + 1);
  cube3.innerHTML = cube_values[cube_number3];
}

function stopwatch() {
  /* kontrola behu hry, či nevypršal čas a jeho zobrazenie... */
  counter--;
  counter_info.innerText = counter;
  if (counter == 0) {
    stop();
  }
}

function stop() {
  /* zastav hru, koniec... */
  game_running = false;
  /* stopni zobrazovanie kociek aj meranie času */
  clearInterval(interval_cubes);
  clearInterval(interval_stopwatch);
  /* tlačidlo Štart je zasa Štart */
  button_start.style.backgroundColor = "green";
  button_start.innerText = "Štart";
  change_interval = 1000; /* vráť rýchlosť ak bola spomalená */
  /* spusti funkciu na záverečné zhodnotenie */
  final();
}

function final() {
  /* záverečné zhodnotenie */
  /* hoď obrazovku hore - dôležité iba pre telefóny na ležato, tam sa hrá mierne nižšie a obrazovka výsledkov je potom mimo... */
  window.scrollTo({
    top: 0,
    left: 0,
    behavior: "smooth",
  });
  /* vytvor end_status - kus html kódu ktorý sa zobrazí na obrazovke */
  end_status = `
    <p>Koniec hry!</p>`;
  /* výpis dosiahnutého skóre */
  end_status += `
    <p>Počet bodov:&nbsp; ${score}</p>
    `;
  /* kontrola nového rekordu, ak je, daj to vedieť */
  if (score > new_record) {
    end_status += `
    <p><span style = "color: green;">Máš nový rekord!</span></p>
    `;
    /* ulož novú hodnotu do premennej a do pamäti + hneď zobraz */
    new_record = score;
    sessionStorage.setItem("new_record", new_record);
    record_info.innerText = new_record;
  }
  /* kontrola dosiahnutej prémie (v tejto hre) a daj to vedieť */
  if (premium_this_game) {
    end_status += `
        <p>Aj prémia <span style = "color: red;">♥</span> bola. <br> 👍</p>`;
    /* a ulož premiu globálne */
    premium = premium_this_game;
    sessionStorage.setItem("premium", true);
    /* zobrazená tá prémia už bola počas hry... */
  }
  /* looser kontrola - body v mínuse... */
  if (score < 0) {
    end_status += `
      <p>Skončil(a) si v mínuse...<br><span style="color: red;">SI "LOSER"!</span></p>
      <p style = "font-size: 1rem";>(1 kolo trochu spomalíme...)</p>`;
    change_interval = 1300; 
    /* hráč nestíha, spomalíme na jedno kolo... predĺž interval obnovy kociek */
  }
  /* kontrola nulového stavu - slabý výkon... */
  if (score == 0) {
    end_status += `
      <p>Skončil(a) si s nulovým skóre...<br><span style="color: red;">Si nula...</span></p>`;
  }
  /* info o reštarte sa zobrazí neviditeľno, až neskôr sa zvidieľný - a je to bez pohybu, nie ako pri pridávaní p elementu... */
  end_status += `<p id = "restart_click" style = "color: rgba(34, 34, 34, 0.85); font-size: 1rem; padding-top: 0.5rem;">Klikni na obrazovku pre reštart hry...</p>`;
  /* zobraz ten blok */
  final_info.innerHTML = end_status;
  final_info.style.display = "flex";
  /* kontrola či sa nekliklo - ak áno tak skry tento blok a reset hry... */
  setTimeout(() => {
    /* aby sa v zápale hry nekliklo okamžite po konci na ten blok, tak je tu časovač na spustenie  */
    final_info.addEventListener("click", remove_final);
    /* zviditeľni ten text s info o reštarte */
    document.getElementById("restart_click").style.color = "white";
  }, 2000);
}

function reset() {
  /* nulovanie premenných a prekreslenie obsahu na hracej ploche */
  current = 0;
  score = 0;
  counter = timer;
  game_running = false;
  last_click.innerText = current;
  score_info.innerText = score;
  record_info.innerText = new_record;
  premium_this_game = false;
  counter_info.innerText = timer;
  /* 7. objekt v poli je plná kocka... */
  cube1.innerHTML = cube_values[7];
  cube2.innerHTML = cube_values[7];
  cube3.innerHTML = cube_values[7];
  /* aktivácia tlačidla s pravidlami */
  rules_button.addEventListener("click", rules_show);
  /* a kontroluj aj resize pri otáčaní mobilov či tabletov */
  window.addEventListener("resize", resize_cubes);
}

function remove_final() {
  /* odstráň blok a zruš mu zasa event listener na klik */
  final_info.style.display = "none";
  final_info.removeEventListener("click", remove_final);
  if (canVibrate) window.navigator.vibrate(60);
  /* mrkni či sa počas hry neotočilo mobilom */
  resize_cubes();
  reset();
}

function rules_show() {
  /* ak sa kliklo, zobraz pravidlá a potom ich na klik zasa zruš */
  if (canVibrate) window.navigator.vibrate(20);
  rules_info.style.height = "100vh";
  rules_info.addEventListener("click", function () {
    if (canVibrate) window.navigator.vibrate(20);
    rules_info.style.height = "0";
  });
}

function resize_cubes () {
  /* ak nastalo resize tak zasa zmeraj nové hodnoty šírky, predefinuj pole kociek a prekresli ich */
  control_width = document.querySelector(".width").clientWidth;
  if (control_width > 499) {
    box = 150;
    circle_r = 14;
  } else {
    box = 100;
    circle_r = 10;
  }
define_array();
reset();
}