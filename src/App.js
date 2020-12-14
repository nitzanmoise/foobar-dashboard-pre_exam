import React, { useState, useEffect } from "react";
import { getData, getBeers, postOrder } from "./modules/Rest";
import { get, put } from "./modules/restdb";

// import Start from "./pages/Start";
import Home from "./pages/Home";

import Shop from "./pages/Shop";
import Cart from "./pages/Cart";
import Payment from "./pages/Payment";
import Message from "./pages/Message";
import Nav from "./components/Nav";
import "./App.scss";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
} from "react-router-dom";

export default function App() {
  const [showNav, setShowNav] = useState(false);
  const [isPosted, setIsPosted] = useState(false);

  const [message, setMessage] = useState("");

  const [beers, setBeers] = useState([]);
  const [data, setData] = useState({});
  const [cartItems, setCartItems] = useState([]);

  // Rating states
  const [beersRating, setBeersRating] = useState([]);
  const [stars, setStars] = useState([
    { isMarked: false, number: 1 },
    { isMarked: false, number: 2 },
    { isMarked: false, number: 3 },
    { isMarked: false, number: 4 },
    { isMarked: false, number: 5 },
  ]);

  // Rating
  function updateRating(beerName, newRating, nextStars) {
    if (beersRating.length > 1) {
      setStars(nextStars);

      const beerToUpdate = beersRating.filter((item) => item.name === beerName);
      const newRatingList = beerToUpdate[0].ratingArray.concat(newRating);

      put(beerToUpdate[0]._id, newRatingList, showRating);
    }
  }
  function showRating(data) {
    const nextArray = data.ratingArray;
    const avarage = nextArray.reduce((a, b) => a + b, 0) / nextArray.length;
    const nextCartItems = cartItems.map((item) => {
      if (item.name === data.name) {
        item.rating = avarage;
      }
      return item;
    });
    setCartItems(nextCartItems);
  }

  function sendPostRequest(order) {
    //this function is called from Form
    postOrder(order, sendMessage);
  }

  // Showing notifications
  let notificationsCount;
  let totalPrice;
  if (cartItems.length > 1) {
    const reducer = (accumulator, currentValue) =>
      accumulator + currentValue.amount;
    notificationsCount = cartItems.reduce(reducer, 0);
    totalPrice = 45 * notificationsCount;
  }

  function editCartItems(name, modifier) {
    const nextItems = cartItems.map((item) => {
      if (item.name === name) {
        item.amount += modifier;
      }
      return item;
    });
    setCartItems(nextItems);
  }

  // Displaying nav bar

  function displayNav(bool) {
    setShowNav(bool);
  }
  function applyRating(data) {
    setBeersRating(data);
    if (cartItems.length > 1) {
      const nextItems = cartItems.map((beer) => {
        data.forEach((rating) => {
          if (beer.name === rating.name) {
            const avarage =
              rating.ratingArray.reduce((a, b) => a + b, 0) /
              rating.ratingArray.length;
            beer.rating = avarage;
          }
        });
        return beer;
      });
      setCartItems(nextItems);
    }
  }

  const sendMessage = (data) => {
    setMessage(data);
    setIsPosted(true);
  };
  useEffect(() => {
    getData(setData, setCartItems);
    getBeers(setBeers);
    get(applyRating);
  }, []);

  return (
    <div className="App">
      <Router>
        <div className="nav">
          {showNav && <Nav />}

          <Switch>
            <Route path="/message">
              <Message message={message} setShowNav={setShowNav} />
            </Route>
            <Route path="/payment">
              {isPosted ? (
                <Redirect to="/message" />
              ) : (
                <Payment
                  totalPrice={totalPrice}
                  setShowNav={setShowNav}
                  notificationsCount={notificationsCount}
                  sendPostRequest={sendPostRequest}
                  cartItems={cartItems}
                />
              )}
            </Route>
            <Route path="/shop">
              <Shop
                updateRating={updateRating}
                stars={stars}
                setShowNav={setShowNav}
                notificationsCount={notificationsCount}
                data={data}
                beers={beers}
                cartItems={cartItems}
                editCartItems={editCartItems}
              />
            </Route>
            <Route path="/cart">
              <Cart
                displayNav={displayNav}
                notificationsCount={notificationsCount}
                data={data}
                beers={beers}
                cartItems={cartItems}
                editCartItems={editCartItems}
                sendPostRequest={sendPostRequest}
                totalPrice={totalPrice}
              />
            </Route>
            <Route path="/">
              <Home
                displayNav={displayNav}
                data={data}
                beers={beers}
                cartItems={cartItems}
                editCartItems={editCartItems}
              />
            </Route>
          </Switch>
        </div>
      </Router>
    </div>
  );
}
