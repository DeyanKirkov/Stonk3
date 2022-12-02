const favouritesDiv = document.getElementById("favourites-list");
const searchInp = document.getElementById("stonk-search");
const resultsDiv = document.getElementById("results-list");
const contentDiv = document.getElementById("content");

const alphaVantageKey = "&apikey=64PPOS456M2M9J85";
const alphaVantageUrl = "https://www.alphavantage.co/query?";
const alphavantageOverviewEndpoint = "function=OVERVIEW&symbol=";
const alphavantageSearchEndpoint = "function=SYMBOL_SEARCH&keywords=";

const KEY = "&apikey=64PPOS456M2M9J85";
const url = "https://www.alphavantage.co/query?function=OVERVIEW&symbol=";

// const finnhubKey = "&token=ce4ckkqad3i3k9df9e00ce4ckkqad3i3k9df9e0g";
// const finnhub = "https://finnhub.io/api/v1/search?q=apple";

const bond = {
  value: 4.9,
  lastUpdate: 0
};

const bondAvrg = 4.4;
const nonGr = 8.5;

const favouritesArr = [
  {
    symbol: "AAPL",
    growth: 8.89,
    lastUpdate: 0
  }
];

searchInp.addEventListener("keyup", searchStonks);

/**  Call clearSearch() to null result div
 *
 * Check input value and find stonks
 *
 * Fill results div
 */
async function searchStonks(event) {
  if (event.key === "Enter") {
    clearSearch();
    if (searchInp.value) {
      const result = await getSearchResults(searchInp.value);
      for (const stonk of result) {
        if (stonk["1. symbol"].includes(".")) continue;
        const ul = document.createElement("ul");
        // ul.addEventListener("click", () => addFavourite(stonk["1. symbol"]));
        ul.addEventListener("click", () => loadContent(stonk["1. symbol"]));

        const name = document.createElement("span");
        name.innerText = stonk["2. name"];
        const token = document.createElement("spanapple");
        token.innerText = stonk["1. symbol"];

        ul.appendChild(name);
        ul.appendChild(token);

        resultsDiv.appendChild(ul);
      }
    }
  }
}

/**  Push new favourite to array
 *
 * Call clearSearch() to null result div
 *
 * Call render favourites
 */
function toggleFavourite(symbol) {
  const favEl = favouritesArr.findIndex((el) => el.symbol === symbol);
  favEl === -1
    ? favouritesArr.push({ symbol: symbol })
    : favouritesArr.splice(favEl, 1);
  favouritesArr.sort();
  renderFavourites();
}

/**  Set favourites div to empty
 *
 * Draw new div for each element in favourites array
 */
function renderFavourites() {
  favouritesDiv.innerHTML = "";

  favouritesArr.forEach((fav) => {
    const div = document.createElement("div");
    div.className = "menu-item";
    const p = document.createElement("p");
    p.innerText = fav.symbol;
    p.addEventListener("click", () => loadContent(fav.symbol));
    div.appendChild(p);
    favouritesDiv.appendChild(div);
  });
}

/**  Set results div to empty
 *
 */
function clearSearch() {
  resultsDiv.innerHTML = "";
}

/**  Fill content div with data for given stonk
 *
 * Calls fetchContent()
 *
 */
async function loadContent(symbol) {
  contentDiv.innerHTML = "";

  addLoadingBar();
  const data = await getContent(symbol);
  const favEl = favouritesArr.find((el) => el.symbol === data.Symbol);
  removeLoadingBar();
  // create control buttons
  const controlDiv = document.createElement("div");
  controlDiv.className = "control-div";

  const fSpan = document.createElement("span");
  if (favEl) fSpan.classList.add("liked", "noselect");
  fSpan.innerHTML = favEl
    ? "<i class='material-icons-outlined'>favorite</i>"
    : "<i class='material-icons-outlined'>favorite_border</i>";
  fSpan.addEventListener("click", () => {
    fSpan.classList.toggle("liked");
    const gS = document.querySelector(".control-div .growth");

    if (fSpan.classList.contains("liked")) {
      fSpan.innerHTML = "<i class='material-icons-outlined'>favorite</i>";
      gS.classList.remove("hidden");
    } else {
      fSpan.innerHTML =
        "<i class='material-icons-outlined'>favorite_border</i>";
      gS.classList.add("hidden");
    }
    toggleFavourite(data.Symbol);
  });
  controlDiv.appendChild(fSpan);

  const gSpan = document.createElement("span");
  gSpan.classList.add("noselect", "growth");
  if (!favEl) gSpan.classList.add("hidden");
  gSpan.innerHTML = "<i class='material-icons-outlined'>thumb_up_off_alt</i>";
  gSpan.addEventListener("click", () => {
    const el = favouritesArr.find((el) => el.symbol === data.Symbol);
    const result = window.prompt("Input growth", el.growth ?? 0);
    el.growth = result;
    const growthD = document.getElementById("growth-p");
    growthD.innerText = `Growth: ${result}`;
    const valueD = document.getElementById("value-p");
    const v = calculateInterestic(data.Symbol, data.EPS);
    valueD.innerText = `Value: ${v.toFixed(2)}`;
    const valueDP = document.getElementById("value-pp");
    valueDP.innerText = `Aceptable buy price: ${(v * 0.65).toFixed(2)}`;
  });
  controlDiv.appendChild(gSpan);

  contentDiv.appendChild(controlDiv);
  // end control buttons
  const p = document.createElement("p");
  p.innerText = `Name: ${data.Name}`;
  contentDiv.appendChild(p);
  const p2 = document.createElement("p");
  p2.innerText = `Description: ${data.Description}`;
  contentDiv.appendChild(p2);
  const p3 = document.createElement("p");
  p3.innerText = `Industry: ${data.Industry}`;
  contentDiv.appendChild(p3);
  const p4 = document.createElement("p");
  p4.innerText = `Bond: ${data.bond}`;
  contentDiv.appendChild(p4);
  const p5 = document.createElement("p");
  p5.innerText = `EPS: ${data.EPS}`;
  contentDiv.appendChild(p5);
  const p10 = document.createElement("p");
  p10.innerText = `Dividend Per Share: $${data.DividendPerShare}`;
  contentDiv.appendChild(p10);
  const p7 = document.createElement("p");
  p7.innerText = `Revenue: $${Number(data.RevenueTTM).toLocaleString("bg-BG")}`;
  contentDiv.appendChild(p7);
  const p6 = document.createElement("p");
  p6.innerText = `Gross Profit: $${Number(data.GrossProfitTTM).toLocaleString(
    "bg-BG"
  )}`;
  contentDiv.appendChild(p6);
  const p11 = document.createElement("p");
  p11.innerText = `Difference: $${Number(
    data.RevenueTTM - data.GrossProfitTTM
  ).toLocaleString("bg-BG")}`;
  contentDiv.appendChild(p11);
  const p8 = document.createElement("p");
  p8.innerText = `52 Week High: ${data["52WeekHigh"]}`;
  contentDiv.appendChild(p8);
  const p9 = document.createElement("p");
  p9.innerText = `52 Week Low: ${data["52WeekLow"]}`;
  contentDiv.appendChild(p9);

  const growth = document.createElement("p");
  growth.id = "growth-p";
  growth.innerText = `Growth: ${
    favEl?.growth ? favEl.growth : "NO GROWTH DATA"
  }`;
  contentDiv.appendChild(growth);

  const v = calculateInterestic(data.Symbol, data.EPS);

  const value = document.createElement("p");
  value.id = "value-p";
  value.innerText = `Value: ${favEl?.growth ? v.toFixed(2) : "NO GROWTH DATA"}`;
  contentDiv.appendChild(value);

  const valueP = document.createElement("p");
  valueP.id = "value-pp";
  valueP.innerText = `Aceptable buy price: ${
    favEl?.growth ? (v * 0.65).toFixed(2) : "NO GROWTH DATA"
  }`;
  contentDiv.appendChild(valueP);
}

function addLoadingBar() {
  const div = document.createElement("div");
  div.id = "loading-bar";
  div.style.width = "50px";
  div.style.height = "50px";
  div.style.backgroundColor = "red";
  contentDiv.appendChild(div);
}
function removeLoadingBar() {
  const bar = document.getElementById("loading-bar");
  bar.remove();
}

async function getSearchResults(keyword) {
  const result = await fetchAlphaVantage(
    alphavantageSearchEndpoint + keyword.trim()
  ).then((res) => res.json());
  console.log(result);
  return result.bestMatches;
}

async function fetchAlphaVantage(func) {
  return await fetch(alphaVantageUrl + func + alphaVantageKey);
}

async function getContent(symbol) {
  const result = await fetchAlphaVantage(
    alphavantageOverviewEndpoint + symbol
  ).then((res) => res.json());
  // const result = await fetch(`${url}${stonk}${KEY}`).then((res) => res.json());
  // const bond = await fetchBond(stonk);
  const bond = { description: "mock", valueOne: 69 };
  result.bond = bond.description;
  result.valueOne = bond.valueOne;
  result.valueTwo = 23.52;

  return result;
}

// async function fetchBond(stonk) {
//   const result = await fetch(`${finnhub}${finnhubKey}`).then((res) =>
//     res.json()
//   );
//   result.result[0].valueOne = 142;
//   return result.result[0];
// }

function calculateInterestic(symbol, eps) {
  // dido napishi si functiqta
  // V = (EPS * (nonGr + 2growth) * bondAvrg) / value
  // const interesticValue = (6.11 * (8.5 + 2 * 8.89) * 4.4) / 4.9;
  const growth = favouritesArr.find((el) => el.symbol === symbol).growth;
  return (eps * (nonGr + 2 * growth) * bondAvrg) / bond.value;
}

function main() {
  renderFavourites();
}

main();
