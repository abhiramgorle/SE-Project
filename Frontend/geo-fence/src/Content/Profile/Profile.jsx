import Video from "./Videos";
import ProfileHeader from "./ProfileHeader";
import Favorites from "./Favorites";
import Reposts from "./Reposts";
import Liked from "./Liked";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faGripVertical,
  faHeartCircleCheck,
  faBookmark,
  faRepeat,
} from "@fortawesome/free-solid-svg-icons";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import api from "../../config/axios";

export default function Profile() {
  const [tab, setTab] = useState("videos");
  const { username } = useParams();
  const [user, setUser] = useState({});
  const [videos, setVideos] = useState([]);

  const fetchUser = async () => {
    const response = await api.get(`users/@${username}`);
    const data = response.data.data;
    setUser(data);
    setVideos(data.videos);
  };

  useEffect(() => {
    fetchUser();
  }, [username]);

  return (
    <div>
      <ProfileHeader user={user} />
      <div className="p-5">
        <div className="flex gap-7 border-b font-semibold text-xl text-center cursor-pointer">
          <div
            className={
              tab === "videos"
                ? " p-2 border-b-4 border-black"
                : "text-gray-400 p-2"
            }
            onClick={() => setTab("videos")}
          >
            <FontAwesomeIcon icon={faGripVertical} className="pr-2" />
            Videos
          </div>

          <div
            className={
              tab === "reposts"
                ? " p-2 border-b-4 border-black"
                : "text-gray-400 p-2"
            }
            onClick={() => setTab("reposts")}
          >
            <FontAwesomeIcon icon={faRepeat} className="pr-2" />
            Reposts
          </div>

          <div
            className={
              tab === "favorites"
                ? " p-2 border-b-4 border-black"
                : "text-gray-400 p-2"
            }
            onClick={() => setTab("favorites")}
          >
            <FontAwesomeIcon icon={faBookmark} className="pr-2" />
            Favorites
          </div>

          <div
            className={
              tab === "liked"
                ? " p-2 border-b-4 border-black"
                : "text-gray-400 p-2"
            }
            onClick={() => setTab("liked")}
          >
            <FontAwesomeIcon icon={faHeartCircleCheck} className="pr-2" />
            Liked
          </div>
        </div>
      </div>
      {tab === "videos" && <Video videos={videos} />}
      {tab === "favorites" && <Favorites />}
      {tab === "reposts" && <Reposts />}
      {tab === "liked" && <Liked />}
    </div>
  );
}
