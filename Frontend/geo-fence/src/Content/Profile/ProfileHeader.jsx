import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheckCircle,
  faGear,
  faShare,
  faLock,
} from "@fortawesome/free-solid-svg-icons";
import api from "../../config/axios";
import EditProfileModal from "../EditProfile/EditProfileModal";

export default function ProfileHeader(user) {
  const [userInfo, setUserInfo] = useState(user.user);
  const [userLogin, setUserLogin] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const authData = JSON.parse(sessionStorage.getItem("authData"));
    if (authData) {
      setUserLogin(authData);
    }
  }, []);

  useEffect(() => {
    if (user.user) {
      setUserInfo(user.user);
    }
  }, [user]);

  const fetchFollowUser = async (userId, type) => {
    try {
      const res = await api.post(`users/${userId}/${type}`);
      const data = res.data.data;
      setUserInfo(data);
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

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div>
      <div className="px-5 flex">
        <div>
          <img
            src={userInfo.avatar}
            alt="avatar"
            className="rounded-full w-52 h-52 p-3"
          />
        </div>
        <div className="py-5">
          <h1 className="font-bold text-xl  p-3">
            {userInfo.first_name} {userInfo.last_name}
            {userInfo.tick && (
              <FontAwesomeIcon
                icon={faCheckCircle}
                className="text-2xl text-blue-500"
              />
            )}
          </h1>
          <div className="flex px-3 py-1 gap-3">
            {userLogin && userLogin.id === userInfo.id ? (
              <button
                className="bg-red-500  w-36 font-semibold text-white p-2 rounded-md  hover:bg-red-700 hover:scale-110"
                onClick={handleOpenModal}
              >
                Edit profile
              </button>
            ) : (
              <button
                className="bg-red-500 w-36 font-semibold text-white p-2 rounded-md hover:bg-red-700 hover:scale-110 "
                onClick={() =>
                  handleClickFollow(userInfo.id, userInfo.is_followed)
                }
              >
                {userInfo.is_followed ? "Following" : "Follow"}
              </button>
            )}
            <button className="bg-gray-200 font-semibold p-2 rounded-md">
              Promote Post
            </button>
            <button className="bg-gray-200 px-4 rounded-md">
              <FontAwesomeIcon icon={faGear} />
            </button>
            <button className="bg-gray-200 px-4 rounded-md">
              <FontAwesomeIcon icon={faShare} />
            </button>
          </div>
          <div className="flex p-3 gap-3">
            <h1 className="font-medium text-base">
              {userInfo.followings_count || 0}
              <span className="text-gray-500"> Following</span>
            </h1>
            <h1 className="font-medium text-base">
              {userInfo.followers_count || 0}{" "}
              <span className="text-gray-500">Followers</span>
            </h1>
            <h1 className="font-medium text-base">
              {userInfo.likes_count || 0}{" "}
              <span className="text-gray-500">Liked</span>
            </h1>
          </div>
          <div className="p-2">{userInfo.bio}</div>
        </div>
      </div>
      <EditProfileModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        username={userInfo.first_name}
        bio={userInfo.bio}
        name={userInfo.last_name}
      />
    </div>
  );
}
