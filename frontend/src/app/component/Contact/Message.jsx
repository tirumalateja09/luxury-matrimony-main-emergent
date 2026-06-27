import React from "react";
import Image from "next/image";

const Message = () => {
  return (
    <div className="bg-[linear-gradient(180deg,_#429466_0%,_#0B502A_100%)] w-full h-[344px] overflow-hidden rounded-t-2xl -mt-3 relative z-10 px-4 sm:px-6 md:px-8 lg:px-12">
      <Image
        src={"/contact/mandala3.svg"}
        alt=""
        height={700}
        width={700}
        className="absolute right-0 border-0 max-sm:hidden"
      />
      <div className="flex items-center h-full md:w-1/2">
        <div className=" flex flex-col gap-6">
          <h1
            className="md:text-4xl text-2xl font-playfair font-semibold md:text-left
               bg-[linear-gradient(99.44deg,_#E3B450_2.09%,_#F6DC7F_40.67%,_#CAA043_92.25%)]
               bg-clip-text text-transparent"
          >
            Built on Tradition and Trust
          </h1>
          <p className=" text-sm text-center md:text-xl text-white md:text-left">
            Your privacy and trust matter to us. We are committed to providing a
            safe, respectful, and dignified platform for finding your life
            partner. Our team is always here to support you and your family.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Message;
