import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Main from "./pages/Main";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import Layout from "./pages/SidebarWrapper";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/login" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />

        <Route element={<Layout />}>
          <Route path="/" element={<Main/>} />
        </Route>

      </Routes>
    </BrowserRouter>
  );
};

export default App;