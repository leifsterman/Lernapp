# Kondensatorentladung – Physik LK

Die App konzentriert sich in der aktuellen Version bewusst **nur auf die Entladung** eines Kondensators. Ziel ist ein nachvollziehbarer Nachweis einer **bereits vorgegebenen** e-Funktion – nicht die vollständige Behandlung des Ladens und Entladens, keine Integralrechnung als Pflichtweg.

## Lernziel und Reihenfolge

**Gegeben:** \(Q(t)=Q_0e^{-t/(RC)}\). Das ist die *Entladungsfunktion*, nicht die Differentialgleichung.

1. Unterscheiden: bekannte e-Funktion versus gesuchte Differentialgleichung.
2. Maschenregel im idealen Entladekreis: \(U_R+U_C=0\), mit konsistenter Vorzeichenkonvention.
3. \(U_R=RI\), \(U_C=Q/C\) einsetzen: \(RI+Q/C=0\).
4. Bei vorzeichenbehaftetem Strom \(I=\dot Q\): \(R\dot Q+Q/C=0\).
5. Mit \(C\) multiplizieren: \(RC\dot Q+Q=0\).
6. Nach \(\dot Q\) umstellen: \(\dot Q=-Q/(RC)\).
7. Die gegebene Funktion ableiten (Faktorregel für \(Q_0\), Kettenregel für \(-t/(RC)\)): \(\dot Q=-Q_0e^{-t/(RC)}/(RC)\).
8. Beide Ausdrücke in die Differentialgleichung einsetzen und \(RC\) kürzen: \(0=0\).
9. Anfangsbedingung prüfen: \(Q(0)=Q_0\).
10. Verstehen, warum analog \(\dot U=-U/(RC)\) und \(U(t)=U_0e^{-t/(RC)}\) gelten.

**Vorzeichenhinweis:** Wer den aus dem Kondensator herausfließenden Strom als positiv definiert, verwendet \(I_{\mathrm{aus}}=-\dot Q\). Die App verwendet wie im gezeigten Unterrichtsweg einen vorzeichenbehafteten Strom \(I=\dot Q\).

## Aufbau

- **Schritt für Schritt:** elf kurze Abschnitte mit Formel, Begründung, Verständnisfrage, Fehlerrückmeldung und Hinweis.
- **Lernkarten:** vierzehn Karten über die konkret aufgetretenen Verständnisprobleme (Q₀, Kettenregel, k, RC, Minuszeichen, U vs. Q, Probe).
- **Meine Fragen:** kurze Erklärungen, die bei den typischen Fehlern aus dem Lernprozess ansetzen.
- **Fortschritt:** lokal im Browser gespeichert (kein Konto nötig).
- **Mobilfreundlich / offline:** responsive, KaTeX im Build lokal eingebettet, Service Worker.

Die älteren Dateien für andere Themen verbleiben zur Rückfallmöglichkeit im Repository, werden aber nicht mehr in den aktuellen Build aufgenommen.

## Ausführen

Lokal das Repository mit einem HTTP-Server bereitstellen, beispielsweise `python -m http.server`, dann `index.html` öffnen. Für GitHub Pages:

```sh
node build.mjs
```

Erzeugt `public/index.html` sowie `dist/artifact.html`; das GitHub-Actions-Deployment baut beim Merge nach `main` automatisch.

Tests:

```sh
node --test tests/*.test.mjs
```

## Quellen und Grenzen

- [LEIFIphysik: Entladen eines Kondensators](https://www.leifiphysik.de/elektrizitaetslehre/kondensator-kapazitaet/ausblick/entladen-eines-kondensators-theorie)
- [OpenStax University Physics 2, §10.5 RC Circuits](https://openstax.org/books/university-physics-volume-2/pages/10-5-rc-circuits)

Idealisierung: konstanter ohmscher Widerstand, konstante Kapazität, keine Spannungsquelle im Entladekreis. Die Probe zeigt, dass die gegebene Funktion die Gleichung erfüllt; sie ersetzt keine separate Diskussion über allgemeine Existenz- und Eindeutigkeitssätze.
