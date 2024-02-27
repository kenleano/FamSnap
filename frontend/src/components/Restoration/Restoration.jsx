import React, { useState } from "react";
import ImageUpload from "./ImageUploader";
import EnhanceImage from "./EnhanceImage";
import ColorizeImage from "./ColorizeImage";
import { Routes, Route } from "react-router-dom";

function Restoration() {
  const [imageUrl, setImageUrl] = useState("");

  return (
    <div className="flex flex-col items-center justify-center overflow-x-hidden">
      <ImageUpload setImageUrl={setImageUrl} />

      <Routes>
        <Route
          path="/colorize"
          element={<ColorizeImage imageUrl={imageUrl} />}
        />
        <Route path="/enhance" element={<EnhanceImage imageUrl={imageUrl} />} />
      </Routes>
    </div>
  );
}

export default Restoration;
