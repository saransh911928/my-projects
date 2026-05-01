import Chart from "../../components/chart/Chart";
import FeaturedInfo from "../../components/featuredInfo/FeaturedInfo";
import "./home.css";
import WidgetSm from "../../components/widgetSm/WidgetSm";
import WidgetLg from "../../components/widgetLg/WidgetLg";
import { useState, useEffect } from "react";
import axios from "axios";
import { useMemo } from "react";

export default function Home() {
  const MONTHS = useMemo(() => [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec"
  ], 
  []);


  const [userStats, setUserStats] = useState([]);

  useEffect(() => {
    const getStats = async () => {
      try {
      const token = JSON.parse(localStorage.getItem("user"))?.accessToken;
      const res = await axios.get("/api/users/stats", {
        headers: {
          token: token ? `Bearer ${token}` : ""
        }
      });
      // 1st and original way to sort and map the data but not recommended
      //  const statsList = res.data.sort(function (a, b) {
      //     return a._id - b._id;
      //   });
      //   statsList.map((item) =>
      //     setUserStats((prev) => [
      //       ...prev,
      //       { name: MONTHS[item._id - 1], "New User": item.total },
      //     ])
      //   );

      // 2nd way with is fine but using both stats and statsList is not recommended
      // const statsList = res.data.sort((a, b) => a._id - b._id);
      // const stats = statsList.map((item) => ({
      //   name: MONTHS[item._id - 1],
      //   "New User": item.total
      // }));

      const statsList = res.data
        .sort((a, b) => a._id - b._id)
        .map((item) => ({
          name: MONTHS[item._id - 1],
          "New User": item.total
  }));
      setUserStats(statsList);
    } catch (err) {
      console.log(err);
    }
    };
    getStats();
  }, [MONTHS]);

  

  return (
    <div className="home">
      <FeaturedInfo />
      <Chart data={userStats} title="User Analytics" grid dataKey="New User"/>
      <div className="homeWidgets">
        <WidgetSm/>
        <WidgetLg/>
      </div>
    </div>
  );
}
