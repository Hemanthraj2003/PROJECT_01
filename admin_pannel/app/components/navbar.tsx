import Link from "next/link";
import React from "react";

const navbar = () => {
  return (
    <div className="flex justify-between items-center px-20 py-5 bg-slate-600 text-white ">
      <div className="text-xl font-[900] cursor-pointer">CONTROL PANNEL</div>
      <div className="flex gap-28 font-[600]">
        <Link href="/">
          <div className="cursor-pointer">APPLICATIONS</div>
        </Link>
        <Link href="/cars">
          <div className="cursor-pointer">CARS</div>
        </Link>
        <Link href="/users">
          <div className="cursor-pointer">USERS</div>
        </Link>
      </div>
    </div>
  );
};

export default navbar;
