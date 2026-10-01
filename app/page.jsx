import UtilityBar from "./components/UtilityBar";
import Header from "./components/Header";
import Hero from "./components/Hero";
import Approach from "./components/Approach";
import Services from "./components/Services";
import Steps from "./components/Steps";
import ProBono from "./components/ProBono";
import Jobs from "./components/Jobs";
import Partnerships from "./components/Partnerships";
import Faq from "./components/Faq";
import Contact from "./components/Contact";
import Footer from "./components/Footer";

export default function Home() {
  return (
    <>
      <div className="topbar">
        <UtilityBar />
        <Header />
      </div>
      {/* A family's path runs unbroken from the hero to the care request; the
          sections for caregivers and referral partners follow it. */}
      <main id="top">
        <Hero />
        <Approach />
        <Services />
        <Steps />
        <ProBono />
        <Faq />
        <Contact />
        <Jobs />
        <Partnerships />
      </main>
      <Footer />
    </>
  );
}
