import { Suspense } from "react";
import MessagesClient from "./MessagesClient";
import MobileHeader from "@/app/component/MobileHeader";

export default function MessagesPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div className=" xl:px-16">
        <MobileHeader isRead={true} />
        <MessagesClient />
      </div>
    </Suspense>
  );
}
