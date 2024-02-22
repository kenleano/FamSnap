import React, { useState } from 'react';
import { Uploader } from 'uploader'; 
import { UploadDropzone } from 'react-uploader';
import Replicate from 'replicate'; 
const Home = () => {
  const [originalPhoto, setOriginalPhoto] = useState(null);
  const [restoredImage, setRestoredImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const uploader = Uploader({
    apiKey: 'public_12a1yp3ERjKdgM87egzFDbfwrNE1', // Replace with your Bytescale API key
  });
  const replicate = new Replicate({
          auth: "r8_InjcaVB1gBMY51XQdgXzPMHJRiaMxJF1bR2X5", // Replace with your Replicate API token
        });
  const UploadDropZone = () => (
    <UploadDropzone
      uploader={uploader}
      onUpdate={(files) => {
        const file = files[0];
        if (file) {
          const imageUrl = file.fileUrl.replace('raw', 'thumbnail');
          setOriginalPhoto(imageUrl);
          generatePhoto(imageUrl); // Pass the imageUrl to the generatePhoto function
        }
      }}
      width="670px"
      height="250px"
    />
  );

  async function generatePhoto(fileUrl) {
    setLoading(true);
  
    try {
      // Call Replicate API for image restoration
      const output = await replicate.run(
        "batouresearch/high-resolution-controlnet-tile:4af11083a13ebb9bf97a88d7906ef21cf79d1f2e5fa9d87b70739ce6b8113d29",
        {
          input: {
            img: fileUrl, // Assuming fileUrl is the image URL
            version: "v1.4",
            scale: 2,
          },
        }
      );
  
      // Assuming the Replicate API returns an enhanced image URL
      const restoredImageUrl = output.enhancedImage;
      setRestoredImage(restoredImageUrl);
    } catch (error) {
      console.error('Error generating photo:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1>Restore any face photo</h1>
      {loading ? (
        <div>
          <p>Processing...</p>
        </div>
      ) : (
        <>
          {!originalPhoto && <UploadDropZone />}
          {originalPhoto && (
            <div>
              <h2>Original Photo</h2>
              <img src={originalPhoto} alt="Original" />
            </div>
          )}
          {restoredImage && (
            <div>
              <h2>Restored Photo</h2>
              <img src={restoredImage} alt="Restored" />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Home;
