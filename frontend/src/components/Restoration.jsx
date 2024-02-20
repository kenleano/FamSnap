import React from 'react';
import ImageUploader from './ImageUploader.jsx';

const Restoration=()=> {
  return (
    <div className="flex items-center justify-center h-screen">
        <button className="bg-slate-900 text-yellow-400">Enhance</button>
        <button>Colorize</button>
      <ImageUploader />
    </div>
  );
}

export default Restoration;