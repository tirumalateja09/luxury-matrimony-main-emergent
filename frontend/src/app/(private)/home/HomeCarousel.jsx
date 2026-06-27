"use client";

import AutoCarousel from '@/app/component/Home/AutoCarousel';
import { api } from "@/lib/apiClient";
import React, { useEffect, useState } from 'react';

const mainhomeVideo = "/home/homeSlide/matrimonial.mp4";

const HomeCarousel = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);

 const fetchHomeData = async () => {
  try {
    setLoading(true);

    const res = await api.get("/sliders", "private");

    // ✅ Step 1: correct data access
    const sliders = res.data;

    // ✅ Step 2: filter only active
    const activeSliders = sliders?.filter(item => item.isActive);

    // ✅ Step 3: sort by order
    const sorted = activeSliders.sort((a, b) => a.order - b.order);

   
    // ✅ Step 4: extract image URLs
    const imageUrls = sorted.map(item => item.image);

    setImages([mainhomeVideo, ...imageUrls]);

  } catch (error) {
    console.error("Error fetching home data:", error);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchHomeData();
  }, []);
if(images.length === 0) {
    return null; // or a placeholder
  }
  return (
    <AutoCarousel mainhome={true} images={images} />
  );
};

export default HomeCarousel;
