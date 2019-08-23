document.addEventListener("DOMContentLoaded", () => {
  // event object:
  // { artist: " ",
   //  date: timestamp }
let allEvents = [];

//55 BAR :
let now = new Date();
let date = now.getDate();
let mon = now.getMonth() + 1;
let year = now.getFullYear();

let url = "http://www.55bar.com/cgi-bin/webdata_playin.pl"+
"?cgifunction=Search&GigDate="+"%3E%3D"+mon+"/"+date+"/"+year

 let data = fetch('https://cors-anywhere.herokuapp.com/'+url)
                    .then(res => res.text())
                    .then(res => {
                      let artists = getInnerText(res, 'target=new>'||'<font size="2" color="#000000">','</a>'||'</font>')
                      let dates = getInnerText(res, 'val="','"')
                      let times = getInnerText(res, '<font size="2" color="#000000">','</font>')

                      let events = {};
                      dates.forEach((date,i) => {
                        let parsedTime = times[i].slice(times[i].indexOf('-') + 2, -2)
                        let dateArr = date.split('/')
                        dateArr.push(parsedTime)
                        events[i+1] = {artist:artists[i], date: arrToDate(dateArr)}
                      })
                      console.log("55 BAR=>",events);
                      })
// THE OWL PARLOR :
  fetch('https://cors-anywhere.herokuapp.com/http://theowl.nyc/calendar/')
          .then(res => res.text())
          .then((text) => {
            let artist = getInnerText(text, '<h3>', '</h3>')
            let times = getInnerText(text, '<span class="time">','</span>')
            let days = getInnerText(text, '<div class="day">', '</div>')
            let months = getInnerText(text, '<div class="month">', '</div>')
            let years = getInnerText(text, '<div class="year">', '</div>')
            let events = [];
            for (let i = 0; i < artist.length - 1; i++) {
              // console.log(days[i], months[i], years[i], times[i]);
              // TODO: take care of time being only '$15' str
              let date = arrToDate([  strToMonthIdx(months[i]),
                                      days[i],
                                      years[i] ? years[i].slice(-2) : 0,
                                      times[i] ? times[i].split(' ')[0].replace(':',' ') : 0])
              events.push({artist:artist[i], time:times[i], date})
            }
            allEvents.push(events)
            console.log("THE OWL PARLOR=>",events);
          })

// Lunatico
  fetch(`https://cors-anywhere.herokuapp.com/https://www.barlunatico.com/api/open/GetItemsByMonth?month=${mon}-${year}&collectionId=56ef53ec8259b5336168ca8c&crumb=Be4OC9aw5qOcNTc0ZjQ0ZTBmNzQ0MTVhOWQ5ZmM3ZGFjNzYzMWUy`)
    .then(res => res.json())
    .then(res => {
      let events = [];
      res.forEach((event,i) => {
        let date = new Date(event.startDate)
        events.push({artist:event.title, date:date})
      })
      console.log("LUNATICO=>",events)
    })


  const getInnerText = (data, str1, str2) => {
    let copy = data.slice()
    copy = copy.split(str1)
    copy.shift()
    let output = [];
    copy.forEach((el,i) => {
      let idx = el.indexOf(str2);
      output.push(el.slice(0, idx));
    })
    return output
  }

  const strToMonthIdx = (str) => {
    let key = { "Jan":0, "Feb":1, "Mar":2, "Apr":3, "May":4, "Jun":5 , "Jul":6 , "Aug":7, "Sep":8, "Oct":9, "Nov":10,"Dec":11}
    return key[str]
  }

  const strToHourIdx = (str) => {
    return parseInt(str) + 12;
  }

  const arrToDate = (arr) => {
    //takes str arr: ["MM", "DD", "YY", "HH mm"]
    // "mm" - optional
    if (arr[3].length > 2) {
      let hour = arr[3].split(' ')
      arr.pop()
      hour.forEach(el => arr.push(el))
    }
    let parsed = arr.map(el => parseInt(el))
    return new Date(parsed[2]+2000, parsed[0] - 1, parsed[1], strToHourIdx(parsed[3]), parsed[4] ? parsed[4] : 0 )
  }

})

// moment npm library for date parsing
