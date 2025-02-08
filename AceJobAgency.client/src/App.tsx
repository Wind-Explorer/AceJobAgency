import { Route, Routes } from "react-router-dom";
import DefaultLayout from "./layouts/DefaultLayout";
import HomePage from "./pages/HomePage";
import ErrorPage from "./pages/ErrorPage";

export default function App() {
  return (
    <Routes>
      <Route>
        <Route path="/">
          <Route element={<DefaultLayout />}>
            <Route index element={<HomePage />} />
            <Route path="*" element={<ErrorPage />} />
          </Route>
        </Route>
      </Route>
    </Routes>
  );
}
