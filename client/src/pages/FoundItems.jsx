import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  FaArrowLeft,
  FaBoxOpen,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaTag,
  FaUserCircle,
} from "react-icons/fa"; 

import { CheckCircle } from "lucide-react";

const FoundItems = () => {
  const [foundItems, setFoundItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchFoundItems = async () => {
      setError("");
      setLoading(true);

      const config = {
        withCredentials: true,
      };

      try {
       const response = await axios.get(
       `${import.meta.env.VITE_BACKEND_URL}/apis/lost-and-found/my-items/my-found-items`,
        config
       );

        setFoundItems(response.data.foundItems);
      } catch (err) {
        console.error("Error fetching found items:", err);
        if (
          err.response &&
          (err.response.status === 401 || err.response.status === 403)
        ) {
          setError(
            "Session expired or not authenticated. Please log in again."
          );
        } else {
          setError(
            err.response?.data?.message ||
              "Failed to fetch found items. Please try again."
          );
        }
      } finally {
        setLoading(false);
      }
    };

    fetchFoundItems();
  }, []);

  return (
    <div className="min-h-screen bg-gray-200 p-4 sm:p-6 relative">
      <a
        href="/"
        className="absolute top-4 left-4 sm:top-6 sm:left-6 flex items-center text-blue-700 hover:text-blue-900 transition duration-200 font-semibold z-10"
      >
        <FaArrowLeft className="mr-2" /> Back to Home
      </a>

      <div className="max-w-4xl mx-auto mt-12 bg-white rounded-lg shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-green-600 to-green-800 p-6 text-white text-center">
          <h1 className="text-3xl font-extrabold tracking-tight">
            Found Items
          </h1>
          <p className="mt-1 text-green-200">
            Items you have reported as found.
          </p>
        </div>

        <div className="p-6">
          {loading && (
            <div className="text-center text-green-600 font-medium py-8">
              Loading your found items...
            </div>
          )}

          {error && (
            <div className="text-red-600 bg-red-100 border border-red-200 p-3 rounded-md text-center my-4">
              {error}
            </div>
          )}

          {!loading && !error && foundItems.length === 0 && (
            <div className="text-center text-gray-600 py-8">
              <FaBoxOpen className="mx-auto text-6xl mb-4 text-gray-400" />
              <p className="text-xl font-semibold">
                No found items reported yet.
              </p>
              <p className="mt-2">Start by reporting an item you've found!</p>
            </div>
          )}

          {!loading && !error && foundItems.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {foundItems.map((item) => (
                <div
                  key={item._id}
                  className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200"
                >
                  {}
                  {console.log('Item ID:', item._id, 'Object Name:', item.objectName, 'Image URL:', item.objectImage)} 

                  { item.objectImage ? (
                    <img
                      src={item.objectImage}
                      alt={item.objectName || "Found Item"}
                      className="w-full h-48 object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src =
                          "https://placehold.co/400x300/E0E0E0/6C757D?text=No+Image";
                      }}
                    />
                  ) : 
                  (
                    <div className="w-full h-48 bg-gray-300 flex items-center justify-center text-gray-500">
                      <FaBoxOpen className="text-5xl" />
                      <span className="ml-2">No Image Available</span>
                    </div>
                  )}
                  <div className="p-4 space-y-2">
                    <h3 className="text-xl font-bold text-gray-800 truncate">
                      {item.objectName || "Unnamed Item"}
                    </h3>
                    <p className="text-gray-600 text-sm line-clamp-2">
                      {item.objectDescription || "No description provided."}
                    </p>

                    <div className="text-gray-700 text-sm space-y-1">
                      <p className="flex items-center gap-2">
                        <CheckCircle size={16} className="text-green-500" />
                        <span>
                          <strong>Status: </strong>

                          {item.status}
                        </span>
                      </p>
                      <p className="flex items-center">
                        <FaMapMarkerAlt className="mr-2 text-blue-500" />{" "}
                        <strong>Location:</strong> {item.locationFound || "N/A"}
                      </p>
                      <p className="flex items-center">
                        <FaCalendarAlt className="mr-2 text-purple-500" />{" "}
                        <strong>Date:</strong>{" "}
                        {item.dateFound
                          ? new Date(item.dateFound).toLocaleDateString()
                          : "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FoundItems;
