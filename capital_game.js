// This allows the Javascript code inside this block to only run when the page
// has finished loading in the browser.

$(document).ready(function () {
  convertCSVToJSON(
    "https://cs374.s3.ap-northeast-2.amazonaws.com/country_capital_pairs.csv",
    function (data) {
      window.pairs = data;

      var country_capital_pairs = pairs;
      noEntry(true);

      var answer = document.getElementById("pr2__answer");
      answer.value = "";
      var object =
        country_capital_pairs[
          getRandomInt(0, country_capital_pairs.length - 1)
        ];

      document.getElementById("pr2__question").innerHTML = object.country;
      document.getElementById("pr2__question").name = object.capital;
      loadIframe(object.country);

      // Enter triggers the button
      answer.addEventListener("keyup", function (event) {
        if (event.keyCode === 13) {
          event.preventDefault();
          document.getElementById("pr2__submit").click();
        }
      });

      // Autocomplete
      var capitals = new Array(country_capital_pairs.length);
      var i = 0;
      for (i = 0; i < country_capital_pairs.length; i++) {
        capitals[i] = country_capital_pairs[i].capital;
      }
      $("#pr2__answer").autocomplete({
        source: capitals,
        minLength: 2,
      });

      $("#pr2__answer").on("autocompleteselect", (event, ui) => {
        $("#pr2__answer").val(ui.item.label);
        event.preventDefault();
        if (event.keyCode != 13) {
          $("#pr2__submit").click();
        }
      });

      // Real-time listener
      db.collection("capitals")
        .orderBy("date")
        .onSnapshot((snapshot) => {
          let changes = snapshot.docChanges();
          changes.forEach((change) => {
            if (change.type == "added") {
              insert(change.doc);
            } else if (change.type == "removed") {
              var elem = document.getElementById(change.doc.id);
              elem.parentNode.removeChild(elem);
            }
          });
          noEntry();
        });

      // Undo feature
      document
        .getElementById("pr3__undo")
        .addEventListener("click", function () {
          db.collection("history")
            .orderBy("timestamp", "desc")
            .limit(1)
            .get()
            .then((res) => {
              res.forEach((element) => {
                var countryL = new Array();
                countryL = element.data().country;
                var capitalL = new Array();
                var capitalL = element.data().capital;
                var givenCapitalL = new Array();
                var givenCapitalL = element.data().givenCapital;
                var status = element.data().status;

                if (status == "removed") {
                  for (i = 0; i < countryL.length; i++) {
                    db.collection("capitals").add({
                      country: countryL[i],
                      capital: capitalL[i],
                      givenCapital: givenCapitalL[i],
                      date: Date.now(),
                      row: element.data().row,
                    });
                  }
                } else if (status == "added") {
                  db.collection("capitals")
                    .orderBy("date", "desc")
                    .limit(1)
                    .get()
                    .then((res2) => {
                      res2.forEach((element2) => {
                        element2.ref.delete();
                      });
                    });
                }
                noEntry();
                element.ref.delete();
              });
            });
        });

      // Clear all
      document
        .getElementById("pr3__clear")
        .addEventListener("click", function () {
          countryL = new Array();
          capitalL = new Array();
          givenCapitalL = new Array();
          db.collection("capitals")
            .get()
            .then((res) => {
              res.forEach((element) => {
                countryL.push(element.data().country);
                capitalL.push(element.data().capital);
                givenCapitalL.push(element.data().givenCapital);
                element.ref.delete();
              });
              db.collection("history").add({
                country: countryL,
                capital: capitalL,
                givenCapital: givenCapitalL,
                timestamp: Date.now(),
                row: 4,
                status: "removed",
              });
            });
        });

      // Restart Everything
      document
        .getElementById("pr3__restart")
        .addEventListener("click", function () {
          db.collection("history")
            .get()
            .then((res) => {
              res.forEach((element) => {
                element.ref.delete();
              });
            });
          db.collection("capitals")
            .get()
            .then((res) => {
              res.forEach((element) => {
                element.ref.delete();
              });
            });

          // Reload the page
          var answer = document.getElementById("pr2__answer");
          answer.value = "";
          var object =
            country_capital_pairs[
              getRandomInt(0, country_capital_pairs.length - 1)
            ];

          document.getElementById("pr2__question").innerHTML = object.country;
          document.getElementById("pr2__question").name = object.capital;
          loadIframe(object.country);
        });

      // Undo button real-time disable
      db.collection("history").onSnapshot(function (snap) {
        if (snap.size > 0) {
          document.getElementById("pr3__undo").disabled = false;
        } else {
          document.getElementById("pr3__undo").disabled = true;
        }
      });

      // Clear button real-time disable
      db.collection("capitals").onSnapshot(function (snap) {
        if (snap.size > 0) {
          document.getElementById("pr3__clear").disabled = false;
        } else {
          document.getElementById("pr3__clear").disabled = true;
        }
      });

      // init Isotope
      filterCheck();
      noEntry();
    }
  );
});

function convertCSVToJSON(strUlr, callback) {
  fetch(strUlr)
    .then((response) => response.text())
    .then((data) => data.split("\r\n"))
    .then((data) => {
      const pairs = [];
      for (let i = 1; i < data.length; i++) {
        const object = data[i].split(",");
        pairs.push({ country: object[0], capital: object[1] });
      }
      callback(pairs);
    });
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function submit() {
  var capital = document.getElementById("pr2__question").name;
  var country = document.getElementById("pr2__question").innerHTML;
  var date = Date.now();
  if (
    capital.toLowerCase() !=
    document.getElementById("pr2__answer").value.toLowerCase()
  ) {
    db.collection("capitals").add({
      country: country,
      capital: capital,
      givenCapital: document.getElementById("pr2__answer").value,
      date: date,
      row: 4,
    });
  } else {
    db.collection("capitals").add({
      country: country,
      capital: capital,
      givenCapital: capital,
      date: date,
      row: 4,
    });
    latestEvent = [0];
  }
  db.collection("history").add({
    status: "added",
  });

  document.getElementById("pr2__answer").value = "";
  document.getElementById("pr2__answer").focus();

  var object = pairs[getRandomInt(0, pairs.length - 1)];
  document.getElementById("pr2__question").innerHTML = object.country;
  document.getElementById("pr2__question").name = object.capital;
  loadIframe(object.country);

  // All checked
  document.getElementById("all").checked = "checked";
  $("tr.element").css("visibility", "visible");
  noEntry();
}

function insert(doc) {
  let max = document.getElementsByClassName("noEntry")[0].rowIndex;
  var row = doc.data().row;
  if (row > max) {
    row = max;
  }
  if (doc.data().givenCapital == doc.data().capital) {
    $("#parent > tbody > tr")
      .eq(row - 1)
      .after(
        "<tr class='element' id='" +
          doc.id +
          "'>  <td class='correct' onmouseover='changeMap(this)' id='country'>" +
          doc.data().country +
          "</td> <td class='correct' id='capital1'>" +
          doc.data().capital +
          " </td><td class='correct' onmouseover='changeMapCapital(this)'>" +
          doc.data().capital +
          "<button onClick='deleteEntry(this)'>Delete</button></td></tr>"
      );
  } else {
    $("#parent > tbody > tr")
      .eq(row - 1)
      .after(
        "<tr class='element' id='" +
          doc.id +
          "'>  <td class='incorrect' onmouseover='changeMap(this)' id='country'>" +
          doc.data().country +
          "</td> <td class='incorrect' ><del id='capital2'>" +
          doc.data().givenCapital +
          "</del></td><td class='incorrect' id='country2' onmouseover='changeMapCapital(this)'>" +
          doc.data().capital +
          "<button onClick='deleteEntry(this)'>Delete</button></td></tr>"
      );
  }
}

function noEntry() {
  $(".noEntry").css("visibility", "visible");
  $("tr.element").each(function () {
    $this = $(this);
    if ($this.css("visibility") == "visible") {
      $(".noEntry").css("visibility", "collapse");
      return false;
    }
  });
}

function deleteEntry(elem) {
  var id = elem.parentNode.parentNode.id;
  db.collection("capitals")
    .doc(id)
    .get()
    .then(function (doc) {
      db.collection("history").add({
        country: [doc.data().country],
        capital: [doc.data().capital],
        givenCapital: [doc.data().givenCapital],
        date: [doc.data().date],
        timestamp: Date.now(),
        row: elem.parentNode.parentNode.rowIndex,
        status: "removed",
      });
      db.collection("capitals").doc(id).delete();
    });
}

var changeMap = function (elem) {
  var timeout = null;
  var $iframe = $("#ifrm");
  elem.onmouseover = function () {
    if ($iframe.length) {
      $iframe.attr("frameborder", 3);
      $iframe.attr("style", "border-color: orange");
      elem.parentNode.style = "background-color: lightgray";
    }
    // Set timeout to be a timer which will invoke callback after 1s
    timeout = setTimeout(loadIframe(elem.innerHTML), 500);
  };

  elem.onmouseout = function () {
    if ($iframe.length) {
      $iframe.attr("frameborder", 0);
      $iframe.attr("style", "border: 0");
      elem.parentNode.style = "background-color: transparent";
    }
    // Clear any timers set to timeout
    clearTimeout(timeout);
  };
};

var changeMapCapital = function (elem) {
  var timeout = null;
  var $iframe = $("#ifrm");
  elem.onmouseover = function () {
    if ($iframe.length) {
      $iframe.attr("frameborder", 3);
      $iframe.attr("style", "border-color: black");
      $iframe.attr(
        "style",
        "color: black; filter: grayscale(100%); transition: transform .2s;"
      );

      elem.parentNode.style = "background-color: lightgray";
    }
    // Set timeout to be a timer which will invoke callback after 1s
    timeout = setTimeout(function () {
      $iframe.attr(
        "src",
        "https://www.google.com/maps/embed/v1/place?key=AIzaSyAOR25-vse-iJ0pD5RrnhOqCOhHd2A1wJU&q=" +
          elem.innerHTML.split("<")[0] +
          "&language=en"
      );
    }, 500);
  };

  elem.onmouseout = function () {
    if ($iframe.length) {
      $iframe.attr("frameborder", 0);
      $iframe.attr("style", "border: 0; filter: grayscale(0%);");
      elem.parentNode.style = "background-color: transparent";
    }
    // Clear any timers set to timeout
    clearTimeout(timeout);
  };
};

function loadIframe(country) {
  var $iframe = $("#ifrm");
  if ($iframe.length) {
    $iframe.attr(
      "src",
      "https://www.google.com/maps/embed/v1/place?key=AIzaSyAOR25-vse-iJ0pD5RrnhOqCOhHd2A1wJU&q=" +
        country +
        "&language=en"
    );
    return false;
  }
  return true;
}

function filterCheck() {
  $("input[type=radio]").change(function () {
    var filter = this.value;
    if (filter == "*") $("tr.element").css("visibility", "visible");
    else $("tr.element").css("visibility", "collapse");
    $("tr.element")
      .find("td")
      .each(function () {
        $this = $(this);
        if ($this.hasClass(filter)) {
          $this.parent().css("visibility", "visible");
        }
      });
    noEntry();
  });
}
