"use client";

import AutoCarousel from '@/app/component/Home/AutoCarousel';
import { api } from "@/lib/apiClient";
import React, { useEffect, useState } from 'react';

const mainhomeVideo = "/home/homeSlide/matrimonial.mp4";
const defaultImages = [
  mainhomeVideo,
  "/home/homeSlide/slide1.png",
  "/home/homeSlide/slide2.png",
  "/home/homeSlide/slide3.png",
  "/home/homeSlide/slide4.png",
];

const MainCarousel = ({ compact }) => {
  const [images, setImages] = useState(defaultImages);
  const [loading, setLoading] = useState(false);

  const fetchHomeData = async () => {
    try {
      setLoading(true);
      const res = await api.get("/home-sliders", "public");

      if (res && res.data && Array.isArray(res.data)) {
        const activeSliders = res.data.filter(item => item.isActive);
        const sorted = activeSliders.sort((a, b) => a.order - b.order);
        const imageUrls = sorted.map(item => item.image);
        
        if (imageUrls.length > 0) {
          setImages([mainhomeVideo, ...imageUrls]);
        }
      }
    } catch (error) {
      console.error("Error fetching home data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHomeData();
  }, []);

  return (
    <AutoCarousel images={images} compact={compact} />
  );
};

export default MainCarousel;
