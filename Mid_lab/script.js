

const profileImg = document.getElementById('profile-img');
const infoBox = document.getElementById('info-box');


profileImg.addEventListener('mouseover', () => {
    infoBox.style.display = 'block';
});


profileImg.addEventListener('mouseout', () => {
    infoBox.style.display = 'none';
});
