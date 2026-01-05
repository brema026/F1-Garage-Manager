import { useState } from "react";
import Navbar from "./components/Navbar";
import Users from "./pages/Users";
import Teams from "./pages/Teams";
import Drivers from "./pages/Drivers";
import Sponsors from "./pages/Sponsors";
import Parts from "./pages/Parts";
import Inventory from "./pages/Inventory";
import CarSetup from "./pages/CarSetup";

function App() {
  const [view, setView] = useState("users");

  const renderView = () => {
    switch (view) {
      case "users": return <Users />;
      case "teams": return <Teams />;
      case "drivers": return <Drivers />;
      case "sponsors": return <Sponsors />;
      case "parts": return <Parts />;
      case "inventory": return <Inventory />;
      case "setup": return <CarSetup />;
      default: return <Users />;
    }
  };

  return (
    <div>
      <Navbar setView={setView} />
      <div style={{ padding: "20px" }}>
        {renderView()}
      </div>
    </div>
  );
}

export default App;