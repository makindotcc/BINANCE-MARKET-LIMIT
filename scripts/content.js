const mlButtonClass = `binance_ml`;

// Get price from rest api.
const getPriceFromRest = (symbol) =>
  fetch(`https://www.binance.com/api/v3/ticker/price?symbol=${encodeURIComponent(symbol)}`)
    .then(result => result.json())
    .then(json => parseFloat(json.price));

const getPriceFromDocument = (symbol) => {
  const titleColumns = document.title.split(" | ");
  const titleSymbol = titleColumns[1].split(" ", 2)[0];
  if (titleSymbol !== symbol) {
    return null;
  }
  return parseFloat(titleColumns[0]);
};

const getPrice = async (symbol) => getPriceFromDocument(symbol) || await getPriceFromRest(symbol);

const placeMlOrder = async (symbol, placeLimitOrder) => {
  try {
    console.log("Placing ml order for " + symbol);
    const price = await getPrice(symbol);
    if (price != null && !Number.isNaN(price)) {
      placeLimitOrder(price);
    } else {
      console.log("Got invalid price: " + price);
    }
  } catch (ex) {
    console.log("Place ml error:", ex, ex.stack);
    alert("Could not place ml order!!!");
  }
};

const createMarketLimitButton = (formElement) => {
  const orderMarketButton = formElement.children[0];
  if (orderMarketButton.classList[0] === mlButtonClass) {
    // already modified
    return;
  }
  const symbol = formElement.parentElement.parentElement
    .querySelector(".symbol * .pair").innerText;
  console.log("Attaching ML to order with symbol " + symbol);

  const limitButton = formElement.children[1];
  const limitInput = formElement.children[2].children[0];
  const placeLimitOrder = (limitPrice) => {
    console.log(`Placing limit order for ${symbol} with price: ${limitPrice}.`);
    limitInput.value = limitPrice;
    // They are using react or something else which has own state that
    // does not rely on DOM state, so we need inform their code that
    // they should update their state copy.
    limitInput.dispatchEvent(new Event('input', { bubbles: true }));    
    limitButton.click();
  };

  const mlButton = document.createElement("button");
  mlButton.innerText = "ML";
  mlButton.classList.add(mlButtonClass);
  mlButton.addEventListener("click", () => placeMlOrder(symbol, placeLimitOrder));
  orderMarketButton.classList.forEach(clazz => mlButton.classList.add(clazz));
  formElement.insertBefore(mlButton, orderMarketButton);
};

const attachMarketLimitButton = () =>
  [...document.querySelectorAll(".closePosition")]
    .slice(1) // skip "Close All Positions"
    .map(node => node.children[0])
    .filter(child => child != null)
    .forEach(createMarketLimitButton);

attachMarketLimitButton();

setInterval(attachMarketLimitButton, 1000);
