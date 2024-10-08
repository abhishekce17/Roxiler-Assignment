
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Transactions } from './components/Transactions';
import { Analytics } from './components/Analytics';
import { Header } from "./components/Header";

function App() {

  return (
    <div className="min-h-screen bg-gray-300" >
      <BrowserRouter >
        <Header />
        <Routes>
          <Route path="/" element={<Transactions />} />
          <Route path="/analytics" element={<Analytics />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
