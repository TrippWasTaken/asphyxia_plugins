var diffName = ["NOV", "ADV", "EXH", "INF\nGRV\nHVN\nVVD\nXCD", "MXM"]
var volforceArray = []
var music_db, course_db, score_db, data_db, appeal_db, skill_title_db
var profile_data, skill_data, course_data
let volforceScores = []


function calculateVolforce() {
  for (var i in score_db) {
    var temp = singleScoreVolforce(score_db[i])
    temp = parseFloat(toFixed(temp, 1))
    let musicInfo = music_db["mdb"]["music"].filter(
      (object) => object["@id"] == score_db[i].mid
    )
    volforceArray.push(temp)
    volforceScores.push({
      volforce: temp,
      ...score_db[i],
      musicInfo: musicInfo[0],
    })
  }
  volforceArray.sort(function (a, b) {
    return b - a
  })

  volforceScores = volforceScores.sort((a,b)=> {
    return b.volforce - a.volforce
  }).slice(0,50)

  var VF = 0
  if (volforceArray.length > 50) {
    for (var i = 0; i < 50; i++) {
      VF += volforceArray[i]
    }
  } else {
    for (var i = 0; i < volforceArray.length; i++) {
      VF += volforceArray[i]
    }
  }
  VF /= 100
  // console.log(toFixed(VF, 3));
  return toFixed(VF, 3)
}

function getSongLevel(musicid, type) {
  var result = music_db["mdb"]["music"].filter(
    (object) => object["@id"] == musicid
  )
  if (result.length == 0) {
    return "1"
  }

  var diffnum = 0

  switch (type) {
    case 0:
      if (!(result[0]["difficulty"]["novice"] === undefined))
        diffnum = result[0]["difficulty"]["novice"]["difnum"]["#text"]
      // return result[0]["difficulty"]["novice"]["difnum"]["#text"]
      break
    case 1:
      if (!(result[0]["difficulty"]["advanced"] === undefined))
        diffnum = result[0]["difficulty"]["advanced"]["difnum"]["#text"]
      // return result[0]["difficulty"]["advanced"]["difnum"]["#text"]
      break
    case 2:
      if (!(result[0]["difficulty"]["exhaust"] === undefined))
        diffnum = result[0]["difficulty"]["exhaust"]["difnum"]["#text"]
      // return result[0]["difficulty"]["exhaust"]["difnum"]["#text"]
      break
    case 3:
      if (!(result[0]["difficulty"]["infinite"] === undefined))
        diffnum = result[0]["difficulty"]["infinite"]["difnum"]["#text"]
      // return result[0]["difficulty"]["infinite"]["difnum"]["#text"]
      break
    case 4:
      if (!(result[0]["difficulty"]["maximum"] === undefined))
        diffnum = result[0]["difficulty"]["maximum"]["difnum"]["#text"]
      // return result[0]["difficulty"]["maximum"]["difnum"]["#text"]
      break
  }
  // console.log(diffnum)
  if (diffnum == 0) {
    diffnum = 1
  }
  // console.log(diffnum)
  return diffnum
  // return result[0]["info"]["title_name"]
  //console.log(result);
}

function singleScoreVolforce(score) {
  // lv * (score / 10000000) * gradeattr * clearmedalattr * 2
  var level = getSongLevel(score.mid, score.type)
  // console.log(level);
  var tempVF =
    parseInt(level) *
    (parseInt(score.score) / 10000000) *
    getGrade(score.grade) *
    getMedal(score.clear) *
    2
  // console.log(tempVF);
  return tempVF
}

function getGrade(grade) {
  switch (grade) {
    case 0:
      return 0
    case 1:
      return 0.8
    case 2:
      return 0.82
    case 3:
      return 0.85
    case 4:
      return 0.88
    case 5:
      return 0.91
    case 6:
      return 0.94
    case 7:
      return 0.97
    case 8:
      return 1.0
    case 9:
      return 1.02
    case 10:
      return 1.05
  }
}

function getMedal(clear) {
  switch (clear) {
    case 0:
      return 0
    case 1:
      return 0.5
    case 2:
      return 1.0
    case 3:
      return 1.02
    case 4:
      return 1.05
    case 5:
      return 1.1
  }
}

function toFixed(num, fixed) {
  var re = new RegExp("^-?\\d+(?:.\\d{0," + (fixed || -1) + "})?")
  return num.toString().match(re)[0]
}

$(document).ready(function () {
  score_db = JSON.parse(document.getElementById("score-pass").innerText)
})

$.when(
  $.getJSON("static/asset/json/music_db.json", function (json) {
    music_db = json
  })
).then(function () {
  const currentVF = calculateVolforce()
}).then(()=> {
  volforceScores.forEach(item => {
    const jacketId = `jk_${item.musicInfo["@id"].toString().padStart(4, 0)}_1_s.png`
    const diffs = Object.keys(item.musicInfo.difficulty)

    const getDiff = (type) => {
      switch (type) {
        case 0:
            return "NOV";
        case 1:
            return "ADV";
        case 2:
            return "EXH";
        case 3:
          return "INF";
        case 4:
            return "MXM";
    }
    }
    console.log(item)
    // diffs[item.type]
    const diffText = getDiff(item.type).toLowerCase()
    const diffLevel = item.musicInfo.difficulty[diffs[item.type]]["difnum"]["#text"]
    
    

    $("#volforce-container").append(`
    <div class='vf-score-container'>
      <img class="vf-score-jacket" src="static/asset/jacket/${jacketId}"></img>
      <div class="vf-text-container">
      <div class="vf-songname">
      <span>
      ${item.musicInfo.info.artist_name}
      </span>
      -
      <span>
        ${item.musicInfo.info.title_name}
      </span>
      <span class="vf-diff">
        <img class="vf-diff-name" src="static/asset/difficulty/level_small_${diffText}.png"></img>
        <span class="vf-diff-level">${diffLevel}</span>
      </span>
      </div>
        <div class="vf-score">
          <span class="vf-bold">Score:</span>
        ${item.score}
        </div>
      </div>
    </div>`)
  })
})
