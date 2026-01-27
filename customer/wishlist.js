/**
 * Wishlist System
 * Developer: Omar
 * Description: Wishlist management functions
 */

function getWishlist() {
  const stored = localStorage.getItem("wishlist");
  return stored ? JSON.parse(stored) : [];
}

function saveWishlist(items) {
  localStorage.setItem("wishlist", JSON.stringify(items));
}

function addToWishlist(productId) {
  const wishlist = getWishlist();
  if (!wishlist.includes(productId)) {
    wishlist.push(productId);
    saveWishlist(wishlist);
  }
  return wishlist;
}

function removeFromWishlist(productId) {
  const wishlist = getWishlist().filter((id) => id !== productId);
  saveWishlist(wishlist);
  return wishlist;
}

function toggleWishlist(productId) {
  const wishlist = getWishlist();
  if (wishlist.includes(productId)) {
    return removeFromWishlist(productId);
  }
  return addToWishlist(productId);
}

function isInWishlist(productId) {
  return getWishlist().includes(productId);
}
