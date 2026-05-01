import "./sidebar.css";
import {
  LineStyle,
  Timeline,
  TrendingUp,
  PermIdentity,
  AttachMoney,
  BarChart,
  MailOutline,
  DynamicFeed,
  ChatBubbleOutline,
  WorkOutline,
  Report,
  PlayCircleOutline,
  AddCircleOutline,
} from "@material-ui/icons";
import { Link } from "react-router-dom";

export default function Sidebar() {
  return (
    <div className="sidebar">
      <div className="sidebarWrapper">
        <div className="sidebarMenu">
          <h3 className="sidebarTitle">Dashboard</h3>
          <ul className="sidebarList">
            <Link to="/" className="link">
              <li className="sidebarListItem active">
                <LineStyle className="sidebarIcon" />
                Home
              </li>
            </Link>
            <Link to="/analytics" className="link">
              <li className="sidebarListItem">
                <Timeline className="sidebarIcon" />
                Analytics
              </li>
            </Link>
            <Link to="/sales" className="link">
              <li className="sidebarListItem">
                <TrendingUp className="sidebarIcon" />
                Sales
              </li>
            </Link>
          </ul>
        </div>
        <div className="sidebarMenu">
          <h3 className="sidebarTitle">Quick Menu</h3>
          <ul className="sidebarList">
            <Link to="/users" className="link">
              <li className="sidebarListItem">
                <PermIdentity className="sidebarIcon" />
                Users
              </li>
            </Link>
            <Link to="/movies" className="link">
              <li className="sidebarListItem">
                <PlayCircleOutline className="sidebarIcon" />
                Movies
              </li>
            </Link>
            <Link to="/newproduct" className="link">
              <li className="sidebarListItem">
                <AddCircleOutline className="sidebarIcon" />
                New Movie
              </li>
            </Link>
            <Link to="/lists" className="link">
              <li className="sidebarListItem">
                <DynamicFeed className="sidebarIcon" />
                Lists
              </li>
            </Link>
            <Link to="/newlist" className="link">
              <li className="sidebarListItem">
                <AddCircleOutline className="sidebarIcon" />
                New List
              </li>
            </Link>
            <Link to="/transactions" className="link">
              <li className="sidebarListItem">
                <AttachMoney className="sidebarIcon" />
                Transactions
              </li>
            </Link>
            <Link to="/reports" className="link">
              <li className="sidebarListItem">
                <BarChart className="sidebarIcon" />
                Reports
              </li>
            </Link>
          </ul>
        </div>
        <div className="sidebarMenu">
          <h3 className="sidebarTitle">Notifications</h3>
          <ul className="sidebarList">
            <Link to="/mail" className="link">
              <li className="sidebarListItem">
                <MailOutline className="sidebarIcon" />
                Mail
              </li>
            </Link>
            <Link to="/feedback" className="link">
              <li className="sidebarListItem">
                <DynamicFeed className="sidebarIcon" />
                Feedback
              </li>
            </Link>
            <Link to="/messages" className="link">
              <li className="sidebarListItem">
                <ChatBubbleOutline className="sidebarIcon" />
                Messages
              </li>
            </Link>
          </ul>
        </div>
        <div className="sidebarMenu">
          <h3 className="sidebarTitle">Staff</h3>
          <ul className="sidebarList">
            <Link to="/manage" className="link">
              <li className="sidebarListItem">
                <WorkOutline className="sidebarIcon" />
                Manage
              </li>
            </Link>
            <Link to="/staff/analytics" className="link">
              <li className="sidebarListItem">
                <Timeline className="sidebarIcon" />
                Analytics
              </li>
            </Link>
            <Link to="/staff/reports" className="link">
              <li className="sidebarListItem">
                <Report className="sidebarIcon" />
                Reports
              </li>
            </Link>
          </ul>
        </div>
      </div>
    </div>
  );
}
