let selectedPlace = {};

function onPlaceChanged() {
    // Extract place details
    selectedPlace = {
        name: place.name,
    };

    // Populate hidden fields
    document.getElementById('name').value = selectedPlace.name;
}

document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('submit-btn').addEventListener('click', function () {
        if (!selectedPlace.name) {
            alert('Please select a place from the suggestions.');
            return;
        }

        // Send the selected place to the backend
        fetch('/save_place', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(selectedPlace)
        })
        .then(response => response.json())
        .then(data => {
            const messageDiv = document.getElementById('message');
            if (data.error) {
                messageDiv.innerHTML = `<span style="color: red;">Error: ${data.error}</span>`;
            } else {
                messageDiv.innerHTML = `<span style="color: green;">${data.message} (ID: ${data.id})</span>`;
                // Reset the form
                document.getElementById('autocomplete').value = '';
                selectedPlace = {};
            }
        })
        .catch(error => {
            console.error('Error:', error);
            document.getElementById('message').innerHTML = `<span style="color: red;">An error occurred.</span>`;
        });
    });
});
