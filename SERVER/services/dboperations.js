// this file will export all the Database related functions ...
const { db, admin } = require("../config/firebase");

/////////////////////////////////////////
// START OF USER RELEATED FUNCTIONS
/////////////////////////////////////////

// functiojn to get all the users ...
const getAllUsers = async (req, res) => {
  try {
    const usersSnapshot = await db.collection("USERS").get();
    const users = usersSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error fetching users",
      error: error.message,
    });
  }
};

const generateOtp = async (req, res) => {
  try {
    const { phoneNumber } = req.body;
    const otp = Math.floor(1000 + Math.random() * 9000);
    console.log("Generated OTP: ", otp);

    if (!phoneNumber) {
      return res.status(400).json({
        success: false,
        message: "Phone number is required",
      });
    }

    if (phoneNumber && otp) {
      const response = await fetch("https://www.fast2sms.com/dev/bulkV2", {
        method: "POST",
        headers: {
          authorization: process.env.FAST2SMS_API_KEY,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          variables_values: otp,
          route: "otp",
          numbers: phoneNumber,
        }),
      });
      const data = await response.json();
      console.log("SMS API Response:", data);
    }

    res.status(200).json({
      success: true,
      data: { OTP: otp },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error generating OTP",
      error: error.message,
    });
  }
};

// funtion to register new users ...
const registerUsers = async (req, res) => {
  try {
    const userData = req.body;
    console.log(userData);

    const userRef = await db.collection("USERS").add(userData);

    // retriving the user data to send as response ...
    const newUser = await userRef.get();
    const responseData = { id: newUser.id, ...newUser.data() };
    console.log("After updating the DB: ", responseData);

    res.status(201).json({ success: true, data: responseData });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Failed to add user" });
  }
};

// function to update a users profile
const updateProfile = async (req, res) => {
  try {
    const { id, ...data } = req.body;

    if (!id) {
      return res.status(400).json({ message: "docId is required" });
    }

    const userReference = db.collection("USERS").doc(id);
    await userReference.update(data);
    const userDoc = await userReference.get();
    const userData = { id: userDoc.id, ...userDoc.data() };
    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: userData,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// function to check if the exists in the database
const checkUserExists = async (req, res) => {
  try {
    const { phone } = req.query; // Use req.query instead of req.body

    if (!phone) {
      return res.status(400).json({ success: false, message: "Missing phone" });
    }

    const usersRef = db.collection("USERS");
    const querySnapshot = await usersRef.where("phone", "==", phone).get();
    console.log("results", querySnapshot);

    if (!querySnapshot.empty) {
      const userDoc = querySnapshot.docs[0];
      const userData = { id: userDoc.id, ...userDoc.data() };
      console.log("True");

      return res
        .status(200)
        .json({ success: true, isExists: true, data: userData });
    } else {
      return res.status(200).json({ success: true, isExists: false });
    }
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "Error checking user existence" });
  }
};

// function to get a user by ID
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const userDoc = await db.collection("USERS").doc(id).get();

    if (!userDoc.exists) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const userData = {
      id: userDoc.id,
      ...userDoc.data(),
    };

    res.status(200).json({
      success: true,
      data: userData,
    });
  } catch (error) {
    console.error("Error getting user:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

///////////////////////////////////
// START OF CARS RELATED FUNCTIONS
///////////////////////////////////

// fetchs all cars from CARS collection ...
const getAllCars = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const startAt = (page - 1) * limit;

    const query = db.collection("CARS");

    // Get total count
    const totalSnapshot = await query.count().get();
    const total = totalSnapshot.data().count;

    // Get paginated results
    const snapshot = await query
      .orderBy("postedDate", "desc")
      .limit(limit)
      .offset(startAt)
      .get();

    if (snapshot.empty) {
      return res.status(200).json({
        success: true,
        data: [],
        pagination: {
          total: 0,
          currentPage: page,
          totalPages: 0,
          hasMore: false,
        },
      });
    }

    const cars = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      success: true,
      data: cars,
      pagination: {
        total,
        currentPage: page,
        totalPages,
        hasMore: page < totalPages,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error fetching cars",
      error: error.message,
    });
  }
};

// function to get all the cars waiting for approval ...
const getAllPendingCars = async (req, res) => {
  try {
    const pendingCarsSnapShot = await db
      .collection("CARS")
      .where("carStatus", "==", "pending")
      .get();

    if (pendingCarsSnapShot.empty) {
      return res.status(200).json({
        success: true,
        data: [],
        message: "No Cars Pending for Approval",
      });
    }

    const pendingCars = pendingCarsSnapShot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.status(200).json({ success: true, data: pendingCars });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error fetching pending cars",
      error: error.message,
    });
  }
};

// function to filter cars and return based on the filter parameters
const getFilteredCars = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const startAt = (page - 1) * limit;
    const searchTerm = req.query.searchTerm?.toLowerCase();

    let carsQuery = db.collection("CARS");
    const filters = [];

    // Combine all filters (from body and query params)
    if (req.body.filters && Array.isArray(req.body.filters)) {
      filters.push(...req.body.filters);
    }

    // Add query params filters
    if (req.query.brand) {
      filters.push({
        field: "carBrand",
        condition: "==",
        value: req.query.brand,
      });
    }
    if (req.query.model) {
      filters.push({
        field: "carModel",
        condition: "==",
        value: req.query.model,
      });
    }
    if (req.query.year) {
      filters.push({
        field: "modelYear",
        condition: "==",
        value: parseInt(req.query.year),
      });
    }
    if (req.query.fuelType) {
      filters.push({
        field: "fuelType",
        condition: "==",
        value: req.query.fuelType,
      });
    }
    if (req.query.status) {
      filters.push({
        field: "carStatus",
        condition: "==",
        value: req.query.status,
      });
    }

    // Validate all filters first
    for (const filter of filters) {
      if (!filter.field || !filter.condition || filter.value === undefined) {
        return res.status(400).json({
          error:
            "Each filter should contain valid 'field', 'condition', and 'value'",
        });
      }
    }

    // Handle search with combined query
    if (searchTerm) {
      // Create search index field if it doesn't exist
      const snapshot = await carsQuery.get();

      // Filter results that match search term in brand or model
      let searchResults = snapshot.docs.filter((doc) => {
        const data = doc.data();
        const brand = data.carBrand.toLowerCase();
        const model = data.carModel.toLowerCase();
        return brand.includes(searchTerm) || model.includes(searchTerm);
      });

      // Apply other filters to search results
      searchResults = searchResults.filter((doc) => {
        const data = doc.data();
        return filters.every((filter) => {
          const value = data[filter.field];
          const filterValue =
            filter.field === "modelYear" ||
            filter.field === "exceptedPrice" ||
            filter.field === "km"
              ? Number(filter.value)
              : filter.value;

          switch (filter.condition) {
            case "==":
              return value === filterValue;
            case ">=":
              return value >= filterValue;
            case "<=":
              return value <= filterValue;
            case "in":
              return Array.isArray(filterValue) && filterValue.includes(value);
            default:
              return true;
          }
        });
      });

      // Sort by posted date and apply pagination
      const sortedResults = searchResults.sort(
        (a, b) =>
          new Date(b.data().postedDate).getTime() -
          new Date(a.data().postedDate).getTime()
      );

      const total = sortedResults.length;
      const paginatedCars = sortedResults
        .slice(startAt, startAt + limit)
        .map((doc) => ({ id: doc.id, ...doc.data() }));

      const totalPages = Math.ceil(total / limit);

      return res.status(200).json({
        success: true,
        data: paginatedCars,
        pagination: {
          total,
          currentPage: page,
          totalPages,
          hasMore: page < totalPages,
          limit,
        },
      });
    }

    // If no search term, apply filters normally
    for (const filter of filters) {
      if (
        filter.field === "modelYear" ||
        filter.field === "exceptedPrice" ||
        filter.field === "km"
      ) {
        carsQuery = carsQuery.where(
          filter.field,
          filter.condition,
          Number(filter.value)
        );
      } else {
        carsQuery = carsQuery.where(
          filter.field,
          filter.condition,
          filter.value
        );
      }
    }

    // Get total count
    const totalSnapshot = await carsQuery.count().get();
    const total = totalSnapshot.data().count;

    // Get paginated results
    const snapshot = await carsQuery
      .orderBy("postedDate", "desc")
      .limit(limit)
      .offset(startAt)
      .get();

    const cars = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    const totalPages = Math.ceil(total / limit);

    return res.status(200).json({
      success: true,
      data: cars,
      pagination: {
        total,
        currentPage: page,
        totalPages,
        hasMore: page < totalPages,
        limit,
      },
    });
  } catch (error) {
    console.error("Error in getFilteredCars:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch filtered cars",
      error: error.message,
    });
  }
};

// this function takes array of ids as input and return documents of thoses ids ...
const getCarsByIds = async (req, res) => {
  try {
    const { carsIds } = req.body;

    if (!Array.isArray(carsIds) || carsIds.length === 0) {
      return res.status(400).json({ error: "Invalid or empty carIds array" });
    }

    //constructing docRefs which is used to get the doc note: this will not call any data ...
    const carRefs = carsIds.map((id) => db.collection("CARS").doc(id));

    // retrun all raw data ...
    const carsSnapSshots = await db.getAll(...carRefs);

    //filtering raw data ...
    const cars = carsSnapSshots
      .filter((doc) => doc.exists)
      .map((doc) => ({ id: doc.id, ...doc.data() }));
    // console.log(cars);

    if (cars.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "No cars found for the given IDs" });
    }

    res.status(200).json({ success: true, data: cars });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

//this function will store the cars data into db and updates the postedby users fields ...
const postCarForApproval = async (req, res) => {
  try {
    const carData = req.body;
    const { postedBy } = carData;

    if (!postedBy) {
      return res.status(400).json({
        success: false,
        message: "postedBy (user docId) is required.",
      });
    }

    const carRef = db.collection("CARS").doc();
    await carRef.set(carData);

    const userRef = db.collection("USERS").doc(postedBy);
    await userRef.update({
      onSaleCars: admin.firestore.FieldValue.arrayUnion(carRef.id),
    });

    res.status(201).json({
      success: true,
      message: "Car added successfully",
      data: { carId: carRef.id },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error adding car",
      error: error.message,
    });
  }
};

// function to get a single car by ID
const getCarById = async (req, res) => {
  try {
    const { id } = req.params;
    const carDoc = await db.collection("CARS").doc(id).get();

    if (!carDoc.exists) {
      return res.status(404).json({
        success: false,
        message: "Car not found",
      });
    }

    const carData = {
      id: carDoc.id,
      ...carDoc.data(),
    };

    res.status(200).json({
      success: true,
      data: carData,
    });
  } catch (error) {
    console.error("Error getting car:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// function to update car status
const updateCarStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate status
    if (!["pending", "approved", "rejected", "sold"].includes(status)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid status value. Must be 'pending', 'approved', 'rejected', or 'sold'",
      });
    }

    const carDoc = await db.collection("CARS").doc(id).get();

    if (!carDoc.exists) {
      return res.status(404).json({
        success: false,
        message: "Car not found",
      });
    }

    // Update the car status
    await db.collection("CARS").doc(id).update({
      carStatus: status,
    });

    // If status is changing to approved, rejected, or sold, update user's car arrays
    const carData = carDoc.data();
    const postedBy = carData.postedBy;
    const userRef = db.collection("USERS").doc(postedBy);

    if (status === "approved" || status === "rejected" || status === "sold") {
      await db.runTransaction(async (transaction) => {
        const userDoc = await transaction.get(userRef);
        if (!userDoc.exists) {
          throw new Error("User not found");
        }

        const userData = userDoc.data();
        // Remove from onSaleCars
        const updatedOnSaleCars = userData.onSaleCars.filter(
          (carId) => carId !== id
        );

        // Update relevant arrays based on status
        if (status === "sold") {
          transaction.update(userRef, {
            onSaleCars: updatedOnSaleCars,
            soldCars: admin.firestore.FieldValue.arrayUnion(id),
          });
        } else if (status === "approved") {
          // For approved cars, keep them in onSaleCars
          transaction.update(userRef, {
            onSaleCars: admin.firestore.FieldValue.arrayUnion(id),
          });
        } else {
          // For rejected cars
          transaction.update(userRef, {
            onSaleCars: updatedOnSaleCars,
          });
        }
      });
    }

    res.status(200).json({
      success: true,
      message: `Car status updated to ${status}`,
    });
  } catch (error) {
    console.error("Error updating car status:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = {
  getAllUsers,
  getAllCars,
  getAllPendingCars,
  getCarsByIds,
  postCarForApproval,
  updateProfile,
  registerUsers,
  checkUserExists,
  getFilteredCars,
  generateOtp,
  getCarById,
  updateCarStatus,
  getUserById,
};
