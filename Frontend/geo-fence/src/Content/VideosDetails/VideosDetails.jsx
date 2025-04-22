import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../../config/axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";

import {
  faPlay,
  faCircleXmark,
  faVolumeUp,
  faVolumeDown,
  faVolumeMute,
  faCircleCheck,
  faMusic,
  faHeart,
  faShare,
  faComment,
  faGlobe,
  faEllipsis,
  faArrowUp,
  faArrowDown,
  faArrowCircleUp,
  faArrowCircleDown,
} from "@fortawesome/free-solid-svg-icons";
import {
  faFacebook,
  faInstagram,
  faTwitter,
  faYoutube,
} from "@fortawesome/free-brands-svg-icons";

export default function VideosDetails() {
  const videoId = useParams().videoId;
  const [video, setVideo] = useState(null);
  const [comments, setComments] = useState([]);
  const [isPlaying, setIsPlaying] = useState(true);
  const [volume, setVolume] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const videoRef = useRef(null);
  const navigate = useNavigate();

  const [comment, setComment] = useState("");
  const [userLogin, setUserLogin] = useState(null);

  useEffect(() => {
    const authData = JSON.parse(sessionStorage.getItem("authData"));
    if (authData) {
      setUserLogin(authData);
    }
  }, []);

  // Fetch video details
  const fetchVideo = async () => {
    try {
      const res = await api.get(`videos/${videoId}`);
      setVideo(res.data.data);
    } catch (error) {
      console.error(error);
    }
  };

  // Fetch comments
  const fetchComments = async () => {
    try {
      const res = await api.get(`videos/${videoId}/comments`);
      setComments(res.data.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchVideo();
  }, [videoId]);

  // Update current time as video plays
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  // Set duration when metadata is loaded
  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  // Handle play/pause
  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const handleClickVolume = () => {
    if (videoRef.current) {
      if (volume === 0) {
        videoRef.current.muted = false; // Bật âm thanh
        videoRef.current.volume = 1; // Đặt âm lượng cao nhất
        setVolume(1);
      } else {
        videoRef.current.muted = true; // Tắt âm thanh
        setVolume(0);
      }
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      videoRef.current.muted = newVolume === 0; // Tự động tắt tiếng nếu âm lượng bằng 0
    }
  };

  // Handle seeking (change current time via slider)
  const handleSeek = (e) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
    }
  };

  const handleClickComment = () => {
    fetchComments();
  };

  const fetchTymVideo = async (videoId, type) => {
    try {
      const res = await api.post(`videos/${videoId}/${type}`);
      const data = res.data.data;
      setVideo(data);
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
      setVideo({ ...video, user: data });
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

  const fetchTymComment = async (cmtId, type) => {
    try {
      const res = await api.post(`comments/${cmtId}/${type}`);
      const data = res.data.data;

      const updatedList = comments.map((item) => {
        if (item.id === cmtId) {
          return data;
        }
        return item;
      });
      setComments(updatedList);
    } catch (error) {
      console.error(error);
    }
  };

  const handleClickTymComment = (cmtId, isLike) => {
    if (isLike) {
      fetchTymComment(cmtId, "unlike");
    } else {
      fetchTymComment(cmtId, "like");
    }
  };

  const fetchCreateComment = async (comment) => {
    try {
      const res = await api.post(`videos/${videoId}/comments`, {
        comment,
      });
      const updatedList = [res.data.data, ...comments];
      setComments(updatedList);
    } catch (error) {
      console.error(error);
    }
  };

  const handlePost = async (e) => {
    e.preventDefault();
    fetchCreateComment(comment);
    setComment("");
  };

  const fetchDeleteComment = async (cmtId) => {
    try {
      await api.delete(`comments/${cmtId}`);
      const updatedList = comments.filter((item) => item.id !== cmtId);
      setComments(updatedList);
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteComment = async (cmtId) => {
    fetchDeleteComment(cmtId);
  };

  return (
    <>
      {video && (
        <div className="grid grid-cols-3 gap-4 h-screen ">
          <div
            style={{
              backgroundImage: `url(${video?.thumb_url})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              filter: "blur(7px) brightness(0.5)",
              opacity: 0.6,
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: -1,
            }}
          ></div>
          <div className="col-span-2 ">
            <FontAwesomeIcon
              icon={faCircleXmark}
              onClick={() => navigate(-1)}
              className=" text-2xl cursor-pointer px-5 pt-5 text-white hover:text-gray-300 hover:scale-110 "
            />
            <div className="flex h-[85vh]  items-center justify-center relative">
              <div className="absolute items-center gap-6 right-0 flex flex-col ">
                <FontAwesomeIcon
                  icon={faArrowCircleUp}
                  className="text-3xl text-white cursor-pointer"
                />
                <FontAwesomeIcon
                  icon={faArrowCircleDown}
                  className="text-3xl text-white cursor-pointer"
                />
              </div>
              {video && (
                <video
                  ref={videoRef}
                  src={video.file_url}
                  className=" max-h-[80vh] max-w-[65vw] object-cover"
                  autoPlay
                  loop
                  muted
                  onClick={handlePlayPause}
                  onTimeUpdate={handleTimeUpdate}
                  onLoadedMetadata={handleLoadedMetadata}
                />
              )}

              <button
                onClick={handlePlayPause}
                className="absolute inset-0 flex items-center justify-center bg-opacity-50 text-white text-4xl "
                style={{ display: isPlaying ? "none" : "flex" }}
              >
                <FontAwesomeIcon icon={faPlay} />
              </button>
            </div>

            <div className="px-56 py-5 bottom-5 left-5 right-5 flex items-center space-x-4 rounded-2xl">
              <input
                type="range"
                min="0"
                max={duration}
                step="0.1"
                value={currentTime}
                onChange={handleSeek}
                className="flex-grow"
              />

              <div className="flex items-center space-x-2">
                <FontAwesomeIcon
                  icon={
                    volume === 0
                      ? faVolumeMute
                      : volume < 0.5
                        ? faVolumeDown
                        : faVolumeUp
                  }
                  className="text-xl text-white cursor-pointer"
                  onClick={() => handleClickVolume()}
                />
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={volume}
                  onChange={handleVolumeChange}
                  className="w-20"
                />
              </div>
            </div>
          </div>

          <div className="col-span-1 bg-white p-4 rounded-lg overflow-y-scroll">
            <div className="bg-gray-100 p-4 rounded-lg">
              <div className="flex items-center justify-between ">
                <div className="flex items-center">
                  <div>
                    <img
                      src={video.user.avatar}
                      className="rounded-full w-14 h-14 object-cover "
                    />
                  </div>
                  <div className="px-4">
                    <div className="font-semibold text-lg">
                      {video.user.nickname}{" "}
                      {video.user.tick ? (
                        <FontAwesomeIcon
                          icon={faCircleCheck}
                          className="text-blue-500"
                        />
                      ) : (
                        ""
                      )}
                    </div>
                    <div className="text-sm">{video.published_at}</div>
                  </div>
                </div>
                <div className="">
                  <button
                    className="bg-red-500 p-2 w-36 font-bold text-white cursor-pointer rounded-sm hover:bg-red-700"
                    onClick={() =>
                      handleClickFollow(video.user.id, video.user.is_followed)
                    }
                  >
                    {video.user.is_followed ? "Following" : "Follow"}
                  </button>
                </div>
              </div>
              <div className="py-4">
                <div className=" text-base p-2">{video.description}</div>
                <div className="text-base">
                  <FontAwesomeIcon icon={faMusic} className="px-2 text-lg" />{" "}
                  {video.music || `Original sound - ${video.user.nickname}`}
                </div>
              </div>
            </div>
            <div>
              <div className="flex justify-between p-3">
                <div className="flex items-center justify-between text-lg gap-4">
                  <FontAwesomeIcon
                    icon={faHeart}
                    onClick={() => handleClickTym(video.id, video.is_liked)}
                    className={`cursor-pointer hover:scale-110 ${video.is_liked ? "text-red-500" : "text-black"}`}
                  />{" "}
                  {video.likes_count}
                  <FontAwesomeIcon
                    icon={faComment}
                    onClick={() => handleClickComment()}
                    className=" cursor-pointer hover:scale-110"
                  />{" "}
                  {video.comments_count}
                  <FontAwesomeIcon
                    icon={faShare}
                    className=" cursor-pointer hover:scale-110"
                  />{" "}
                  {video.shares_count}
                </div>
                <div className="flex items-center justify-between text-lg gap-4">
                  <Link to={video.user.website_url}>
                    <FontAwesomeIcon
                      icon={faGlobe}
                      className="text-gray-600  cursor-pointer hover:scale-110"
                    />
                  </Link>
                  <Link to={video.user.facebook_url}>
                    <FontAwesomeIcon
                      icon={faFacebook}
                      className="text-blue-600  cursor-pointer hover:scale-110"
                    />
                  </Link>
                  <Link to={video.user.instagram_url}>
                    <FontAwesomeIcon
                      icon={faInstagram}
                      className="text-purple-800  cursor-pointer hover:scale-110"
                    />
                  </Link>
                  <Link to={video.user.youtube_url}>
                    <FontAwesomeIcon
                      icon={faYoutube}
                      className="text-red-500  cursor-pointer hover:scale-110"
                    />
                  </Link>
                  <Link to={video.user.twitter_url}>
                    <FontAwesomeIcon
                      icon={faTwitter}
                      className="text-blue-600  cursor-pointer hover:scale-110"
                    />
                  </Link>
                </div>
              </div>
            </div>
            <div className="p-2 h-96 overflow-y-scroll bg-gray-100 rounded-sm border-gray-300 border-t-2 border-b-2">
              {(comments || []).map((comment) => (
                <div key={comment.id}>
                  <div className="flex items-center justify-between p-3">
                    <div className="flex items-center">
                      <div>
                        <img
                          src={comment.user.avatar}
                          className="rounded-full w-12 h-12 object-cover "
                        />
                      </div>
                      <div className="px-4">
                        <div className="font-semibold text-sm">
                          {comment.user.nickname}{" "}
                          {comment.user.tick ? (
                            <FontAwesomeIcon
                              icon={faCircleCheck}
                              className="text-blue-500"
                            />
                          ) : (
                            ""
                          )}
                          {userLogin?.id === comment.user.id && (
                            <Menu
                              as="div"
                              className="relative inline-block text-left pl-4"
                            >
                              <div>
                                <MenuButton className="inline-flex w-full justify-center gap-x-1.5 text-sm font-semibold text-gray-900 shadow-sm ">
                                  <FontAwesomeIcon icon={faEllipsis} />
                                </MenuButton>
                              </div>

                              <MenuItems
                                transition
                                className="absolute right-0 z-10 mt-2 w-24 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black/5 transition focus:outline-none data-[closed]:scale-95 data-[closed]:transform data-[closed]:opacity-0 data-[enter]:duration-100 data-[leave]:duration-75 data-[enter]:ease-out data-[leave]:ease-in"
                              >
                                <div className="py-1">
                                  <MenuItem>
                                    <div
                                      onClick={() =>
                                        handleDeleteComment(comment.id)
                                      }
                                      className="block cursor-pointer px-4 py-2 text-sm text-gray-700 data-[focus]:bg-gray-100 data-[focus]:text-gray-900 data-[focus]:outline-none"
                                    >
                                      Delete
                                    </div>
                                  </MenuItem>
                                </div>
                              </MenuItems>
                            </Menu>
                          )}
                        </div>
                        <div className="text-sm">{comment.comment}</div>
                        <div className="text-sm">{comment.created_at}</div>
                      </div>
                    </div>

                    <div className="flex flex-col items-center">
                      <FontAwesomeIcon
                        icon={faHeart}
                        onClick={() =>
                          handleClickTymComment(comment.id, comment.is_liked)
                        }
                        className={`cursor-pointer hover:scale-110 ${comment.is_liked ? "text-red-500" : "text-black"}`}
                      />
                      <div className="text-xs">{comment.likes_count}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <form
              onSubmit={handlePost}
              className="flex items-center space-x-2 mt-4"
            >
              <input
                type="text"
                placeholder="Comments..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="flex-grow bg-gray-100 p-3 rounded-lg decoration-none focus:outline-none"
                required
              />
              <button
                type="submit"
                className=" px-2 py-2 font-semibold text-lg cursor-pointer hover:bg-gray-200 rounded-lg"
              >
                Post
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
