import { useMemo, useState } from "react";

import "./App.css";

import Footer from "./components/Footer";
import Header from "./components/Header";

import Cart from "./page/Cart";
import Home from "./page/Home";
import ProductList from "./page/ProductList";

function App() {
  const [activePage, setActivePage] = useState("home");
  const [user, setUser] = useState(null);

  const page = useMemo(() => {
    if (activePage === "products") return <ProductList />;
    if (activePage === "cart") return <Cart />;

    return <Home />;
  }, [activePage]);

  const handleSignIn = () => {
    setUser({ name: "Usuario" });
  };

  const handleSignOut = () => {
    setUser(null);
  };

  return (
    <div className="app">
      <Header
        activePage={activePage}
        onNavigate={setActivePage}
        user={user}
        onSignIn={handleSignIn}
        onSignOut={handleSignOut}
      />

      <main className="main">{page}</main>

      <Footer />
    </div>
  );
}

export default App;


