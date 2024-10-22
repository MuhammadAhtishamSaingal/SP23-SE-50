
// Get the profile image and info box elements
const profileImg = document.getElementById('profile-img');
const infoBox = document.getElementById('info-box');

// Show the info box on hover
profileImg.addEventListener('mouseover', () => {
    infoBox.style.display = 'block';
});

// Hide the info box when not hovering
profileImg.addEventListener('mouseout', () => {
    infoBox.style.display = 'none';
});
