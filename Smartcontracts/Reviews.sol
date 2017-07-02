pragma solidity ^0.4.11;

contract Reviews {
    /// Structure for a single review
    struct Review {
        string product;
        address author;
        string review;
        uint upvotes;
    }
    
    /// Fired on review receiving
    event ReviewReceived(
        string product,
        address author,
        string review
    );
    
    event ReviewUpvoted(
        string product,
        address author,
        uint id);

    /// Storage for reviews
    Review[10**10] ReviewsStorage;
    
    /// The amount of reviews by product.
    uint256 ReviewsAmount;
    
    /// Storage for keys of each product
    string[10**30] KeysStorage;
    
    /// The amount of keys a product has produced
    uint256 KeysFilled;
    
    /// The owner of the contract
    address owner;
    
    /// The mapping (product => key => whether used or not) for used keys
    mapping(string => mapping(string=>bool)) UsedKeys;
    
    Bonuses BonusesForReviews = new Bonuses();
    
    modifier OnlyOwner {
        require(msg.sender == owner);
        _;
    }
    
    function Reviews() {
        owner = msg.sender;
    }
    
    /// Allows an owner to add keys.
    function AddKey(string key) OnlyOwner {
        KeysStorage[KeysFilled++] = key;
    }
    
    /// Checks the identity of the reviewer and the key.
    function Verify(string product, address reviewer, string key) private returns (bool access) {
        if (UsedKeys[product][key]) 
            return false;
        
        uint n = KeysStorage.length;
        for (uint16 i = 0; i < n; i++) {
            if (keccak256(key) == keccak256(KeysStorage[i])) {
                UsedKeys[product][key] = true;
                return true;
            }
        }
        
        return false;
    }

    /// Sends review on the product with the key.
    function SendReview(string product, string review, string key) 
        external returns (bool success) {
        if (!Verify(product, msg.sender, key))
            return false;
        
        // Add a review and increase the reviews amount.
        ReviewsStorage[ReviewsAmount++] = 
                Review(product, msg.sender, review, 1);
        ReviewReceived(product, msg.sender, review);
        BonusesForReviews.GiveRewardForReview(msg.sender);
        return true;
    }
    
    /// Get a review by index.
    function GetReview(uint index) 
            external returns (bool success, string review, uint upvotes, address author, string product) {
        if (index >= ReviewsAmount) {
            success = false;
            return;
        }
        
        Review reviewFromStorage = ReviewsStorage[index];
        review = reviewFromStorage.review;
        author = reviewFromStorage.author;
        upvotes = reviewFromStorage.upvotes;
        product = reviewFromStorage.product;
        success = true;
    }
    
    /// Vote for a review instead of writing a new one.
    function VoteForReview(string product, uint256 reviewIndex, string key) 
        external returns (bool success) {
        
        if (!Verify(product, msg.sender, key) || 
            keccak256(product) != keccak256(ReviewsStorage[reviewIndex].product))
            return false;
        
        ReviewsStorage[reviewIndex].upvotes++;
        ReviewUpvoted(product, msg.sender, reviewIndex);
        BonusesForReviews.GiveRewardForReview(msg.sender);
        return true;
    }
    
    /// Get the address of the bonuses smart contract.
    function GetBonusesAddress() public returns (address) {
        return address(BonusesForReviews);
    }
    
    /// Get the amount of bonuses the person has.
    function GetBonuses(address person) public returns (uint256) {
        return BonusesForReviews.GetBonuses(person);
    }
}

/// The smart contract for bonuses management.
contract Bonuses {
    /// The creator of the contract.
    address owner;
    
    /// The balances of people.
    mapping (address => uint256) Balance;
    
    modifier OnlyOwner {
        require(msg.sender == owner);
        _;
    }
    
    function Bonuses() {
        owner = msg.sender;
    }
    
    /// Get the bonuses of the person.
    function GetBonuses(address person) public returns (uint256) {
        return Balance[person];
    }
    
    /// Give a reward.
    function GiveRewardForReview(address receiver) {
        Balance[receiver]++;
    }
}