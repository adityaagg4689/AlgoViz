import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import ArrayPage from "./pages/ArrayPage";
import LinkedListPage from "./pages/LinkedListPage";
import StackPage from "./pages/StackPage";
import QueuePage from "./pages/QueuePage";
import TreePage from "./pages/TreePage";
import GraphPage from "./pages/GraphPage";
import LandingPage from "./pages/LandingPage";

export default function App() {
  return (
    <Routes>
      {/* <Route path="/" element={<Home />} /> */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/array" element={<ArrayPage />} />
      <Route path="/linked-list" element={<LinkedListPage />} />
      <Route path="/stack" element={<StackPage />} />
      <Route path="/queue" element={<QueuePage />} />
      <Route path="/tree" element={<TreePage />} />
      <Route path="/graph" element={<GraphPage />} />
      <Route path="*" element={<Navigate to="/" />} />
      

    </Routes>
  );
}
