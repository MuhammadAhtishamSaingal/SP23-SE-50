document.querySelectorAll('.add-to-wishlist').forEach(button => {
    button.addEventListener('click', async (event) => {
        const productId = event.target.getAttribute('data-product-id');
        const response = await fetch('/wishlist/add', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ productId })
        });

        const data = await response.json();
        alert(data.message);
    });
});