(function () {
  "use strict";
  // Nur Entladung: Die vorgegebene e-Funktion wird erst NACH der physikalischen
  // Herleitung als Lösung der Differentialgleichung überprüft.
  const L = [
    {
      title:"Was ist gegeben – und was müssen wir beweisen?",
      lead:"Du hast die Formel mit e bereits auf dem Blatt. Sie ist die Entladungsfunktion (eine Lösung), nicht die Differentialgleichung. Deine Aufgabe: Die Differentialgleichung aus der Schaltung herleiten und prüfen, ob die gegebene Funktion passt.",
      eq:["Q(t)=Q_0\\cdot e^{-\\frac{t}{RC}}","\\text{Gesucht:}\\quad Q(t)+RC\\cdot\\dot Q(t)=0"],
      why:"<b>Wichtig:</b> Eine Funktion sagt dir den Wert zu jedem Zeitpunkt. Eine Differentialgleichung sagt dir, wie Funktion und Änderungsrate zusammenhängen. Das sind zwei unterschiedliche Aussagen.",
      question:"Was steht schon fest, bevor wir losrechnen?",
      options:["Die Exponentialfunktion ist vorgegeben; wir prüfen, ob sie zur Schaltung passt.","Wir müssen zuerst integrieren und dann das e erfinden.","Das e ist schon die Ableitung."],
      correct:0, feedback:"Richtig. Du musst die e-Funktion hier nicht neu entdecken. Erst die Physik, danach die Probe.",
      hint:"Lies die beiden Formeln im Kasten: Sie sehen unterschiedlich aus – können aber trotzdem denselben Vorgang beschreiben."
    },
    {
      title:"Maschenregel – warum gleich null?",
      lead:"Der Kondensator wird nur über den Widerstand entladen; es ist keine Spannungsquelle mehr in dieser Masche. Wir legen eine feste Richtung und Vorzeichenkonvention fest.",
      eq:["U_R(t)+U_C(t)=0"],
      why:"Ein Beispiel mit Vorzeichen: Am Kondensator liegt +6 V, am Widerstand in der gewählten Zählrichtung −6 V. +6 V − 6 V = 0. Das Plus in der Formel bedeutet <b>nicht</b>, dass beide Spannungen positiv sein müssen.",
      question:"Warum ergibt die Summe der vorzeichenbehafteten Spannungen null?",
      options:["Wegen der Kirchhoffschen Maschenregel.","Weil Widerstände immer 0 V haben.","Weil beim Entladen keine Ladung vorhanden ist."],
      correct:0, feedback:"Ja. Eine vollständige geschlossene Masche hat insgesamt keine Spannungsänderung.",
      hint:"Einmal ganz um den Kreis herum: Wo du anfängst, kommst du wieder an."
    },
    {
      title:"Die Spannungen durch bekannte Formeln ersetzen",
      lead:"Noch keine Ableitung! Wir ersetzen nur die Spannung am Widerstand und die am Kondensator.",
      eq:["U_R=R\\cdot I","Q=C\\cdot U_C\\quad\\Rightarrow\\quad U_C=\\frac{Q}{C}","R\\cdot I+\\frac{Q}{C}=0"],
      why:"<b>Warum Q/C?</b> Aus Q = C·U teilen wir beide Seiten durch C. So erhalten wir U_C = Q/C. Beide Spannungen stehen jetzt als R·I bzw. Q/C in der Maschengleichung.",
      question:"Was setzt du für die Kondensatorspannung U_C ein?",
      options:["Q/C","Q·C","R·I"],
      correct:0, feedback:"Genau. Die Kondensatorformel Q = C·U wurde nur nach U umgestellt.",
      hint:"Q = C·U. Was musst du tun, damit U allein steht?"
    },
    {
      title:"Warum wird aus I eine Ableitung?",
      lead:"Stromstärke bedeutet Ladungsänderung pro Zeit. Für den momentanen Wert verwenden wir eine Ableitung: Q̇(t) = dQ/dt.",
      eq:["I=\\frac{dQ}{dt}=\\dot Q(t)","R\\cdot\\dot Q(t)+\\frac{Q(t)}{C}=0"],
      why:"<b>Vorzeichen:</b> Hier ist I als vorzeichenbehafteter Strom in der für die Maschenregel gewählten Richtung definiert. Beim Entladen wird Q kleiner: Q̇(t) &lt; 0. Falls man den <i>herausfließenden</i> Strom ausdrücklich positiv zählt, gilt stattdessen I<sub>aus</sub> = −Q̇(t). Das sind nur unterschiedliche Vorzeichenkonventionen.",
      question:"Was bedeutet der Punkt über Q?",
      options:["Die zeitliche Ableitung von Q: Wie schnell ändert sich die Ladung?","Die Anfangsladung bei t = 0.","Die Ladung geteilt durch die Kapazität."],
      correct:0, feedback:"Richtig. Genau deshalb taucht jetzt erstmals eine Differentialgleichung auf.",
      hint:"Vergleiche die Durchschnittsänderung ΔQ/Δt mit der momentanen Änderungsrate dQ/dt."
    },
    {
      title:"Den Bruch entfernen: mit C multiplizieren",
      lead:"Wir wollen Q/C loswerden. Dazu multiplizieren wir BEIDE Summanden und die rechte Seite mit C.",
      eq:["R\\cdot\\dot Q(t)+\\frac{Q(t)}{C}=0","C\\cdot R\\cdot\\dot Q(t)+C\\cdot\\frac{Q(t)}{C}=0","\\boxed{RC\\cdot\\dot Q(t)+Q(t)=0}"],
      why:"Beim Term C·(Q/C) kürzt sich C heraus, also bleibt Q. Im anderen Term entsteht R·C·Q̇. So kommt das <b>RC</b> in die Gleichung.",
      question:"Was wird aus C·(Q/C)?",
      options:["Q","Q/C²","0"],
      correct:0, feedback:"Genau. C oben und unten kürzen sich. Hier hast du die eigentliche Differentialgleichung bereits hergeleitet!",
      hint:"Eine Zahl mal (Q durch dieselbe Zahl) ergibt wieder Q."
    },
    {
      title:"Nach Q̇(t) umstellen",
      lead:"Das ist gewöhnliche Algebra, noch keine neue Ableitung. Erst Q(t) auf beiden Seiten abziehen, dann durch RC teilen.",
      eq:["Q(t)+RC\\cdot\\dot Q(t)=0","RC\\cdot\\dot Q(t)=-Q(t)","\\boxed{\\dot Q(t)=-\\frac{Q(t)}{RC}}"],
      why:"Wie bei 5 + 3x = 0 → 3x = −5 → x = −5/3. Das Minus entsteht durch das Umstellen. Die Schreibweisen −Q/(RC) und −(1/RC)·Q sind gleich.",
      question:"Was machst du direkt nach RC·Q̇(t) = −Q(t)?",
      options:["Beide Seiten durch RC teilen.","Nur die linke Seite durch RC teilen.","Mit Q(t) multiplizieren."],
      correct:0, feedback:"Richtig. Deine eigene Rechnung dazu war korrekt: Q̇(t) = −Q(t)/(RC).",
      hint:"Was steht unmittelbar VOR der gesuchten Größe Q̇(t)?"
    },
    {
      title:"Die gegebene e-Funktion ableiten",
      lead:"Jetzt nehmen wir die Formel vom Anfang wieder hervor. Wir müssen ihre Ableitung kennen, damit wir sie in die Differentialgleichung einsetzen können.",
      eq:["Q(t)=Q_0\\cdot e^{-\\frac{t}{RC}}","\\left(e^{g(t)}\\right)'=g'(t)\\cdot e^{g(t)}","g(t)=-\\frac{t}{RC}\\quad\\Rightarrow\\quad g'(t)=-\\frac{1}{RC}"],
      why:"<b>Warum bleibt Q₀ stehen?</b> Q₀ ist die feste Anfangsladung – wie die 5 in 5·t². Nach der Faktorregel bleibt sie beim Ableiten als Faktor. <b>Woher kommt −1/(RC)?</b> Aus der Ableitung des Exponenten (Kettenregel).",
      question:"Wie lautet die Ableitung des Exponenten −t/(RC)?",
      options:["−1/(RC)","−t/(RC)","0, weil R und C konstant sind"],
      correct:0, feedback:"Ja. Nur t wird nach t abgeleitet. R und C sind konstante Faktoren.",
      hint:"Schreibe −t/(RC) als (−1/(RC))·t. Die Ableitung von t ist 1."
    },
    {
      title:"Die vollständige Ableitung aufschreiben",
      lead:"Bei einer e-Funktion bleibt e mit demselben Exponenten erhalten. Wir multiplizieren nur mit der Ableitung des Exponenten.",
      eq:["Q(t)=Q_0\\cdot e^{-\\frac{t}{RC}}","\\boxed{\\dot Q(t)=-\\frac{1}{RC}\\cdot Q_0\\cdot e^{-\\frac{t}{RC}}}"],
      why:"<b>Woher kommt der zusätzliche Faktor?</b> Die Kettenregel liefert −1/(RC) VOR Q₀·e. Hättest du den allgemeinen Ansatz Q₀·e<sup>kt</sup>, wäre die Ableitung k·Q₀·e<sup>kt</sup>. Hier ist k bereits durch −1/(RC) ersetzt.",
      question:"Warum steht kein zusätzliches k mehr vor Q₀?",
      options:["Weil k bereits −1/(RC) ist; beides zusammen wäre doppelt.","Weil k beim Ableiten immer null wird.","Weil man Exponentialfunktionen nicht ableiten kann."],
      correct:0, feedback:"Richtig. Auf deinem Foto stand k noch zusätzlich – jetzt siehst du, warum es wegmuss.",
      hint:"Wenn k = −1/(RC), schreibst du entweder k ODER −1/(RC), nicht beides."
    },
    {
      title:"Die gegebene Funktion in die Differentialgleichung einsetzen",
      lead:"Wir haben jetzt Q(t) und Q̇(t). In der Differentialgleichung ersetzen wir jedes Symbol durch den passenden Ausdruck.",
      eq:["Q(t)+RC\\cdot\\dot Q(t)=0","Q_0e^{-\\frac{t}{RC}}+RC\\cdot\\left(-\\frac{1}{RC}Q_0e^{-\\frac{t}{RC}}\\right)=0"],
      why:"Beim Einsetzen darfst du das <b>C</b> nicht vergessen. Vor Q̇ steht <b>RC</b>, nicht nur R. Das war die zweite kleine Ungenauigkeit auf deinem letzten Foto.",
      question:"Welcher Faktor steht in der Differentialgleichung vor Q̇(t)?",
      options:["RC","nur R","nur C"],
      correct:0, feedback:"Genau. Damit stimmt dein Ansatz zum Überprüfen.",
      hint:"Schau auf die Gleichung, die du direkt aus der Maschenregel hergeleitet hast."
    },
    {
      title:"Kürzen und zeigen: 0 = 0",
      lead:"Jetzt vereinfachen wir. RC·(−1/(RC)) ist −1. Dadurch bleiben zwei identische Terme mit entgegengesetztem Vorzeichen.",
      eq:["RC\\cdot\\left(-\\frac{1}{RC}\\right)=-1","Q_0e^{-\\frac{t}{RC}}-Q_0e^{-\\frac{t}{RC}}=0","\\boxed{0=0}"],
      why:"<b>Was ist bewiesen?</b> Die gegebene Funktion erfüllt die aus dem Entladekreis hergeleitete Differentialgleichung. Außerdem stimmt der Anfangswert: Q(0) = Q₀·e⁰ = Q₀. Die Probe ist abgeschlossen.",
      question:"Was bedeutet das Ergebnis 0 = 0?",
      options:["Die vorgegebene e-Funktion erfüllt die hergeleitete Differentialgleichung.","Die Ladung ist zu jedem Zeitpunkt null.","Die Herleitung war falsch."],
      correct:0, feedback:"Genau. Das ist der geforderte Nachweis – keine zweite Herleitung mit Integral notwendig.",
      hint:"Du hast die Funktion eingesetzt und eine für alle Zeiten wahre Gleichung erhalten."
    },
    {
      title:"Warum gibt es dieselbe Rechnung mit U?",
      lead:"Die Ladung und die Spannung hängen direkt zusammen: Q = C·U. Bei konstanter Kapazität haben beide den gleichen exponentiellen Verlauf.",
      eq:["Q(t)=C\\cdot U(t)\\quad\\Rightarrow\\quad\\dot Q(t)=C\\cdot\\dot U(t)","\\dot U(t)=-\\frac{1}{RC}U(t)","U(t)=U_0\\cdot e^{-\\frac{t}{RC}}"],
      why:"<b>Wo ist das e in der Differentialgleichung?</b> Gar nicht ausdrücklich – sie beschreibt nur die Beziehung zwischen einer Funktion und ihrer Ableitung. Erst in der konkreten Lösung steht e. Der Unterschied zwischen Q und U ist nur die beschriebene physikalische Größe.",
      question:"Welche Aussage ist richtig?",
      options:["Die Differentialgleichung enthält Q̇ oder U̇; die konkrete Lösung enthält e.","Es gibt nur eine Differentialgleichung mit Q, nie mit U.","Die e-Funktion verschwindet durch die Maschenregel dauerhaft."],
      correct:0, feedback:"Richtig. Du kannst die Entladung mit Q oder U beschreiben, solange C konstant ist.",
      hint:"Vergleiche: Q̇ = −Q/(RC) und Q = Q₀e^(−t/(RC))."
    }
  ];
  const cards = [
    ["Was ist am Anfang bereits gegeben?","Die Entladungsfunktion Q(t) = Q₀·e^(−t/(RC)). Sie ist eine Lösung, nicht die Differentialgleichung."],
    ["Wie lautet die Maschenregel für den Entladekreis?","U_R + U_C = 0, mit vorzeichenbehafteten Spannungen."],
    ["Was setzt man für U_R und U_C ein?","U_R = R·I und U_C = Q/C. Also: R·I + Q/C = 0."],
    ["Warum ersetzt man I durch Q̇(t)?","Q̇(t) = dQ/dt beschreibt die momentane Änderung der Ladung. Hier ist I vorzeichenbehaftet."],
    ["Was ergibt das Multiplizieren mit C?","RC·Q̇(t) + Q(t) = 0. Beim Q/C-Term kürzt sich C."],
    ["Wie stellt man nach Q̇(t) um?","Q(t) abziehen, dann durch RC teilen: Q̇(t) = −Q(t)/(RC)."],
    ["Warum bleibt Q₀ beim Ableiten stehen?","Q₀ ist die konstante Anfangsladung. Nach der Faktorregel bleibt sie als Faktor."],
    ["Woher kommt −1/(RC) beim Ableiten?","Aus der Kettenregel: Der Exponent −t/(RC) hat die Ableitung −1/(RC)."],
    ["Warum darf k nicht zusätzlich stehen bleiben?","k wurde schon durch −1/(RC) ersetzt. Nicht k UND −1/(RC) schreiben."],
    ["Wie lautet die Ableitung der vorgegebenen Funktion?","Q̇(t) = −(1/(RC))·Q₀·e^(−t/(RC))."],
    ["Was muss beim Einsetzen vor Q̇(t) stehen?","Der Faktor RC – nicht nur R."],
    ["Was beweist die Rechnung 0 = 0?","Die vorgegebene Funktion erfüllt die hergeleitete Differentialgleichung; Q(0) = Q₀."],
    ["Wo ist das e in Q̇ = −Q/(RC)?","Die Differentialgleichung gibt die Änderungsbeziehung an. e steht in ihrer konkreten Lösung."],
    ["Warum darf man auch mit U statt Q rechnen?","Q = C·U und C ist konstant. Deshalb gilt auch U̇ = −U/(RC)."]
  ];
  const $ = id => document.getElementById(id);
  const stateKey = "entladung-lernweg.v1";
  let saved = { done: [], known: [], step: 0 };
  try {
    const old = JSON.parse(localStorage.getItem(stateKey) || "{}");
    saved = { done: Array.isArray(old.done) ? old.done : [], known: Array.isArray(old.known) ? old.known : [], step: Number.isInteger(old.step) ? old.step : 0 };
  } catch (_) {}
  let step = Math.max(0, Math.min(L.length - 1, saved.step));
  let card = 0, reversed = false, currentMode = "weg";
  function persist() { try { localStorage.setItem(stateKey, JSON.stringify(saved)); } catch (_) {} }
  function math(target, expression) {
    if (window.katex) {
      try { window.katex.render(expression, target, { displayMode:true, throwOnError:true, strict:"ignore", trust:false }); return; } catch (e) { /* Fallback below */ }
    }
    target.textContent = expression.replaceAll("\\\\", "\\");
  }
  function mode(name) {
    currentMode = name;
    document.querySelectorAll(".mode-nav button").forEach(b => b.setAttribute("aria-selected", String(b.dataset.mode === name)));
    document.querySelectorAll(".mode-panel").forEach(s => { s.hidden = s.dataset.panel !== name; });
    if (name === "karten") showCard();
    if (name === "weg") render();
  }
  function renderList() {
    const list = $("step-list");
    list.replaceChildren();
    L.forEach((item, i) => {
      const li = document.createElement("li"), b = document.createElement("button");
      b.type = "button"; b.setAttribute("aria-current", i === step ? "step" : "false");
      if (saved.done.includes(i)) b.classList.add("step-done");
      const num = document.createElement("span"); num.className="step-no"; num.textContent=saved.done.includes(i)?"✓":String(i + 1);
      const label = document.createElement("span"); label.className="step-label"; label.textContent=item.title;
      b.append(num, label); b.addEventListener("click", () => go(i)); li.append(b); list.append(li);
    });
  }
  function render() {
    const item = L[step];
    $("step-counter").textContent = "Schritt " + (step + 1) + " von " + L.length;
    $("done-counter").textContent = saved.done.length + " von " + L.length + " verstanden";
    $("meter-fill").style.width = (saved.done.length / L.length * 100) + "%";
    $("lesson-title").textContent = item.title; $("lesson-lead").textContent = item.lead;
    $("equations").replaceChildren();
    item.eq.forEach((eq, i) => {
      const div=document.createElement("div"); div.className="equation";
      math(div, eq); $("equations").append(div);
    });
    $("reason").innerHTML = item.why;
    $("challenge-title").textContent = item.question;
    $("hint-text").textContent = item.hint;
    $("hint-detail").open=false;
    $("options").replaceChildren();
    $("feedback").hidden = true; $("feedback").className = "feedback";
    item.options.forEach((opt, i) => {
      const b = document.createElement("button"); b.type="button"; b.className="option"; b.textContent=opt;
      b.addEventListener("click", () => check(i, b));
      $("options").append(b);
    });
    $("prev").disabled = step === 0;
    $("next").disabled = !saved.done.includes(step);
    $("next").textContent = step === L.length-1 ? "Lernkarten üben →" : "Nächster Schritt →";
    $("complete").classList.toggle("visible", saved.done.length === L.length);
    renderList();
  }
  function check(i, btn) {
    const item=L[step], ok=i===item.correct;
    $("options").querySelectorAll("button").forEach(b=>b.classList.remove("wrong","correct"));
    btn.classList.add(ok?"correct":"wrong");
    const feedback=$("feedback"); feedback.hidden=false;
    feedback.className="feedback "+(ok?"ok":"no");
    feedback.textContent=ok?item.feedback:"Das passt hier noch nicht. "+item.hint;
    if(ok){if(!saved.done.includes(step))saved.done.push(step);persist();renderList();$("next").disabled=false;
      $("done-counter").textContent=saved.done.length+" von "+L.length+" verstanden";$("meter-fill").style.width=(saved.done.length/L.length*100)+"%";
      if(saved.done.length===L.length)$("complete").classList.add("visible");
    }
  }
  function go(n) {
    if(n<0 || n>=L.length)return;
    step=n;saved.step=n;persist();render();
    document.querySelector(".lesson-card").scrollIntoView({behavior:"smooth",block:"start"});
  }
  function showCard() {
    card=Math.max(0,Math.min(cards.length-1,card));
    $("flashcard-index").textContent="Karte "+(card+1)+" von "+cards.length;
    $("flashcard-known").textContent=saved.known.length+" von "+cards.length+" sitzen";
    $("flashcard-content").textContent=cards[card][reversed?1:0];
    $("flashcard-face").textContent=reversed?"Antwort":"Frage";
    $("flashcard").setAttribute("aria-label",reversed?"Antwort. Zum Umdrehen klicken.":"Frage. Zum Anzeigen der Antwort klicken.");
    $("card-mark").hidden=!reversed;
    $("card-again").hidden=!reversed;
  }
  function nextCard(known) {
    if(known && !saved.known.includes(card))saved.known.push(card);
    if(!known)saved.known=saved.known.filter(x=>x!==card);
    card=(card+1)%cards.length;reversed=false;persist();showCard();
  }
  document.querySelectorAll(".mode-nav button").forEach(b=>b.addEventListener("click",()=>mode(b.dataset.mode)));
  $("prev").addEventListener("click",()=>go(step-1));
  $("next").addEventListener("click",()=>{if(step===L.length-1)mode("karten");else go(step+1);});
  $("restart").addEventListener("click",()=>{
    if(!confirm("Lernweg-Fortschritt zurücksetzen? Deine Lernkarten-Bewertungen bleiben erhalten."))return;
    saved.done=[];go(0);
  });
  $("flashcard").addEventListener("click",()=>{reversed=!reversed;showCard();});
  $("card-mark").addEventListener("click",()=>nextCard(true));
  $("card-again").addEventListener("click",()=>nextCard(false));
  $("card-prev").addEventListener("click",()=>{card=(card+cards.length-1)%cards.length;reversed=false;showCard();});
  $("card-next").addEventListener("click",()=>{card=(card+1)%cards.length;reversed=false;showCard();});
  $("goto-lesson").addEventListener("click",()=>mode("weg"));
  $("home-brand").addEventListener("click",()=>{mode("weg");window.scrollTo({top:0,behavior:"smooth"});});
  math($("hero-formula"), "Q(t)=Q_0\\cdot e^{-\\frac{t}{RC}}");
  render();showCard();mode("weg");
  if ("serviceWorker" in navigator && (location.protocol==="https:" || location.hostname==="localhost")) {
    addEventListener("load",()=>navigator.serviceWorker.register("sw.js").catch(()=>{}));
  }
})();
