import Sidebar from "./components/sidebar/Sidebar";
import Topbar from "./components/topbar/Topbar";
import "./app.css";
import Home from "./pages/home/Home";
import { BrowserRouter as Router, Switch, Route, Redirect } from "react-router-dom";
import UserList from "./pages/userList/UserList";
import User from "./pages/user/User";
import NewUser from "./pages/newUser/NewUser";
import ProductList from "./pages/productList/ProductList";
import Product from "./pages/product/Product";
import NewProduct from "./pages/newProduct/NewProduct";
import ListList from "./pages/listList/ListList";
import List from "./pages/list/List";
import NewList from "./pages/newList/NewList";
import Login from "./pages/login/Login";
import { useContext } from "react";
import { AuthContext } from "./context/authContext/AuthContext";
import Placeholder from "./pages/placeholder/Placeholder";


function App() {
  const { user } = useContext(AuthContext);
  const isAuthenticated = Boolean(user?.isAdmin && user?.accessToken);
  
  return (
    <Router>
      <Switch>
        <Route path="/login">{isAuthenticated ? <Redirect to="/" /> : <Login />}</Route>
        <Route path="/">
          {isAuthenticated ? (
            <>
              <Topbar />
              <div className="container">
                <Sidebar />
                <Route exact path="/">
                  <Home />
                </Route>
                <Route path="/users">
                  <UserList />
                </Route>
                <Route path="/user/:userId">
                  <User />
                </Route>
                <Route path="/newUser">
                  <NewUser />
                </Route>
                <Route path="/movies">
                  <ProductList />
                </Route>
                <Route path="/product/:productId">
                  <Product />
                </Route>
                <Route path="/newproduct">
                  <NewProduct />
                </Route>
                <Route path="/lists">
                  <ListList />
                </Route>
                <Route path="/list/:listId">
                  <List />
                </Route>
                <Route path="/newlist">
                  <NewList />
                </Route>
                <Route path="/analytics">
                  <Placeholder
                    title="Analytics"
                    message="Analytics dashboard is available in the next phase."
                  />
                </Route>
                <Route path="/sales">
                  <Placeholder
                    title="Sales"
                    message="Sales reporting route is connected. Data module is pending."
                  />
                </Route>
                <Route path="/transactions">
                  <Placeholder
                    title="Transactions"
                    message="Transactions page route is ready. Connect payment data when needed."
                  />
                </Route>
                <Route path="/reports">
                  <Placeholder
                    title="Reports"
                    message="Reports route is active. You can add chart/report widgets here."
                  />
                </Route>
                <Route path="/mail">
                  <Placeholder title="Mail" message="Mail center route is active." />
                </Route>
                <Route path="/feedback">
                  <Placeholder title="Feedback" message="Feedback route is active." />
                </Route>
                <Route path="/messages">
                  <Placeholder title="Messages" message="Messages route is active." />
                </Route>
                <Route path="/manage">
                  <Placeholder title="Manage" message="Staff manage route is active." />
                </Route>
                <Route path="/staff/analytics">
                  <Placeholder title="Staff Analytics" message="Staff analytics route is active." />
                </Route>
                <Route path="/staff/reports">
                  <Placeholder title="Staff Reports" message="Staff reports route is active." />
                </Route>
                <Route>
                  <Redirect to="/" />
                </Route>
              </div>
            </>
          ) : (
            <Redirect to="/login" />
          )}
        </Route>
      </Switch>
    </Router>
  );
}

export default App;
