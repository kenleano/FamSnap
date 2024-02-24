import React, { useState } from "react";

function Restoration() {
   const [imageUrl, setImageUrl] = useState("");
   const [restoredImages, setRestoredImages] = useState([]);
   const [isSubmitting, setIsSubmitting] = useState(false);

   const checkStatus = async (id) => {
     try {
       const statusResponse = await fetch(
         `http://localhost:3000/checkStatus/${id}`,
         {
           method: "GET",
           headers: {
             "Content-Type": "application/json",
           },
         }
       );
       const statusData = await statusResponse.json();
       return statusData;
     } catch (error) {
       console.error("Failed to check status", error);
       return null;
     }
   };

   const pollStatus = async (id) => {
     const checkInterval = setInterval(async () => {
       const statusData = await checkStatus(id);
       if (statusData && statusData.status === "succeeded") {
         clearInterval(checkInterval);
         setIsSubmitting(false);
         setRestoredImages(statusData.output); // Assuming 'output' contains the final image URLs
       }
     }, 5000); // Check every 5 seconds
   };

   const handleSubmit = async (e) => {
     e.preventDefault();
     setIsSubmitting(true);

     try {
       const response = await fetch("http://localhost:3000/restoreImage", {
         method: "POST",
         headers: {
           "Content-Type": "application/json",
         },
         body: JSON.stringify({
           hdr: 0.7,
           image: imageUrl,
           steps: 20,
           prompt: "UHD 4k vogue, a woman wearing a colorful organic hat",
           scheduler: "DDIM",
           creativity: 0.75,
           guess_mode: false,
           resolution: 2048,
           resemblance: 1,
           guidance_scale: 5,
           negative_prompt:
             "Teeth, tooth, open mouth, longbody, lowres, bad anatomy, bad hands, missing fingers, extra digit, fewer digits, cropped, worst quality, low quality, mutant",
         }),
       });

       const initialData = await response.json();
       if (initialData && initialData.id) {
         pollStatus(initialData.id);
       } else {
         setIsSubmitting(false);
         console.error("No ID returned from initial request");
       }
     } catch (error) {
       console.error("Failed to restore image", error);
       setIsSubmitting(false);
     }
   };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <label htmlFor="imageUrl">Image URL:</label>
        <input
          id="imageUrl"
          type="text"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          required
        />
        <button type="submit" disabled={isSubmitting}>
          Restore Image
        </button>
      </form>

      <div>
        <div>
          <img
            src={restoredImages} // Assuming the image URL is in data.urls.get
            style={{ maxWidth: "100%" }}
          />
          <p>{restoredImages}</p>
        </div>
      </div>
    </div>
  );
}

export default Restoration;
