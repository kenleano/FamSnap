import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../AuthContext';

const CreateAlbum = () => {
  const { user } = useAuth();
  const [albumName, setAlbumName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const handleCreateAlbum = async () => {
    if (!albumName.trim()) {
      setError("Album name cannot be empty");
      return;
    }
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await axios.post(`http://localhost:3000/albums/${user.id}`, {
        albumName: encodeURIComponent(albumName.trim()),
      });

      if (response.status === 200) {
        setSuccess(true);
        setAlbumName('');
        setTimeout(() => {
          setShowModal(false); // Automatically close the modal after a delay if creation is successful
        }, 2000);
      } else {
        setError("Failed to create album");
      }
    } catch (error) {
      setError("Error creating album: " + (error.response?.data?.message || error.message));
    } finally {
      setIsSubmitting(false);
    }
    window.location.reload();
  };

  return (
    <>
      <button className="create-album-btn bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
              onClick={() => setShowModal(true)}>
        Create New Album
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Create New Album</h3>
              <div className="mt-2 px-7 py-3">
                <input
                  type="text"
                  value={albumName}
                  onChange={(e) => setAlbumName(e.target.value)}
                  placeholder="Enter album name"
                  className="input border rounded-md p-2 text-gray-700 w-full"
                />
                {error && <p className="text-red-500 text-xs italic">{error}</p>}
                {success && <p className="text-green-500 text-xs italic">Album created successfully!</p>}
              </div>
              <div className="items-center px-4 py-3">
                <button className="create-btn bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                        onClick={handleCreateAlbum} disabled={isSubmitting}>
                  Create Album
                </button>
                <button className="cancel-btn ml-4 bg-gray-300 hover:bg-gray-400 text-black font-bold py-2 px-4 rounded"
                        onClick={() => setShowModal(false)}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CreateAlbum;
