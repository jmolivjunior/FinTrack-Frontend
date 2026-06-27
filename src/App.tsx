import { BrowserRouter, Routes,Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";

function App(){
  return(
    <BrowserRouter>
    <Routes>
     <Route path="/" element={<Login />}/>
     <Route path="/dashboard" element={<div>Dashboard em breve!</div>} />
      </Routes>
      </BrowserRouter>

  );
}

export default App;