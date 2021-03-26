if (document.readyState == 'loading') {
    document.addEventListener('DOMContentLoaded', ready)
} else {
    ready()
}

function ready(){
    var removeFromCartButton = document.getElementsByClassName('btn-danger')
    for (var i = 0; i < removeFromCartButton.length; i++) {
        var button = removeFromCartButton[i]
        button.addEventListener('click', removeFromCartClicked)
    }

    var addToCartButton = document.getElementsByClassName('add-to-cart')
    for (var i = 0; i < addToCartButton.length; i++) {
        var button = addToCartButton[i]
        button.addEventListener('click', addToCartClicked)
    }

    document.getElementsByClassName('btn-purchase')[0].addEventListener('click', purchaseClicked)
    
}

function addToCartClicked(event){
    var button = event.target
    var shopItem = button.parentElement
    var title = shopItem.getElementsByClassName('item-name')[0].innerText
    var price = shopItem.getElementsByClassName('item-price')[0].innerText
    var imgSrc = shopItem.getElementsByClassName('item-image')[0].src
    console.log(title, price)
    addItemToCart(title, price, imgSrc)
    updateCartTotal()
}



function purchaseClicked(){
    //Purchase item and remove from cart
    var cartItems = document.getElementsByClassName('cart-items')[0]
    var mcUsername = document.getElementsByClassName('mc-username')[0].value
    if(mcUsername == ''){
        alert('please enter in your Minecraft Username.')
        return
    }
    while (cartItems.hasChildNodes()){
        cartItems.removeChild(cartItems.firstChild)
    }
    updateCartTotal()

    var stripe = Stripe("pk_test_51IYm1fBpMfOBdhUZEtMzIQ0GTbiGBXHcxvOVj6X1RrPt0USKjBta0F4xt5WhS5zxmsxjemUBsZ239aeAg7cmvrP300WLiWDNN1");
    var username;
    fetch("/checkout", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify({
            username: mcUsername
        })
    }).then(function (response) {
        return response.json();
    }).then(function (session) {
        return stripe.redirectToCheckout({ sessionId: session.id });
    }).then(function (result) {
        // If redirectToCheckout fails due to a browser or network
        // error, you should display the localized error message to your
        // customer using error.message.
        if (result.error) {
            alert(result.error.message);
        }
    }).catch(function (error) {
        console.error("Error:", error);
    });



}

function addItemToCart(title, price, imgSrc){
    var cartRow = document.createElement('div')
    cartRow.classList.add('cart-row')
    var cartItems = document.getElementsByClassName('cart-items')[0]

    var cartItemNames = cartItems.getElementsByClassName('cart-item-title')
    for (var i = 0; i < cartItemNames.length; i++) {
        if(cartItemNames[i].innerText == title)
        alert('This item has already been added to the cart below.')
        return;
    }

    var cartRowContents = `
    <div class="cart-item cart-column">
        <img class="cart-item-image" src="${imgSrc}" width="100" height="100">
        <span class="cart-item-title">${title}</span>
    </div>
    <span class="cart-price cart-column">${price}</span>
    <div class="cart-quantity cart-column">
        <button class="btn btn-danger" type="button">REMOVE</button>
    </div>
    `
    cartRow.innerHTML = cartRowContents
    cartItems.append(cartRow)
    cartRow.getElementsByClassName('btn-danger')[0].addEventListener('click', removeFromCartClicked)
}

function removeFromCartClicked(event) {
    var buttonClicked = event.target
    buttonClicked.parentElement.parentElement.remove()
    updateCartTotal()
}

function updateCartTotal(){
    var cartItemContainer = document.getElementsByClassName('cart-items')[0]
    var cartRows = cartItemContainer.getElementsByClassName('cart-row')
    var total = 0
    for (var i = 0; i < cartRows.length; i++) {
        var cartRow = cartRows[i]
        var priceElement = cartRow.getElementsByClassName('cart-price')[0]
        var price = parseFloat(priceElement.innerText.replace('$', ''))
        total = total + price
    }
    total = Math.round(total * 100) / 100
    document.getElementsByClassName('cart-total-price')[0].innerText = '$'+total.toFixed(2)
}