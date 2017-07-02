"use strict";

const contractABI = [{"constant":false,"inputs":[{"name":"product","type":"string"},{"name":"review","type":"string"},{"name":"key","type":"string"}],"name":"SendReview","outputs":[{"name":"success","type":"bool"}],"payable":false,"type":"function"},{"constant":false,"inputs":[],"name":"GetBonusesAddress","outputs":[{"name":"","type":"address"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"person","type":"address"}],"name":"GetBonuses","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"product","type":"string"},{"name":"reviewIndex","type":"uint256"},{"name":"key","type":"string"}],"name":"VoteForReview","outputs":[{"name":"success","type":"bool"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"index","type":"uint256"}],"name":"GetReview","outputs":[{"name":"success","type":"bool"},{"name":"review","type":"string"},{"name":"upvotes","type":"uint256"},{"name":"author","type":"address"},{"name":"product","type":"string"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"key","type":"string"}],"name":"AddKey","outputs":[],"payable":false,"type":"function"},{"inputs":[],"payable":false,"type":"constructor"},{"anonymous":false,"inputs":[{"indexed":false,"name":"product","type":"string"},{"indexed":false,"name":"author","type":"address"},{"indexed":false,"name":"review","type":"string"}],"name":"ReviewReceived","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"product","type":"string"},{"indexed":false,"name":"author","type":"address"},{"indexed":false,"name":"id","type":"uint256"}],"name":"ReviewUpvoted","type":"event"}];
const contractAddress = "0xc24e9fd7702734be2c2d839f4ca36b27f5952f79";

window.addEventListener('load', function () {
    if (typeof web3 !== 'undefined') {
        // Use Mist/MetaMask's provider
        console.log('found web3');
        window.web3 = new Web3(web3.currentProvider);
        web3.eth.defaultAccount = web3.eth.accounts[0];
    } else {
        console.log('No web3? You should consider trying MetaMask!');
        alert("No Metamask!");
        return;
    }

    window.contract = web3.eth.contract(contractABI).at(contractAddress);
    window.reviewsDiv = document.getElementById('reviews');

    update();
});

function update() {
    updateReviews(() => {
        removeChildren(reviewsDiv);
        if (reviews.length === 0) {
            const info = document.createElement('p');
            info.innerText = "There are no reviews yet."
            reviewsDiv.appendChild(info);
        }

        for (let i = 0; i < reviews.length; i++) {
            const review = reviews[i];
            const reviewContainerNode = document.createElement('div');
            reviewContainerNode.setAttribute('class', 'rvw');
            const reviewNode = document.createElement('p');
            const likeNode = document.createElement('like');
            likeNode.innerHTML = `👍 ${review[2]}`;
            likeNode.setAttribute('onclick', `upvote(${i});`)
            reviewNode.innerHTML = `${review[3]}: ${review[1]}`;
            
            reviewContainerNode.appendChild(reviewNode);
            reviewContainerNode.appendChild(likeNode);
            reviewsDiv.appendChild(reviewContainerNode);
        }
    });
}

window.reviews = [];
reviews.finished = false;

/**
* Gets all the outputs of the call to the function with indices.
* @param func the function get array from
* @param items the array of names of the output parameters.
*/
function updateReviews(callback) {
    reviews.finished = false;
    reviews.length = 0;

    let i = 0;
    contract.GetReview.call(i, getReviewsRecursively);

    function getReviewsRecursively(err, res) {
        if (!res) {
            console.log('Error: ' + err);
            reviews.finished = true;
            callback();
        } else {
            ++i;

            if (res[0] == false) {
                reviews.finished = true;
                callback();
                return;
            }

            console.log('Result: ');
            console.log(res);

            reviews.push(res);

            contract.GetReview.call(i, getReviewsRecursively);
        }
    }
}

function removeChildren(element) {
    if (element.children.length === 0)
        return;
    while (element.firstChild) {
        element.removeChild(element.firstChild);
    }
}

function sendReview() {
    const review = document.getElementById('reviewInput').value;
    const key = document.getElementById('keyInput').value;
    contract.SendReview("Milk#2384AD", review, key, alert);
}

function upvote(id) {
    const key = document.getElementById('keyInput').value;
    contract.VoteForReview("Milk#2384AD", id, key);
}