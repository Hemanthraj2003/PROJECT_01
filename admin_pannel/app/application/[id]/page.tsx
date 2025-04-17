"use client";
import { sampleApplication } from "@/app/sampleData";
import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

import { useParams } from "next/navigation";
import { Navigation, Pagination } from "swiper/modules";
import { Paper } from "@mui/material";

const page = () => {
  const { id } = useParams();
  console.log(id);
  const images = [
    "https://letsenhance.io/static/73136da51c245e80edc6ccfe44888a99/1015f/MainBefore.jpg",
    "https://letsenhance.io/static/73136da51c245e80edc6ccfe44888a99/1015f/MainBefore.jpg",
    "https://imgd.aeplcdn.com/370x208/n/cw/ec/170173/dzire-2024-exterior-right-front-three-quarter-3.jpeg?isig=0&q=80",
  ];

  const application = sampleApplication.find((app) => app.id.toString() === id);

  if (!application) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-xl font-semibold text-gray-700">
          Application not found.
        </p>
      </div>
    );
  }

  return (
    <Paper elevation={3} className="m-10 p-10">
      <div className="font-semibold text-2xl">Appication Details</div>
      <div className="flex w-full justify-between">
        {/* Left side of the application */}
        <div className="flex flex-col w-[64%] p-4 justify-evenly font-semibold">
          <div>CAR BRAND : {application.car_brand}</div>
          <div>APPLICATION DATE : {application.date}</div>
          <div>MODEL YEAR : {application.model_year}</div>
          <div>ADDRESS : {application.owner_address}</div>
          <div>PRICE : {application.price}</div>
        </div>

        {/* right side of the application */}
        <div className="w-[35%] ">
          <div className="relative">
            <Swiper
              className="flex justify-center items-center !pb-10"
              slidesPerView={1}
              navigation
              modules={[Navigation, Pagination]}
              pagination={{
                clickable: true,
                el: ".swiper-pagination",
              }}
            >
              {images.map((image, index) => (
                <SwiperSlide key={index}>
                  {/* <Image src={image} alt="car images" width={350} height={350} /> */}
                  <img
                    src={image}
                    alt="car images"
                    className="border h-[300px] w-[500px]"
                  />
                </SwiperSlide>
              ))}
            </Swiper>
            <div className="swiper-pagination"></div>
          </div>
          <div className="flex flex-col gap-3 p-5 ">
            <div className="text-xl font-bold">
              STATUS :
              <span className="text-green-400">
                {" "}
                {application.status.toUpperCase()}
              </span>
            </div>
            <div className="border border-green-400 text-green-400 hover:text-white p-2  rounded-[10px] text-center hover:bg-green-400">
              APROVE
            </div>
            <div className="border p-2 rounded-[10px] text-center border-red-400 text-red-400 hover:text-white hover:bg-red-400">
              REJECT
            </div>
          </div>
        </div>
      </div>
    </Paper>
  );
};

export default page;

// application status can be NEW, PENDING, ACCESPTED, REJECTED
