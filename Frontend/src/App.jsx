import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import UserProvider from "./pages/UserProvider";
import Main from "./pages/Main";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import Layout from "./pages/SidebarWrapper";
import NewChat from "helper/NewChat";
const App = () => {

  const Protected = () => {
    return (
      <UserProvider>
        <Outlet />
      </UserProvider>
    )
  }
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/signup" element={<SignUp />} />
        <Route element={<Protected />}>
          <Route path='/' element={<NewChat/>} ></Route>
          <Route path="/login" element={<SignIn />} />
          <Route element={<Layout />}>
            <Route path="/chat/:threadId" element={<Main />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;