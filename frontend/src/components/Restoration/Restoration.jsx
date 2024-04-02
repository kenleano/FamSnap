import React, { useState } from "react";
import ImageUpload from "./ImageUploader";
import EnhanceImage from "./EnhanceImage";
import ColorizeImage from "./ColorizeImage";
import { Routes, Route } from "react-router-dom";
import ProfessionalArtist from "./ProfessionalArtist";
import Contact from "./Contact";

function Restoration() {
  const [imageUrl, setImageUrl] = useState("");

  return (
    <div className="flex flex-col items-center justify-center overflow-x-hidden">
      {/* <ImageUpload setImageUrl={setImageUrl} /> */}

      <Routes>
        <Route
          path="/colorize"
          element={<ColorizeImage setImageUrl={setImageUrl}  imageUrl={imageUrl} />}
        />
        <Route
          path="/enhance"
          element={
            <EnhanceImage setImageUrl={setImageUrl} imageUrl={imageUrl} />
          }
        />
        <Route
          path="/professional-artist"
          element={
            <ProfessionalArtist imageUrl={imageUrl} />
          }
        />
        <Route path="/contact" element={<Contact />} />
      </Routes>
    </div>
  );
}

export default Restoration;
