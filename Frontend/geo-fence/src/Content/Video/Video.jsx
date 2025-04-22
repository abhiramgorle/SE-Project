import React, { useEffect, useState, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHeart,
  faComment,
  faBookmark,
  faShare,
  faVolumeHigh,
  faVolumeMute,
  faVolumeLow,
  faPause,
  faPlay,
  faCheck,
  faPlus,
} from "@fortawesome/free-solid-svg-icons";

import dayjs from "dayjs";
import api from "../../config/axios";
import { useNavigate } from "react-router-dom";

export default function Video({ type }) {
  const [listOfVideos, setListOfVideos] = useState([]);
  const formatDay = (date) => dayjs(date).format("DD-MM");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const scrollableContainerRef = useRef(null);

  const [hoveredVideoId, setHoveredVideoId] = useState(null);
  const [volume, setVolume] = useState(0.5);
  const [playingVideoId, setPlayingVideoId] = useState(null);
  const observerRef = useRef(null);

  const navigate = useNavigate();

  const [video, setVideo] = useState(null);

  const fetchVideos = async () => {
    try {
      const res = await api.get(`videos?type=${type}&page=${page}`);
      const data = res.data.data;
      setListOfVideos((prevList) => {
        const updatedList = [...prevList, ...data];
        const uniqueVideo = updatedList.filter(
          (value, index, self) =>
            index === self.findIndex((t) => t.id === value.id)
        );

        return uniqueVideo;
      });
      setPagination(res.data.meta.pagination);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, [page]);

  const handleVideoPlayPause = (videoId) => {
    const videoElement = document.getElementById(`video-${videoId}`);
    if (videoElement) {
      if (playingVideoId === videoId) {
        videoElement.pause();
        setPlayingVideoId(null);
      } else {
        if (playingVideoId) {
          const activeVideo = document.getElementById(
            `video-${playingVideoId}`
          );
          if (activeVideo) activeVideo.pause();
        }
        videoElement.play();
        setPlayingVideoId(videoId);
      }
    }
  };

  const handleVolumeChange = (e, videoId) => {
    const volumeValue = parseFloat(e.target.value);
    setVolume(volumeValue);
    const videoElement = document.getElementById(`video-${videoId}`);
    if (videoElement) {
      videoElement.volume = volumeValue;
    }
  };

  const handleScroll = () => {
    const container = scrollableContainerRef.current;
    if (!container) return;
    const { scrollTop, scrollHeight, clientHeight } = container;

    if (scrollTop + clientHeight >= scrollHeight - 5) {
      if (page < pagination.total_pages) {
        setPage((prev) => prev + 1);
      }
    }
  };

  useEffect(() => {
    const container = scrollableContainerRef.current;

    const onScroll = () => handleScroll();
    if (container) {
      container.addEventListener("scroll", onScroll);
    }
    if (listOfVideos.length > 0) {
      handleScroll();
    }
    return () => {
      if (container) {
        container.removeEventListener("scroll", onScroll);
      }
    };
  }, [listOfVideos]);

  const fetchTymVideo = async (videoId, type) => {
    try {
      const res = await api.post(`videos/${videoId}/${type}`);
      const data = res.data.data;
      const updatedList = listOfVideos.map((item) => {
        if (item.id === videoId) {
          return data;
        }
        return item;
      });
      setListOfVideos(updatedList);
    } catch (error) {
      console.error(error);
    }
  };

  const handleClickTym = (videoId, isLike) => {
    if (isLike) {
      fetchTymVideo(videoId, "unlike");
    } else {
      fetchTymVideo(videoId, "like");
    }
  };

  const fetchFollowUser = async (userId, type) => {
    try {
      const res = await api.post(`users/${userId}/${type}`);
      const data = res.data.data;
      const updatedList = listOfVideos.map((item) => {
        if (item.user.id === userId) {
          item.user = data;
        }
        return item;
      });
      setListOfVideos(updatedList);
    } catch (error) {
      console.error(error);
    }
  };

  const handleClickFollow = async (userId, isFollowed) => {
    if (isFollowed) {
      fetchFollowUser(userId, "unfollow");
    } else {
      fetchFollowUser(userId, "follow");
    }
  };

  const handelComment = (videoId) => {
    navigate(`/all/${videoId}`);
  };

  return (
    <div
      ref={scrollableContainerRef}
      className="overflow-y-scroll"
      style={{ height: "88vh" }}
    >
      {(listOfVideos || []).map((item) => (
        <div
          key={item.id}
          className="grid grid-cols-1 h-[88vh]"
          onMouseEnter={() => setHoveredVideoId(item.id)}
          onMouseLeave={() => setHoveredVideoId(null)}
        >
          <div className="flex justify-center items-center">
            <div className="relative flex flex-col items-center justify-end py-5 w-[400px] h-[600px] ">
              <video
                className="absolute inset-0 object-cover w-full h-full z-0 rounded-lg"
                id={`video-${item.id}`}
                src={item.file_url}
                data-id={item.id}
                loop
                onClick={() => handleVideoPlayPause(item.id)}
              />{" "}
              {hoveredVideoId === item.id && (
                <div className="absolute top-3 left-3 z-30 flex items-center bg-black bg-opacity-50 p-2 rounded-full">
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={volume}
                    onChange={(e) => handleVolumeChange(e, item.id)}
                    className="w-24 mx-2"
                  />
                  <FontAwesomeIcon
                    icon={
                      volume === 0
                        ? faVolumeMute
                        : volume < 0.5
                          ? faVolumeLow
                          : faVolumeHigh
                    }
                    className="text-white"
                  />
                </div>
              )}{" "}
              <div className="absolute top-3 right-3 z-30">
                <FontAwesomeIcon
                  icon={playingVideoId === item.id ? faPause : faPlay}
                  className="text-white bg-black bg-opacity-50 p-3 rounded-full cursor-pointer"
                  onClick={() => handleVideoPlayPause(item.id)}
                />
              </div>
              <div className="relative z-20 flex flex-col items-start w-full px-4">
                <h2 className="font-medium text-white text-left">
                  {item.user.nickname}
                  {item.user.tick && (
                    <FontAwesomeIcon
                      icon={faCircleCheck}
                      className="text-blue-400 ml-2"
                    />
                  )}
                  <span> . {formatDay(item.published_at)}</span>
                </h2>
                <h4 className="text-gray-300 text-left mt-2">
                  {item.description}
                </h4>
                <h4 className="text-gray-300 text-left mt-2">{item.music}</h4>
              </div>
            </div>
            <div className="flex flex-col items-center h-full justify-end py-10 px-5">
              <div className="relative flex flex-col items-center mb-4">
                <img
                  className="w-16 h-16 object-cover rounded-full"
                  src={item.user.avatar}
                  alt="Avatar"
                />

                <FontAwesomeIcon
                  onClick={() =>
                    handleClickFollow(item.user.id, item.user.is_followed)
                  }
                  icon={item.user.is_followed ? faCheck : faPlus}
                  className="text-red-500 bg-gray-100 rounded-full p-1  text-base absolute bottom-0 cursor-pointer "
                  style={{ transform: "translateY(10px)" }}
                />
              </div>
              <FontAwesomeIcon
                icon={faHeart}
                onClick={() => handleClickTym(item.id, item.is_liked)}
                className={` text-2xl bg-gray-100 rounded-full p-3 mt-2 cursor-pointer hover:scale-110 ${item.is_liked ? "text-red-500" : "text-black"}`}
              />
              {item.likes_count}
              <FontAwesomeIcon
                icon={faComment}
                className="text-black text-2xl bg-gray-100 rounded-full p-3 mt-2 cursor-pointer hover:scale-110"
                onClick={() => {
                  handelComment(item.id);
                }}
              />
              {item.comments_count}
              <FontAwesomeIcon
                icon={faBookmark}
                className="text-black text-2xl bg-gray-100 rounded-full p-3 mt-2 cursor-pointer hover:scale-110"
              />
              {item.shares_count}
              <FontAwesomeIcon
                icon={faShare}
                className="text-black text-2xl bg-gray-100 rounded-full p-3 mt-2 cursor-pointer hover:scale-110"
              />
              {item.shares_count}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
