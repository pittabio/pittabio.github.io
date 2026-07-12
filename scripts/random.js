// -- SELECT A RANDOM IMAGE -- //

// Wait for the page to load
window.addEventListener('DOMContentLoaded', () => {

    // 1. Find all images that have the class "random-img"
    const randomImages = document.querySelectorAll('.random-img');

    randomImages.forEach(img => {
        // 2. Get the string in the data-srcs attribute
        const srcData = img.getAttribute('data-srcs');

        if (srcData) {
            // 3. Transform the string into an array (divide where it sees the comma)
            const imagesArray = srcData.split(',').map(s => s.trim());

            // 4. Generate a random index based on how many images there are
            const randomIndex = Math.floor(Math.random() * imagesArray.length);

            // 5. Set the final src
            img.src = imagesArray[randomIndex];
        }
    });
});