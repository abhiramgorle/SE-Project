import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlay } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";

export default function Videos({ videos }) {
  const navigate = useNavigate();
  const handleDetail = (videoId) => {
    navigate(`/all/${videoId}`);
  };

  return (
    <div className="p-3">
      <div className="grid grid-cols-4 gap-4">
        {videos.map((video) => (
          <div
            key={video.id}
            className="relative group"
            onClick={() => {
              handleDetail(video.id);
            }}
          >
            <video
              src={video.file_url}
              className="w-full h-80 object-cover rounded-lg"
              autoPlay
              muted
            ></video>
            <div className="absolute inset-0 flex items-end justify-start opacity-0 group-hover:opacity-100 transition-opacity">
              <FontAwesomeIcon
                icon={faPlay}
                className="text-white p-3 cursor-pointer"
              />
              <h1 className="text-white p-2 cursor-pointer">
                {video.views_count}
              </h1>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
