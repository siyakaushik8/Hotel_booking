import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Footer from "../components/Footer";
import ListingCard from "../components/ListingCard";
import Loader from "../components/Loader";
import Navbar from "../components/Navbar";
import { setTripList } from "../redux/state";
import "../styles/List.scss";

const TripList = () => {
  const [loading, setLoading] = useState(true);
  const userId = useSelector((state) => state.user?._id);
  const tripList = useSelector((state) => state.user?.tripList || []);

  const dispatch = useDispatch();

  const getTripList = async () => {
    try {
      if (!userId) {
        console.error("User ID is missing.");
        setLoading(false);
        return;
      }

      const response = await fetch(`http://localhost:3001/users/${userId}/trips`, {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      const data = await response.json();
      dispatch(setTripList(data));
    } catch (err) {
      console.error("Fetch Trip List failed:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTrip = async (tripId) => {
    try {
      const response = await fetch(`http://localhost:3001/users/${userId}/trips/${tripId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        console.log("Trip deleted successfully.");
        dispatch(setTripList(tripList.filter((trip) => trip?._id !== tripId)));
      } else {
        const errorData = await response.json();
        console.error("Failed to delete trip:", errorData.message);
      }
    } catch (err) {
      console.error("Delete Trip Failed:", err.message);
    }
  };

  useEffect(() => {
    getTripList();
  }, []);

  return loading ? (
    <Loader />
  ) : (
    <>
      <Navbar />
      <h1 className="title-list">Your Trip List</h1>
      <div className="list">
        {tripList.length === 0 ? (
          <p>No trips available.</p>
        ) : (
          tripList
            .filter((trip) => trip && trip._id && trip.listingId && trip.hostId)
            .map(({ _id, listingId, hostId, startDate, endDate, totalPrice, booking = true }) => (
              <div key={_id} className="trip-card">
                <ListingCard
                  listingId={listingId?._id}
                  creator={hostId?._id}
                  listingPhotoPaths={listingId?.listingPhotoPaths}
                  city={listingId?.city}
                  province={listingId?.province}
                  country={listingId?.country}
                  category={listingId?.category}
                  startDate={startDate}
                  endDate={endDate}
                  totalPrice={totalPrice}
                  booking={booking}
                />
                <button className="delete-button" onClick={() => handleDeleteTrip(_id)}>
                  Delete
                </button>
              </div>
            ))
        )}
      </div>
      <Footer />
    </>
  );
};

export default TripList;