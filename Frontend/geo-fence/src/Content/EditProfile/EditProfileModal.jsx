import { faCircleXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import api from "../../config/axios";
import Swal from "sweetalert2";

export default function EditProfileModal({
  isOpen,
  onClose,
  username,
  bio,
  image,
  name,
}) {
  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
      first_name: formData.get("username"),
      bio: formData.get("bio"),
      image: formData.get("image"),
      last_name: formData.get("name"),
    };
    fetchEditProfile(data);
  };

  const fetchEditProfile = async (data) => {
    try {
      const response = await api.post("auth/me?_method=PATCH", data);

      if (response.status === 200) {
        Swal.fire({
          icon: "success",
          title: "Profile updated successfully",
          timer: 1500,
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Failed to update profile",
          text: response.data?.message || "Something went wrong.",
        });
      }
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center z-50">
      <form
        className="bg-white rounded-lg p-6 w-2/5 relative"
        onSubmit={handleSubmit}
      >
        <button
          onClick={onClose}
          type="button"
          className="text-xl absolute top-5 right-8 text-gray-500 hover:text-gray-900 hover:scale-110"
        >
          <FontAwesomeIcon icon={faCircleXmark} />
        </button>
        <h2 className="text-2xl pb-3 font-bold mb-6 border-gray-600 border-b-2">
          Edit Profile
        </h2>

        {/* Profile photo */}
        <div className="flex items-center mb-6 border-gray-200 border-b-2 pb-5">
          <label className="w-1/3 text-gray-700">Profile Photo</label>
          <input
            type="file"
            name="image"
            className="p-2 w-1/2 border border-gray-300 rounded-md focus:outline-none"
            defaultValue={image}
          />
        </div>

        {/* Username */}
        <div className="flex items-center mb-6 border-gray-200 border-b-2 pb-5">
          <label className="w-1/3 text-gray-700">Username</label>
          <input
            type="text"
            name="username"
            className="p-2 w-1/2 border border-gray-300 rounded-md  focus:outline-none"
            defaultValue={username}
          />
        </div>

        {/* Name */}
        <div className="flex items-center mb-6 border-gray-200 border-b-2 pb-5">
          <label className="w-1/3 text-gray-700">Name</label>
          <input
            type="text"
            name="name"
            className="p-2 w-1/2 border border-gray-300 rounded-md  focus:outline-none"
            defaultValue={name}
          />
        </div>

        {/* Bio */}
        <div className="flex items-start mb-6 border-gray-200 border-b-2 pb-5">
          <label className="w-1/3 text-gray-700">Bio</label>
          <textarea
            name="bio"
            className="p-2 w-1/2 border border-gray-300 rounded-md  focus:outline-none resize-none"
            defaultValue={bio}
          />
        </div>

        {/* Buttons */}
        <div className="flex justify-end items-center mt-4 space-x-4">
          <button
            type="button"
            onClick={onClose}
            className="w-24  text-gray-600 border-2 py-1 rounded-md"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="w-24  text-gray-600 border-2 py-1 rounded-md hover:bg-gray-200 hover:scale-110 "
          >
            Save
          </button>
        </div>
      </form>
    </div>
  );
}
