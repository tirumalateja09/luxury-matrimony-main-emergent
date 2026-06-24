import React from "react";
import Image from "next/image";

const Story = () => {
  return (
    <div className="px-4 sm:px-6 md:px-12 lg:px-24 w-full">
      <div className="w-full">
        <Image
          src="/about/story.png"
          alt="Hero"
          width={0}
          height={0}
          sizes="100vw"
          className="w-full h-auto hidden md:block"
          priority
        />
        <Image
          src="/about/storyMobile.png"
          alt="Hero"
          width={0}
          height={0}
          sizes="100vw"
          className="w-full h-auto block md:hidden"
          priority
        />
      </div>
    </div>
  );
};

export default Story;
