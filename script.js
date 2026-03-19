var firebaseConfig = {
  apiKey: " ",
  authDomain: "smart-campus-lost-found.firebaseapp.com",
  projectId: "smart-campus-lost-found",
  storageBucket: "smart-campus-lost-found.firebasestorage.app",
  messagingSenderId: " ",
  appId: " ",
  measurementId: " "
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
console.log("Firebase connected");

let selectedLocation = "";

const manualInput = document.getElementById("manual-location");
const mapBtn = document.getElementById("get-location-btn");
const status = document.getElementById("location-status");
const radios = document.getElementsByName("locationType");

if (radios.length > 0) {
  radios.forEach((radio) => {
    radio.addEventListener("change", () => {
      if (radio.value === "manual" && radio.checked) {
        manualInput.style.display = "block";
        mapBtn.style.display = "none";
        status.innerText = "";
        selectedLocation = "";
      }

      if (radio.value === "map" && radio.checked) {
        manualInput.style.display = "none";
        mapBtn.style.display = "inline-block";
        status.innerText = "";
        selectedLocation = "";
      }
    });
  });
}

if (mapBtn) {
  mapBtn.addEventListener("click", () => {
    if (!navigator.geolocation) {
      alert("Geolocation not supported");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        selectedLocation = `Lat: ${lat}, Lng: ${lng}`;
        status.innerText = "📍 Location captured!";
      },
      () => {
        alert("Location access denied");
      }
    );
  });
}

function handleFormSubmit(formId, collectionName) {
  const form = document.getElementById(formId);
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const itemName = document.getElementById("item-name").value;
    const category = document.getElementById("category").value;
    const description = document.getElementById("description").value;
    const email = document.getElementById("contact-email").value;

    let finalLocation = "";
    const selectedType = document.querySelector(
      'input[name="locationType"]:checked'
    )?.value;

    if (selectedType === "manual") {
      finalLocation = manualInput.value;
    } else {
      finalLocation = selectedLocation;
    }

    if (!itemName || !category || !finalLocation || !email) {
      alert("Please fill all required fields");
      return;
    }

    db.collection(collectionName)
      .add({
        itemName,
        category,
        description,
        location: finalLocation,
        email,
        createdAt: new Date(),
      })
      .then(() => {
        alert("Item reported successfully!");
        form.reset();
        status.innerText = "";
        selectedLocation = "";
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  });
}

handleFormSubmit("lost-form", "lost-items");
handleFormSubmit("found-form", "found-items");

const lostContainer = document.getElementById("lostData");
const foundContainer = document.getElementById("foundData");

if (lostContainer) {
  db.collection("lost-items")
    .orderBy("createdAt", "desc")
    .get()
    .then((snapshot) => {
      snapshot.forEach((doc) => {
        const d = doc.data();
        lostContainer.innerHTML += `
          <div class="card">
            <h3>${d.itemName}</h3>
            <p><strong>Category:</strong> ${d.category}</p>
            <p><strong>Description:</strong> ${d.description || "-"}</p>
            <p><strong>Location:</strong> ${d.location}</p>
            <p><strong>Contact:</strong> ${d.email}</p>
          </div>
        `;
      });
    });
}

if (foundContainer) {
  db.collection("found-items")
    .orderBy("createdAt", "desc")
    .get()
    .then((snapshot) => {
      snapshot.forEach((doc) => {
        const d = doc.data();
        foundContainer.innerHTML += `
          <div class="card">
            <h3>${d.itemName}</h3>
            <p><strong>Category:</strong> ${d.category}</p>
            <p><strong>Description:</strong> ${d.description || "-"}</p>
            <p><strong>Location:</strong> ${d.location}</p>
            <p><strong>Contact:</strong> ${d.email}</p>
          </div>
        `;
      });
    });
}





