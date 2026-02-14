// Add Item
function addItem() {
  let nameInput = document.getElementById("itemName");
  let name = nameInput.value;

  if (name === "") {
    alert("Please enter item name");
    return;
  }

  let items = JSON.parse(localStorage.getItem("items")) || [];

  let newItem = {
    id: Date.now(),
    name: name
  };

  items.push(newItem);

  localStorage.setItem("items", JSON.stringify(items));

  nameInput.value = "";

  displayItems();
}


// Display Items
function displayItems() {
  // optional search filter parameter handled below
  displayItems('');
}


// Render items, optionally filtered by a search string (case-insensitive)
function displayItems(filter) {
  let items = JSON.parse(localStorage.getItem("items")) || [];
  let container = document.getElementById("itemsList");

  if (!container) return;

  let query = (filter || '').toString().trim().toLowerCase();

  container.innerHTML = "";

  items.forEach(item => {
    // build searchable text
    let searchable = `${item.name || ''} ${item.location || ''} ${item.category || ''} ${item.type || ''}`.toLowerCase();

    if (query && searchable.indexOf(query) === -1) {
      return; // skip non-matching items
    }

    let div = document.createElement("div");

    div.innerHTML = `
      <p>
        <b>${item.name}</b> (${item.type || 'unknown'})<br>
        Location: ${item.location || 'N/A'}<br>
        Category: ${item.category || 'N/A'}<br>
        Contact: ${item.contact || 'N/A'}
      </p>
      <button onclick="claimItem(${item.id})">Claim</button>
      <hr>
    `;

    container.appendChild(div);
  });
}


// Claim Item (REMOVE)
function claimItem(id) {
  // Find the item by id
  let items = JSON.parse(localStorage.getItem("items")) || [];
  let item = items.find(i => i.id === id);

  if (!item) {
    alert("Item not found.");
    return;
  }

  // If item has a unique detail, ask for it for verification
  if (item.uniqueDetail) {
    let entered = prompt("Enter unique detail to verify:");
    if (entered === null) return; // user cancelled

    if (entered !== item.uniqueDetail) {
      alert("Claim Rejected! Details did not match.");
      return;
    }
  } else {
    // No unique detail provided: ask for confirmation
    let ok = confirm("No verification detail set for this item. Mark as claimed and remove from list?");
    if (!ok) return;
  }

  // Remove the item
  let updatedItems = items.filter(i => i.id !== id);
  localStorage.setItem("items", JSON.stringify(updatedItems));

  alert("Item returned successfully and removed from the list.");

  displayItems();
}


// Submit Found Item
function submitFound() {
  submitItem('found');
}

// Submit Lost Item
function submitLost() {
  submitItem('lost');
}

// Helper to submit an item (found or lost)
function submitItem(type) {
  let name = (document.getElementById("itemName") || {}).value || '';
  let location = (document.getElementById("location") || {}).value || '';
  let category = (document.getElementById("category") || {}).value || '';
  let contact = (document.getElementById("contact") || {}).value || '';
  let uniqueDetail = (document.getElementById("uniqueDetail") || {}).value || '';

  if (!name) {
    alert('Please enter item name');
    return;
  }

  // Normalize and validate contact: strip non-digits and require 9–10 digits if provided
  let contactDigits = (contact || '').toString().replace(/\D/g, '');
  if (contactDigits) {
    if (contactDigits.length < 9 || contactDigits.length > 10) {
      alert('Contact number must be 9 or 10 digits.');
      return;
    }
    contact = contactDigits; // store normalized digits-only contact
  } else {
    contact = '';
  }

  let items = JSON.parse(localStorage.getItem("items")) || [];

  let newItem = {
    id: Date.now(),
    name: name,
    location: location,
    category: category,
    contact: contact,
    uniqueDetail: uniqueDetail,
    type: type
  };

  items.push(newItem);
  localStorage.setItem("items", JSON.stringify(items));

  alert('Item submitted successfully');

  // Clear inputs if they exist
  if (document.getElementById('itemName')) document.getElementById('itemName').value = '';
  if (document.getElementById('location')) document.getElementById('location').value = '';
  if (document.getElementById('category')) document.getElementById('category').value = '';
  if (document.getElementById('contact')) document.getElementById('contact').value = '';
  if (document.getElementById('uniqueDetail')) document.getElementById('uniqueDetail').value = '';

  // If we're on a list page, refresh the UI
  displayItems();
}


// Load items when page opens
window.onload = function() {
  // Attach live search listener if the search input exists
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    // update on input
    searchInput.addEventListener('input', function (e) {
      displayItems(e.target.value);
    });
  }

  // initial render (no filter)
  displayItems('');
};
async function addItem(name, description) {
  await fetch("http://localhost:5000/add", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ name, description })
  });

  displayItems();
}
async function displayItems() {
  const res = await fetch("http://localhost:5000/items");
  const items = await res.json();

  const container = document.getElementById("itemsList");
  container.innerHTML = "";

  items.forEach(item => {
    container.innerHTML += `
      <p>${item.name}</p>
      <button onclick="deleteItem('${item._id}')">Delete</button>
      <hr>
    `;
  });
}
async function deleteItem(id) {
  await fetch(`http://localhost:5000/delete/${id}`, {
    method: "DELETE"
  });

  displayItems();
}
