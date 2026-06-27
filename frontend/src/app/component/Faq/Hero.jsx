import Image from "next/image";

export default function Hero() {
  return (
    <div className="w-full"> 
      <Image
        src="/faq/hero.png"
        alt="Hero"
        width={0}
        height={0}
        sizes="100vw"
        className="w-full h-auto max-md:hidden"
        priority
      />
      <Image
        src="/faq/hero-m.png"
        alt="Hero"
        width={0}
        height={0}
        sizes="100vw"
        className="w-full h-auto md:hidden"
        priority
      />
    </div>
  );
}