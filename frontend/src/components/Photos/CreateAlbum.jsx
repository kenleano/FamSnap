import React, { useState, useContext } from 'react';
import axios from 'axios';
import { useAuth } from '../AuthContext';

const CreateAlbum = () => {
  const { user } = useAuth();
  const [albumName, setAlbumName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleCreateAlbum = async () => {
    if (!albumName) {
      setError("Album name cannot be empty");
      return;
    }
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await axios.post(`http://localhost:3000/albums/${user.id}`, {
        albumName, // Send the album name and any other required data
      });

      if (response.status === 200) {
        setSuccess(true);
        setAlbumName(''); // Clear the input after successful creation
      } else {
        setError("Failed to create album");
      }
    } catch (error) {
      setError("Error creating album: " + (error.response?.data?.message || error.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="create-album-container">
      {error && <p className="error">{error}</p>}
      {success && <p className="success">Album created successfully!</p>}
      <input
        type="text"
        value={albumName}
        onChange={(e) => setAlbumName(e.target.value)}
        placeholder="Enter album name"
        className="album-name-input"
      />
      <button
        onClick={handleCreateAlbum}
        disabled={isSubmitting}
        className="create-album-button"
      >
        Create Album
      </button>
    </div>
  );
};

export default CreateAlbum;
