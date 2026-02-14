// Submit Found Item
function submitFound() {
  submitItem('found');
}

// Submit Lost Item
function submitLost() {
  submitItem('lost');
}

// Helper to submit an item (found or lost) to backend
async function submitItem(type) {
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

  try {
    const res = await fetch("http://localhost:5000/add", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name: name,
        location: location,
        category: category,
        contact: contact,
        uniqueDetail: uniqueDetail,
        type: type
      })
    });

    if (res.ok) {
      alert('Item submitted successfully');

      // Clear inputs if they exist
      if (document.getElementById('itemName')) document.getElementById('itemName').value = '';
      if (document.getElementById('location')) document.getElementById('location').value = '';
      if (document.getElementById('category')) document.getElementById('category').value = '';
      if (document.getElementById('contact')) document.getElementById('contact').value = '';
      if (document.getElementById('uniqueDetail')) document.getElementById('uniqueDetail').value = '';

      // If we're on a list page, refresh the UI
      displayItems('');
    } else {
      alert('Error submitting item');
    }
  } catch (err) {
    console.error('Submit error:', err);
    alert('Error submitting item: ' + err.message);
  }
}

// Display items from backend, optionally filtered by search query
async function displayItems(filter) {
  try {
    const res = await fetch("http://localhost:5000/items");
    const items = await res.json();

    const container = document.getElementById("itemsList");
    if (!container) return;

    container.innerHTML = "";

    let query = (filter || '').toString().trim().toLowerCase();

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
        <button onclick="deleteItem('${item._id}')">Delete</button>
        <hr>
      `;
      container.appendChild(div);
    });
  } catch (err) {
    console.error('Display error:', err);
  }
}

// Delete item from backend
async function deleteItem(id) {
  try {
    const res = await fetch(`http://localhost:5000/delete/${id}`, {
      method: "DELETE"
    });

    if (res.ok) {
      alert('Item deleted successfully');
      displayItems('');
    } else {
      alert('Error deleting item');
    }
  } catch (err) {
    console.error('Delete error:', err);
  }
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
async function searchItem() {
  const value = document.getElementById("searchInput").value;

  const res = await fetch(`http://localhost:5000/search?name=${value}`);
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