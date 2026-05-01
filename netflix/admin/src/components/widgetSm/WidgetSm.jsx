import "./widgetSm.css";
import { Visibility } from "@material-ui/icons";
import { useState, useEffect } from "react";
import axios from "axios";

export default function WidgetSm() {
  const [newUsers, setNewUsers] = useState([]);

  useEffect(() => { 
    const getNewUsers = async () => {
      try {
        const token = JSON.parse(localStorage.getItem("user"))?.accessToken;
        const res = await axios.get("/api/users?new=true", {
          headers: {
            token: token ? `Bearer ${token}` : ""
          }
        });
        setNewUsers(res.data);
      } catch (err) {
        console.log(err);
      }
    };
    getNewUsers();
  }, []);

  return (
    <div className="widgetSm">
      <span className="widgetSmTitle">New Join Members</span>
      <ul className="widgetSmList">
        {newUsers.map((user) => (
          <li className="widgetSmListItem" key={user._id}>
            <img
              src={user.img || "https://www.google.com/imgres?q=netflix%20avatar%20pics&imgurl=https%3A%2F%2Fupload.wikimedia.org%2Fwikipedia%2Fcommons%2F0%2F0b%2FNetflix-avatar.png&imgrefurl=https%3A%2F%2Fcommons.wikimedia.org%2Fwiki%2FFile%3ANetflix-avatar.png&docid=giDSZ8hKlyMOLM&tbnid=nZOFHtwea_quaM&vet=12ahUKEwjetvGa3tKSAxWrV2wGHREcICsQnPAOegQIWBAB..i&w=320&h=320&hcb=2&ved=2ahUKEwjetvGa3tKSAxWrV2wGHREcICsQnPAOegQIWBAB"}
              alt=""
              className="widgetSmImg"
          />
          <div className="widgetSmUser">
            <span className="widgetSmUsername">{user.username}</span>
            <span className="widgetSmUserTitle">{user.title}</span>
          </div>
          <button className="widgetSmButton">
            <Visibility className="widgetSmIcon" />
            Display
          </button>
        </li>
        ))}
      </ul>
    </div>
  );
}
