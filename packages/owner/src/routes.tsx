import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";

const MainLayout = lazy(() => import("./layouts/MainLayout"));

export default function AppRoutes() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Routes>
        <Route path="/" element={<MainLayout />} />
      </Routes>
    </Suspense>
  );
}