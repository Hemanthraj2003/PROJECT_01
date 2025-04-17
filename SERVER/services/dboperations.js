// this file will export all the Database related functions ...
const admin = require("firebase-admin");

// getting firebase credentials ...
const key = require("../carshu-1e768-firebase-adminsdk-fbsvc-3503135aec.json");

admin.initializeApp({
  credential: admin.credential.cert(key),
});

//firestore databse instance ...
const db = admin.firestore();

// end of boiler plate to access the databases from the firestore ...
// now we can access the database using [db] ...

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
    console.log(users);
    res.status(200).json({ data: users });
  } catch (error) {
    console.log(error);
    res.status(500);
  }
};

const generateOtp = async (req, res) => {
  try {
    const API_KEY =
      "zH7O0ScnKmbFMhBu3fIy8jtUkVsdLWi1GAx2rglZ6eDN5aXoT48Uk4lbAGK0XT2sm7LhMiBIujgFJ1Ec";
    const { phoneNumber } = req.body;
    const otp = Math.floor(1000 + Math.random() * 9000);
    console.log("Generated OTP: ", otp);
    if (phoneNumber && otp) {
      fetch("https://www.fast2sms.com/dev/bulkV2", {
        method: "POST",
        headers: {
          authorization: API_KEY,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          variables_values: otp,
          route: "otp",
          numbers: phoneNumber,
        }),
      })
        .then((response) => response.json())
        .then((data) => console.log(data))
        .catch((error) => console.error("Error:", error));
    }
    res.status(200).send({ OTP: otp });
  } catch (e) {
    console.log(e);
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

///////////////////////////////////
// START OF CARS RELATED FUNCTIONS
///////////////////////////////////

// fetchs all cars from CARS collection ...
const getAllCars = async (req, res) => {
  try {
    const carsSnapshot = await db.collection("CARS").get();
    const cars = carsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    res.status(200).json({ success: true, data: cars });
  } catch (error) {
    console.log(error);
    res.status(500);
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
      return res.status(200).json({ message: "No Cars Pending for Approval " });
    }

    const pendingCars = pendingCarsSnapShot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.status(200).json(pendingCars);
  } catch (error) {
    console.log(error);
    res.status(500);
  }
};

// function to filter cars and return based on the filter parameters
const getFilteredCars = async (req, res) => {
  try {
    // Get filter parameters from the request body
    const filters = req.body.filters || [];

    // Validate filter structure
    if (!Array.isArray(filters)) {
      return res.status(400).json({ error: "Filters should be an array" });
    }

    let carsQuery = db.collection("CARS"); // Base query

    // Apply filters dynamically
    for (const { field, condition, value } of filters) {
      if (!field || !condition || value === undefined) {
        return res.status(400).json({
          error: "Each filter should contain 'field', 'condition', and 'value'",
        });
      }
      carsQuery = carsQuery.where(field, condition, value); // Correct dynamic filtering
    }

    // Execute the query
    const carsSnapshot = await carsQuery.get();

    if (carsSnapshot.empty) {
      return res.status(404).json({
        success: true,
        message: "No cars found with the given filters",
      });
    }

    // Map results
    const cars = carsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.status(200).json({ success: true, data: cars });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch filtered cars" });
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
      return res
        .status(400)
        .json({ message: "postedBy (user docId) is required." });
    }

    // posting the data into database
    const carRef = db.collection("CARS").doc(); // if we do not specify the doc id, it will autogenerate ...
    await carRef.set(carData);

    // now that we have saved the cars detail, we can access the id of the car through carsRef variabele
    const userRef = db.collection("USERS").doc(postedBy);
    await userRef.update({
      onSaleCars: admin.firestore.FieldValue.arrayUnion(carRef.id),
      // this is a firebase inbuilt methode to add the value into a array
    });

    res
      .status(201)
      .json({ message: "Car added successfully", carId: carRef.id });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error adding car" });
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
};
