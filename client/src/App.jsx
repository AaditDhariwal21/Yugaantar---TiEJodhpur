import { Routes, Route } from "react-router-dom";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import Home from "./pages/Home";
import ComingSoon from "./pages/ComingSoon";

export default function App() {
  return (
    <>
      <Navbar />
      <main>
        <Routes>
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
        </Routes>
      </main>
      <Footer />
    </>
  );
}
