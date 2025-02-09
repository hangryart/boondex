document.addEventListener("DOMContentLoaded", function () {
    const nftContainer = document.getElementById("nft-container");
    const searchInput = document.getElementById("search");
    const sortSelect = document.getElementById("sort");

    // Sample NFT Data (Replace with API fetch later)
    let nftData = [
        { id: 123, image: "nft1.jpg", traits: ["trait1"] },
        { id: 456, image: "nft2.jpg", traits: ["trait2"] },
        { id: 789, image: "nft3.jpg", traits: ["trait3"] }
    ];

    function displayNFTs(nfts) {
        nftContainer.innerHTML = "";
        nfts.forEach(nft => {
            let nftElement = document.createElement("div");
            nftElement.classList.add("nft-item");
            nftElement.innerHTML = `
                <img src="${nft.image}" alt="NFT ${nft.id}">
                <p>Inscription #${nft.id}</p>
            `;
            nftContainer.appendChild(nftElement);
        });
    }

    displayNFTs(nftData);

    // Search Function
    searchInput.addEventListener("input", function () {
        let searchValue = parseInt(searchInput.value);
        let filteredNFTs = nftData.filter(nft => nft.id === searchValue);
        displayNFTs(filteredNFTs.length ? filteredNFTs : nftData);
    });

    // Sorting Function
    sortSelect.addEventListener("change", function () {
        let sortedNFTs = [...nftData];
        if (sortSelect.value === "asc") {
            sortedNFTs.sort((a, b) => a.id - b.id);
        } else {
            sortedNFTs.sort((a, b) => b.id - a.id);
        }
        displayNFTs(sortedNFTs);
    });
});
