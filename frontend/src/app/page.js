"use client"
import Navbar from "./component/Navbar";
import HeroSection from "./component/Home/HeroSection";
import Register from "./component/Home/Register";
import TrustStats from "./component/Home/TrustStats";
import WhyChooseUs from "./component/Home/WhyChooseUs";
import Steps from "./component/Home/Steps";
import Download from "./component/Home/Download";
import Plans from "./component/Home/Plans";
import Testimonial from "./component/Home/Testimonial";
import Footer from "./component/Home/Footer";

export default function Home() {
  return (
    <div className="md:bg-[#FEFCF5] w-full max-w-screen">
      <Navbar/>
      <HeroSection />
      <Register />
      <TrustStats />
      <WhyChooseUs />
      <Steps />
      <Download/>
      <Plans/>
      <Testimonial />
      <Footer/>
    </div>
  );
}
