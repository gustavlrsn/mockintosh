import { useState } from "react";
import Hello from "../components/Hello";
import Head from "next/head";

export default () => {
  const [isHelloOpen, setIsHelloOpen] = useState(true);
  return (
    <div className="">
      <Head>
        <title>Pluto Computer Club</title>
      </Head>
      <div
        className="corner bg-white px-5 border-b border-black flex items-center chicago"
        style={{ height: 18 }}
      >
        <img
          src="/filledcircle.svg"
          className="mr-2"
          style={{ height: 11, width: 11 }}
        />
        Pluto Computer Club
      </div>
      {isHelloOpen && <Hello close={() => setIsHelloOpen(false)} />}
    </div>
  );
};
