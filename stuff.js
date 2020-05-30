toJson(dataUrl, function (data) {
    window.pairs = data
    window.currentPair = getRandom(data)
    question.innerHTML = currentPair.country
    updateMap(currentPair.country)

    submit.addEventListener('click', e => {
      if (answer.value.length <= 2) {
        alert("Invalid input:\nAnswer must be more than 2 letters")     
        answer.value = ""
        answer.focus()
        return
      }
      if (answer.value.length > 26) {
        alert("Invalid input:\nAnswer must be less than 26 letters")     
        answer.value = ""
        answer.focus()
        return
      }
      if (answer.value.toLowerCase() == currentPair.capital.toLowerCase()) var newEntry = addEntry(currentPair.country, currentPair.capital, currentPair.capital)
      else var newEntry = addEntry(currentPair.country, currentPair.capital, answer.value)
      
      addToTable(newEntry.key, currentPair.country, currentPair.capital, answer.value)
      $(".ui-autocomplete").hide()
      answer.value = ""
      currentPair = getRandom(data)
      question.innerHTML = currentPair.country
      answer.focus()
      updateMap(currentPair.country)
    })

    restart.addEventListener('click', event => {
      clearDatabase()
      $('#addTo').children().remove();
      undo.disabled = true;
      clear.disabled = true;
      addTo.appendChild(nothingToShow)
      removal()
    })

    allRadio.addEventListener("click", () => {
      allEntries = document.getElementById("addTo").rows
      amount = 0
      for (i = 0; i < allEntries.length; i++) {
        currentEntry = allEntries[i]
        currentEntry.hidden = false
        amount += 1
      }
      if (amount == 1) nothingToShow.hidden = false
      else nothingToShow.hidden = true
    })
  
    wrongRadio.addEventListener("click", () => {
      allEntries = document.getElementById("addTo").rows
      amount = 0
      for (i = 0; i < allEntries.length; i++) {
        currentEntry = allEntries[i]
        if (currentEntry.classList.contains("wrong")) {
          currentEntry.hidden = false
          amount += 1
        }
        else currentEntry.hidden = true
      }
      if (amount == 0) nothingToShow.hidden = false
      else nothingToShow.hidden = true
    })
  
    correctRadio.addEventListener("click", () => {
      allEntries = document.getElementById("addTo").rows
      amount = 0
      for (i = 0; i < allEntries.length; i++) {
        currentEntry = allEntries[i]
        if (currentEntry.classList.contains("correct")) {
          currentEntry.hidden = false
          amount += 1
        }
        else currentEntry.hidden = true
      }
      if (amount == 0) nothingToShow.hidden = false
      else nothingToShow.hidden = true
    })

    var allCapitals = []
    for (i=0; i<pairs.length; i++){
      allCapitals.push(pairs[i].capital);
    }
    $("#pr2__answer").autocomplete({minLength: 2, source: allCapitals, select: function(){}});
    $("#pr2__answer" ).on("autocompleteselect", (event,ui) => {
      $("#pr2__answer").val(ui.item.label);
      event.preventDefault();
      if(event.keyCode != 13) {
        submit.click();
      }
    })

    answer.addEventListener("keyup", event => {
      if (event.keyCode == 13){
        submit.click();
      }
    })

    $(clear).click( () => {
      var ids = []
      for (i = document.getElementsByTagName('tr').length - 1; i > 5; i--) {
        var viewed = document.getElementsByTagName('tr')[i]
        changeDeleted(viewed.id)
        ids.push(viewed.id)
      }
      $('#addTo').children().remove();
      changes.push({key: ids, change: 'cleared'})
      addChange()
      clear.disabled = true;
      addTo.appendChild(nothingToShow)
      removal()
      noChanges()
    })

  })





// fetch('https://cs374.s3.ap-northeast-2.amazonaws.com/country_capital_pairs.csv',{mode: 'no-cors'})
// .then(
//     function(response) {
//       if (response.status !== 200) {
//         console.log('Looks like there was a problem. Status Code: ' +
//           response.status);
//         return;
//       }

//       // Examine the text in the response
//       response.json().then(function(data) {
//         console.log(data);
//       });
//     }
//   )
//   .catch(function(err) {
//     console.log('Fetch Error :-S', err);
//   });

function convertCSVToJSON(str, delimiter = ',') {
    const titles = str.slice(0, str.indexOf('\n')).split(delimiter);
    const rows = str.slice(str.indexOf('\n') + 1).split('\n');
    return rows.map(row => {
        const values = row.split(delimiter);
        document.getElementById('pair').innerHTML = values[1];
        return titles.reduce((object, curr, i) => (object[curr] = values[i], object), {})
    });
};

// window.pairs = new Array;
// fetch('https://cs374.s3.ap-northeast-2.amazonaws.com/country_capital_pairs.csv',{
// 	mode: 'no-cors'
// })
//   .then(response => response.text())
//   .then(data => data.split('\n'))
//   .then(lines => lines.map(line =>{
//   	line.split(",");
//   	object ={};
//   	if (line[0]!="country"){
//   		object["country"]=line[0];
//   		object["capital"]=line[1];
//   		pairs.push(object);
//   	}
//   }))

// document.getElementById('pair').innerHTML = pairs;
//   .then(data => console.log(data));

// window.pairs = new Array;	
// fetch("https://cs374.s3.ap-northeast-2.amazonaws.com/country_capital_pairs.csv",{
// 	mode: 'no-cors'
// })
//   .then(response => convertCSVToJSON(response.text()))
//   .then(data => window.pairs=data);


// var map;
// function initMap() {
// map = new google.maps.Map(document.getElementById('map'), {
//   zoom: 8,
//   zoomControl: false,
//   scaleControl: true
// });

// var geocoder = new google.maps.Geocoder;
// geocoder.geocode({'address': 'Singapore'}, function(results, status) {
//   if (status === 'OK') {
//     map.setCenter(results[0].geometry.location);
//     new google.maps.Marker({
//       map: map,
//       position: results[0].geometry.location
//     });
//   } else {
//     window.alert('Geocode was not successful for the following reason: ' +
//         status);
//   }
// });
// }