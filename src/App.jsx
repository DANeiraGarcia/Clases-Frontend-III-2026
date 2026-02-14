import ProductList from "./page/ProductList";
import Home from "./page/Home";
import Navbar from "./components/Navbar";
import './App.css';
import './components/Navbar.module.css';

function App() {
  return (
    <div className="App">
      <Navbar />
      <Home />
      <ProductList />
    </div>
  );
}

export default App;
