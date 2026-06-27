import Image from "next/image";

export default function Hero() {
  return (
    <div className="">
      {/* DESKTOP VIEW (Hidden on Mobile) */}
      <div className="w-full relative overflow-hidden h-[500px] bg-[linear-gradient(3.83deg,_rgba(243,218,208,0)_-1.8%,_#F3DAD0_168.35%)] hidden md:block px-4 sm:px-6 md:px-12 lg:px-24">
        <Image
          src={"/about/ellipse.png"}
          height={400}
          width={500}
          alt=""
          className=" absolute left-0 top-0"
        />
        <Image
          src={"/about/p1.svg"}
          height={97}
          width={95}
          alt="p1"
          className="absolute -top-6 right-30"
        />
        <div className=" relative w-full">
          <div className="space-y-5 w-[50%] absolute left-[40%] top-14">
            <h1 className=" font-bold uppercase text-[#429466] text-[20px] font-inter">
              About Us
            </h1>
            <h2 className=" font-playfair font-semibold text-[#2A1D1D] text-[56px] leading-[67.2px]">
              Where Traditions Meet Trust
            </h2>
            <p className=" text-[#6E2F2F] text-[20px] leading-7">
              RVR Luxury Matrimony was born from a simple yet profound belief:
              finding a life partner is one of the most important decisions a
              person and their family will make, and it deserves a platform
              built on trust, respect, and cultural understanding.
            </p>
          </div>
        </div>
        <Image
          src={"/about/p2.svg"}
          height={200}
          width={200}
          alt="p1"
          className="absolute right-0"
        />
        <Image
          src={"/contact/petals-left.png"}
          height={103}
          width={107}
          alt="p1"
          className="absolute md:right-[30%] bottom-[10%]"
        />
        <Image
          src={"/contact/petals-right.png"}
          height={103}
          width={107}
          alt="p1"
          className="absolute md:right-[15%] bottom-[10%]"
        />
      </div>

      {/* MOBILE VIEW (Hidden on Desktop) */}
      <Image
        src={"/about/heroMobile.png"}
        width={372}
        height={783}
        alt="heroMobile"
        className="w-full h-auto md:hidden"
      />
    </div>
  );
}