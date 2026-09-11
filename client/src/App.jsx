import { lazy, Suspense } from "react";
import { Outlet, Route, Routes } from "react-router-dom";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import Home from "./pages/Home";
import ComingSoon from "./pages/ComingSoon";
import { ContentProvider } from "./lib/content";

/* The admin panel is a separate chunk: it is a handful of people a few times a
   year, and there is no reason for every visitor to download a CRUD editor. */
const AdminPanel = lazy(() => import("./pages/admin/AdminPanel"));

/* The public site. The admin panel sits outside this on purpose — it has its
   own chrome, and the marketing nav and footer would only get in the way. */
function SiteLayout() {
  return (
    <ContentProvider>
      <Navbar />
      <main>
        <Outlet />
      </main>
      <Footer />
    </ContentProvider>
  );
}

export default function App() {
  return (
    <Routes>
      <Route
        path="/adminpanel"
        element={
          <Suspense fallback={null}>
            <AdminPanel />
          </Suspense>
        }
      />

      <Route element={<SiteLayout />}>
        <Route path="/" element={<Home />} />

        {/* 3.16 — holding pages until these are built out */}
        <Route
          path="/partnership"
          element={
            <ComingSoon
              badge="Partnership"
              heading="Partner with Yugaantar 2026."
              body="Sponsorship and exhibitor packages are being finalised. Tell us what you have in mind and we'll send the deck as soon as it's ready."
            />
          }
        />
        <Route
          path="/tickets/registration-form"
          element={
            <ComingSoon
              badge="Registration"
              heading="Registration opens shortly."
              body="Passes for 22–23 October 2026 at Hotel Radisson, Jodhpur are not on sale yet. Register your interest by email and we'll let you know the moment they are."
            />
          }
        />

        <Route
          path="*"
          element={
            <ComingSoon
              badge="404"
              heading="We can't find that page."
              body="The link may be out of date. Head back to the home page to find what you're after."
            />
          }
        />
      </Route>
    </Routes>
  );
}
