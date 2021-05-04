// Feedback-Kommentar den jeder Studi bekommt (z.B. wie man dich bei Fragen erreichen kann)
const kommentar = "";

// Safetycheck ob der Nachnahme in der Zeile der Tabelle mit der Matrikelnummer steht (schützt vor Tippfehlern bei Matrikelnummer)
// würde ich empfehlen, es sei dann man pokert gerne ^^
// wenn deaktiviert muss die Textdatei immer noch das gleiche Format haben (sprich die gleiche Anzahl an Tabs pro Zeile)
const doublecheck = true;

// read the file asynchronously
function read_file(file) {
  let ready = false;
  const res = [];

  const check = function () {
    if (ready == true) {
      process(res);
      return;
    }
    setTimeout(check, 1000);
  };

  check();

  const reader = new FileReader();
  reader.onload = function (progressEvent) {
    const lines = this.result.split("\n");
    for (let i = 0; i < lines.length; i++) {
      if (lines[i] === "") continue;
      const val = lines[i].split("\t");

      // Student 1
      const name1 = val[0].split(" ")[1];
      const matr1 = val[1];

      // Student 2
      const name2 = val[2].split(" ")[1];
      const matr2 = val[3];

      // Student 3
      const name3 = val[4].split(" ")[1];
      const matr3 = val[5];

      // erreichte Punktzahl
      const punkte = val[6];

      // push stuff to working array
      res.push([name1, matr1, punkte]);
      res.push([name2, matr2, punkte]);
      res.push([name3, matr3, punkte]);
    }
  };
  reader.onloadend = (evt) => {
    ready = true;
  };
  reader.readAsText(file);
}

(function () {
  const file_input = document.createElement("input");
  file_input.type = "file";
  file_input.style = "display: none;";
  file_input.click();

  file_input.addEventListener("change", function () {
    read_file(file_input.files[0]);
  });
})();

function process(arr) {
  // iteriere über alle zu bewertenden Studis

  for (let i = 0; i < arr.length; i++) {
    // etwas ugly jedem den Kommentar zu schicken aber egal
    magic(arr[i][0], arr[i][1], arr[i][2], kommentar);
  }

  // verhindert, dass Studis random benachrichtigt werden (am besten trotzdem selbst nochmal pruefen)
  // sonst kriegt man unter Umständen tagelang Mails von Leuten die man gar nicht korrigiert hat
  selectElement("id_sendstudentnotifications", "0");
}

const find = (selector, text) => {
  const elements = Array.from(document.querySelectorAll(selector));
  return elements.find((x) => x.innerHTML === text);
};

function magic(name, matr, punkte, kommentar) {
  try {
    // Zeile in der Tabelle raussuchen die zur Matrikelnummer passt
    const elems_matr = get_elem_by_matrikelnummer(matr);
    if (elems_matr.length > 1) {
      throw (
        "[" +
        name +
        "] Mehrfaches Auftreten der Matrikelnummer " +
        matr +
        " in der Tabelle (z.B. im abgegebenen PDF enthalten).\n" +
        "Zur Sicherheit wird diese Bewertung überprungen. Bitte manuell eintragen."
      );
    }

    const row = get_elem_by_inner_elems(elems_matr[0], "tr")[0];

    // überprüfe ob die Suche ein gültiges Ergebnis geliefert hat. Falls nein, so ist die Matrikelnummer falsch (Tippfehler)
    if (typeof row == "undefined") {
      throw (
        "[" +
        name +
        "] Fehler bei Suche nach Matrikelnummer " +
        matr +
        " in der Tabelle (evtl. Tippfehler)\n" +
        "Zur Sicherheit wird diese Bewertung überprungen. Bitte manuell eintragen."
      );
    }

    // safety-check, falls aktiviert, wird in der Zeile mit dem Namen verglichen, falls diese sich unterscheiden
    // (bzw, der im Array angegebene Name nicht enthalten ist) handelt es sich wahrscheinlich um einen Tippfehler
    if (doublecheck) {
      const cell_name = row.getElementsByClassName("cell c2")[0];
      if (!cell_name.outerHTML.includes(name)) {
        throw (
          "[" +
          name +
          "] Inkonsistenz zwischen " +
          name +
          " und " +
          matr +
          " in der Tabelle (evtl. Tippfehler)\n" +
          "Zur Sicherheit wird diese Bewertung überprungen. Bitte manuell eintragen."
        );
      }
    }

    // Punkte eintragen
    const cell_punkte = row.getElementsByClassName("cell c5")[0];
    const text_punkte = cell_punkte.getElementsByClassName("quickgrade")[0];
    text_punkte.focus(); // evtl unnötig, macht aber nix kaputt
    text_punkte.value = punkte;

    // Feedback-Kommentar eintragen
    const cell_feedback = row.getElementsByClassName("cell c11")[0];
    const text_feedback = cell_feedback.getElementsByClassName("quickgrade")[0];
    text_feedback.focus(); // evtl unnötig, macht aber nix kaputt
    text_feedback.value = kommentar;
  } catch (error) {
    // Fehler ausgeben
    console.error(error);
  }
}

// Hilfsmethode um die Matrikelnummer zu finden (ist schlecht, dont judge)
function get_elem_by_matrikelnummer(matr) {
  const res = [];
  const elems = [...document.getElementsByTagName("td")];
  elems.forEach((elem) => {
    if (elem.outerHTML.includes(matr)) {
      res.push(elem);
    }
  });
  return res;
}

// Hilfsmethode um den Vaterknoten zu finden (ist schlecht, dont judge)
function get_elem_by_inner_elems(e, expected_outer) {
  const res = [];
  const elems = [...document.getElementsByTagName(expected_outer)];
  elems.forEach((elem) => {
    if (elem.contains(e)) {
      res.push(elem);
    }
  });
  return res;
}

// Hilfsmethode zum Setzen der Wahl in einem select-Element (html)
function selectElement(id, valueToSelect) {
  try {
    const element = document.getElementById(id);
    if (element === undefined || element === null)
      throw "Cannot deselect option.";
    element.value = valueToSelect;
  } catch (error) {
    console.error(error);
  }
}
