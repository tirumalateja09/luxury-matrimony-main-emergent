"use client"
import Navbar from "./component/Navbar";
import AutoCarousel from "./component/Home/AutoCarousel";
import Register from "./component/Home/Register";
import WhyChooseUs from "./component/Home/WhyChooseUs";
import Steps from "./component/Home/Steps";
import Download from "./component/Home/Download";
import Plans from "./component/Home/Plans";
import Testimonial from "./component/Home/Testimonial";
import Footer from "./component/Home/Footer";
import MainCarousel from "./component/Home/MainCarousel";

export default function Home() {
  return (
    <div className="md:bg-[#FEFCF5] w-full max-w-screen">
      <Navbar/>
      <MainCarousel />
      <Register />
      <WhyChooseUs />
      <Steps />
      <Download/>
      <Plans/>
      <Testimonial />
      <Footer/>
    </div>
  );
}
