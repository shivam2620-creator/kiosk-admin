import { useState } from "react";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import toast from "react-hot-toast";
import app from "../../Utils/FirebastConfig";
import "./style.css";

const storage = getStorage(app);
const MAX_FILE_SIZE = 400 * 1024; // 400 KB

const LogoUploader = ({ onUpload }) => {
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState(null);

  const uploadImageToFirebase = async (file) => {
    const storageRef = ref(storage, `logos/${file.name}-${Date.now()}`);
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      toast.error("File too large! Max size allowed is 400KB.");
      e.target.value = "";
      return;
    }

    const localPreview = URL.createObjectURL(file);
    setPreview(localPreview);
    setUploadedUrl(null); // reset any previous uploaded logo
    onUpload(""); // clear parent’s URL if replacing

    try {
      setUploading(true);

      const timeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Upload timeout")), 15000)
      );

      const downloadURL = await Promise.race([uploadImageToFirebase(file), timeout]);
      setUploadedUrl(downloadURL);
      toast.success("Logo uploaded successfully!");
      onUpload(downloadURL);
    } catch (error) {
      console.error("Error uploading logo:", error);
      toast.error("Failed to upload image. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = () => {
    if (uploading) {
      toast("Upload canceled — you can select a new file now.");
    } else {
      toast("Logo removed.");
    }
    setPreview(null);
    setUploadedUrl(null);
    onUpload(""); // tell parent component that logo was removed
  };

  return (
    <div className="logo-uploader">
      <label>Company Logo:</label>
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        disabled={uploading} // prevent selecting while uploading
      />

      {uploading && (
        <p style={{ color: "#ECAA20", fontWeight: 500 }}>Uploading...</p>
      )}

      {preview && (
        <div className="logo-preview-wrapper">
          <img
            src={preview}
            alt="Logo Preview"
            className="logo-preview-img"
          />
          <button
            className="delete-logo-btn"
            onClick={handleDelete}
            disabled={uploading}
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
};

export default LogoUploader;
