import Image from "next/image";

export default function Hero() {
  return (
    <div className="w-full"> 
      <Image
        src="/contact/Hero.png"
        alt="Hero"
        width={0}
        height={0}
        sizes="100vw"
        className="w-full h-auto hidden md:block"
        priority
      />
      <Image
        src="/contact/HeroMobile.png"
        alt="Hero"
        width={0}
        height={0}
        sizes="100vw"
        className="w-full h-auto block md:hidden"
        priority
      />
    </div>
  );
}