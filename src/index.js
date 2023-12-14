import Feed, {EventType} from "@dxfeed/api";

const feed = new Feed();

var inputTBOX;
var firstLoad;
var global_events = [];

var opsData = [];

var deltah3;
var vegah3;
var thetah3;
var gammah3;
var rhoh3;

window.onload = function(){
    document.getElementById("setdefbutton").addEventListener("click", (e) => {setdefop();});
    document.getElementById("getdatabutton").addEventListener("click", (e) => {startFeed();});
    document.getElementById("connectbutton").addEventListener("click", (e) => {createFeed();});
    //outputBox = document.getElementById("output");
    inputTBOX = document.getElementById("opsTBOX");
    //set greek output text elems
    deltah3 = document.getElementById("deltah3");
    vegah3 = document.getElementById("vegah3");
    thetah3 = document.getElementById("thetah3");
    gammah3 = document.getElementById("gammah3");
    rhoh3 = document.getElementById("rhoh3");
    //load shit from URL
    //eg: "#key=llll&ops=dalfjalf"
    /*
    let hashparams = window.location.hash;
    if (hashparams !== "") {
        let paramregex = /#key=([A-Za-z0-9]*)&ops=([A-Za-z0-9\+\/=]*)/g;
        let parammatch = [...hashparams.matchAll(paramregex)];
        let paramkey = parammatch[0][1];
        let paramopsB64 = parammatch[0][2];
        document.getElementById("authkeyTB").value = paramkey;
        inputTBOX.value = window.atob(paramopsB64);
    }
    */
    //loading data buttons
    document.getElementById("loadfromURLbutton").addEventListener("click", (e) => {loadhashfromURL();});
    document.getElementById("authkeyTB").addEventListener("change", (e) => {updatehashurl();});
    document.getElementById("opsTBOX").addEventListener("change", (e) => {updatehashurl();});
};

function updateGlobalDisplay() {
    let displayElem = document.getElementById("globalEventsDisplay");
    let globalStr = JSON.stringify(global_events);
    displayElem.innerHTML = globalStr;
}

function copyGlobalEvents() {
    let eventsStr = document.getElementById("globalEventsDisplay").innerHTML;
    navigator.clipboard.writeText(eventsStr);
}

function hideDisplayDiv(divid) {
    let relelem = document.getElementById(divid);
    if (relelem.style.display != "none") {
      relelem.style.display = "none";
    }
    else {
      relelem.style.display = "";
    }
}

function loadhashfromURL() {
    let hashparams = window.location.hash;
    if (hashparams !== "") {
      //let paramregex = /#key=([A-Za-z0-9]*)&ops=([A-Za-z0-9\+\/=]*)/g;
      let paramregex = /#key=([A-Za-z0-9\.\-_]*)&ops=([A-Za-z0-9\+\/=]*)/g;
      let parammatch = [...hashparams.matchAll(paramregex)];
      let paramkey = parammatch[0][1];
      let paramopsB64 = parammatch[0][2];
      document.getElementById("authkeyTB").value = paramkey;
      inputTBOX.value = window.atob(paramopsB64);
    }
}

function createFeed() {
    let authkey = document.getElementById("authkeyTB").value;
    feed.setAuthToken(authkey);
    feed.connect("https://tasty-demo-web.dxfeed.com/demo/cometd");
    console.log("Feed created");
    document.getElementById("disconnectbutton").addEventListener("click", (e) => {closeFeedCon();})
    document.getElementById("connectionstatush2").style = "color: #adff2f";
    document.getElementById("connectionstatush2").innerHTML = "Connection open";
    firstLoad = 0;
}

function updatehashurl() {
    let keyentered = document.getElementById("authkeyTB").value;
    let opsentered = window.btoa(inputTBOX.value);
    let hashurl = `#key=${keyentered}&ops=${opsentered}`;
    window.location.hash = hashurl;
}

//plus other numerical quantities for determining rho and shit. Needs: S, K, tau, and r.
//K and tau can be determined from the string. S can be obtained by querying SPY directly. r can be estimated, grabbed
//from FRED, or, what I'm wanting to do, solved for using the given greeks.
function grabinputvars(opstr) {

}

function closeFeedCon() {
    feed.disconnect();
    document.getElementById("connectionstatush2").style = "color: #f22424";
    document.getElementById("connectionstatush2").innerHTML = "Connection closed";
    deltah3.innerHTML = "Delta: N/A";
    vegah3.innerHTML = "Vega: N/A";
    thetah3.innerHTML = "Theta: N/A";
    gammah3.innerHTML = "Gamma: N/A";
    rhoh3.innerHTML = "Rho: N/A";
}

function setdefop() {
    const defstr = ".SPY230616C411,2\n.SPY230616C412,-2";
    inputTBOX.value = defstr;
}

function delay(time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

/*
const handleEvent = event => {
    //const midprice = (event.getBidPrice() + event.getAskPrice())/2;
    //console.log(midprice);
    console.log(event.toString())
}
*/

function updateGreekDisplay() {
  let tempdelta = 0.0;
  let tempvega = 0.0;
  let temptheta = 0.0;
  let tempgamma = 0.0;
  let temprho = 0.0;
  for (let j = 0; j < opsData.length; j++) {
    let opqty = Number(opsData[j][1]);
    let iterdelta = opsData[j][2];
    let itervega = opsData[j][3];
    let itertheta = opsData[j][4];
    let itergamma = opsData[j][5];
    let iterrho = opsData[j][6];
    tempdelta += iterdelta * opqty;
    tempvega += itervega * opqty;
    temptheta += itertheta * opqty;
    tempgamma += itergamma * opqty;
    temprho += iterrho * opqty;

    console.log(opsData[j][0]);
    debugNaN([tempdelta, tempvega, temptheta, tempgamma, temprho]);
  }

  deltah3.innerHTML = "Delta: Net " + 100 * tempdelta;
  vegah3.innerHTML = "Vega: Net " + 100 * tempvega;
  thetah3.innerHTML = "Theta: Net " + 100 * temptheta;
  gammah3.innerHTML = "Gamma: Net " + 100 * tempgamma;
  rhoh3.innerHTML = "Rho: Net " + 100 * temprho;
}

function opindex(opstr) {
  for (let k = 0; k < opsData.length; k++) {
    if (opsData[k][0] === opstr) {
      return k;
    }
  }
}

const setInfo = event => {
    //Delta: N/A --> Delta: long=blah,short=blah,net=blah
    //similar for vega
    console.log(event);
    if (event["eventType"] === "Greeks") {
      //let newout = document.createElement("h4");
      //newout.innerHTML = "Volatility is: " + 100*Number(event["volatility"]) + "%";
      //outputDiv.append(newout);
      let opsym = event["eventSymbol"];
      let relevantindex = opindex(opsym);
      opsData[relevantindex][2] = event["delta"];
      opsData[relevantindex][3] = event["vega"];
      opsData[relevantindex][4] = event["theta"];
      opsData[relevantindex][5] = event["gamma"];
      opsData[relevantindex][6] = event["rho"];
      //let opqty = Number(opsData[relevantindex][1]);
      //need some kinda handling for separate spread greeks
      //netdelta += opdelta*opqty;
      //netvega += opvega*opqty;

      updateGreekDisplay();
      global_events.push(event);
    }
}

function debugNaN(valuearr) {
    if (valuearr.length >= 1) {
        for (let k = 0; k < valuearr.length; k++) {
            if (Number.isNaN(valuearr[k]) == true) {
                console.log(valuearr[k] + ": is NaN")
            }
            else {
                console.log(valuearr[k] + ": is a number");
            }
        }
    }
    else {
        console.log("Wrong input for NaN debugging");
    }
}

function startFeed() {
    opsData = [];
    let TBOXstr = inputTBOX.value;
    let opsWithQtys_raw = TBOXstr.split("\n");
    console.log(opsWithQtys_raw);
    opsWithQtys_raw = removeblanklines(opsWithQtys_raw);
    let opsStrs = [];
    for (let i = 0; i < opsWithQtys_raw.length; i++) {
      let opSplit = opsWithQtys_raw[i].split(",");
      opsData.push(opSplit);
      opsStrs.push(opSplit[0]);
    }
    console.log(opsStrs);
    for (let j = 0; j < opsData.length; j++) {
      //Greeks format: {'.SPYblah': ['Qty': +-x, 'Delta': 0.0, 'Vega': 0.0]}
      //opsdata format to this point: ['.SPYblah', qty(int)]
      //append delta then vega numbers to it too. zero by def
      opsData[j].push(0.0); //delta
      opsData[j].push(0.0); //vega
      opsData[j].push(0.0); //theta
      opsData[j].push(0.0); //gamma
      opsData[j].push(0.0); //rho
      //delta = 3rd elem, vega is 4th, theta is 5th, gamma is 6th, rho is 7th
    }
    //update this below
    const unsub = feed.subscribe([EventType.Greeks], opsStrs, setInfo);
    console.log(unsub);
    if (firstLoad == 0) {
      document.getElementById("stopbutton").addEventListener("click", unsub);
      document.getElementById("stopbutton").addEventListener("click", (e) => {stopfeedCleanup();});
      firstLoad = 1;
    }
    document.getElementById("feedstatush2").style = "color: #adff2f";
    document.getElementById("feedstatush2").innerHTML = "Feed open";
}

//not needed for this site
function startTSFeed() {
  let TBOXstr = inputTBOX.value;
  let cmds_raw = TBOXstr.split("\n");
  console.log(cmds_raw);
  cmds_raw = removeblanklines(cmds_raw);
  //update this below
  const unsub = feed.subscribe(
    [EventType.Greeks, EventType.Quote],
    cmds_raw,
    setInfo
  );
  console.log(unsub);
  if (firstLoad == 0) {
    document.getElementById("stopbutton").addEventListener("click", unsub);
    document.getElementById("stopbutton").addEventListener("click", (e) => {
      stopfeedCleanup();
    });
    firstLoad = 1;
  }
  document.getElementById("feedstatush2").style = "color: #adff2f";
  document.getElementById("feedstatush2").innerHTML = "Feed open";
}

//get timestamp in milliseconds from a string in format mm/dd/yyyy
function tsmsFromString(datestr) {
    
}

//not needed for this site
async function queryseries() {
  //let TBOXstr = inputTBOX.value;
  //let cmds_raw = TBOXstr.split("\n");
  let queryoutputDiv = document.getElementById("queryoutput");
  //console.log(cmds_raw);
  //cmds_raw = removeblanklines(cmds_raw);
  let etype;
  let qSymbol = document.getElementById("querySymbol").value;
  let startString = document.getElementById("queryTimeStart").value;
  let endString = document.getElementById("queryTimeEnd").value;
  let now = new Date();
  //const events = await feed.getTimeSeries(cmds_raw[0], etype, now.getTime() - 1, now.getTime());
  const events = await feed.getTimeSeries(
    "SPY{=5m}",
    EventType.Candle,
    now.getTime() - 7200 * 1000,
    now.getTime()
  );
    /*
    let exDate1 = new Date(2023, 5, 23, 12, 0, 0);
    let exDate2 = new Date(2023, 5, 23, 13, 0, 0);
    const events = await feed.getTimeSeries(
     "SPY{=1d}",
     EventType.Candle,
     exDate1.getTime(),
     exDate2.getTime()
   );
   */
  //
  /*
    let qTimeStart = tsmsFromString(startString);
    let qTimeEnd = tsmsFromString(endString);
    const events = await feed.getTimeSeries(
        qSymbol,
        EventType.Candle,
        qTimeStart,
        qTimeEnd
    );
    */
  console.log(events);
  for (let i = 0; i < events.length; i++) {
    let newelem = document.createElement("p");
    let highp = events[i]["high"];
    let lowp = events[i]["low"];
    let openp = events[i]["open"];
    let closep = events[i]["close"];
    let timep = new Date(events[i]["time"]);
    newelem.innerHTML = `At ${timep.toLocaleString()}: High ${highp}, Low ${lowp}, Open ${openp}, Close ${closep}`;
    queryoutputDiv.insertBefore(newelem, queryoutputDiv.firstChild);
    global_events.push(events[i]);
    updateGlobalDisplay();
  }
}

function stopfeedCleanup() {
    document.getElementById("feedstatush2").style = "color: #f22424";
    document.getElementById("feedstatush2").innerHTML = "Feed closed";
}

function removeblanklines(opstrArr) {
    if (opstrArr.length > 0) {
        for (let j = 0; j < opstrArr.length; j++) {
            if (opstrArr[j] === "") {
                opstrArr.splice(j, 1);
                j -= 1;
            }
        }
    }
    return opstrArr;
}



//onExit(() => unsub());