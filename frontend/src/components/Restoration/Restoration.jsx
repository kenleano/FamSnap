import React, { useState } from "react";
import ImageUpload from "./ImageUploader";
import EnhanceImage from "./EnhanceImage";

function Restoration() {
  const [imageUrl, setImageUrl] = useState("");

  return (
    <div className="flex flex-col items-center justify-center w-screen py-10">
      <ImageUpload setImageUrl={setImageUrl} />

      <EnhanceImage imageUrl={imageUrl} />
    </div>
  );
}

export default Restoration;
