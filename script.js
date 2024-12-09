// Set up the API endpoint and key (replace with your own API key)
const API_KEY = 'AIzaSyCyDyixvXSb5-12cWCV6jx303Yg04QbUaA';
const API_URL = 'https://www.googleapis.com/books/v1/volumes';

// Get elements from the DOM
const searchButton = document.getElementById('search-button');
const searchQueryInput = document.getElementById('search-query');
const resultsContainer = document.getElementById('results');

// Event listener for search button click
searchButton.addEventListener('click', () => {
    const query = searchQueryInput.value.trim();
    if (query) {
        searchBooks(query);
    } else {
        alert("Please enter a search query.");
    }
});

// Function to fetch books from the Google Books API
async function searchBooks(query) {
    try {
        const response = await fetch(`${API_URL}?q=${query}&key=${API_KEY}`);
        const data = await response.json();

        if (data.items) {
            displayBooks(data.items);
        } else {
            resultsContainer.innerHTML = '<p>No books found. Try a different search.</p>';
        }
    } catch (error) {
        resultsContainer.innerHTML = '<p>There was an error fetching the books. Please try again later.</p>';
        console.error(error);
    }
}

// Function to display books in the DOM
function displayBooks(books) {
    resultsContainer.innerHTML = ''; // Clear previous results

    books.forEach(book => {
        const title = book.volumeInfo.title || 'No title available';
        const authors = book.volumeInfo.authors || ['Unknown author'];
        const thumbnail = book.volumeInfo.imageLinks ? book.volumeInfo.imageLinks.thumbnail : 'https://via.placeholder.com/150';
        const description = book.volumeInfo.description || 'No description available';

        const bookCard = document.createElement('div');
        bookCard.classList.add('book-card');

        bookCard.innerHTML = `
            <img src="${thumbnail}" alt="${title}">
            <h3>${title}</h3>
            <p><strong>Author:</strong> ${authors.join(', ')}</p>
            <p>${description.substring(0, 100)}...</p>
        `;

        resultsContainer.appendChild(bookCard);
    });
}

// Initialize Firebase
const firebaseConfig = {
    apiKey: "AIzaSyCUGhx1aW7WqI9sHuJFahzedOdl4Mksnmw", // Replace with your Firebase API key
    authDomain: "bookbuddy-bd527.firebaseapp.com",
    projectId: "bookbuddy-bd527",
    storageBucket: "bookbuddy-bd527.appspot.com",
    messagingSenderId: "928664583825",
    appId: "1:928664583825:web:7009837c9f8ecc00d2c930"
};
const app = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// DOM Elements
const searchButton = document.getElementById('search-button');
const searchQueryInput = document.getElementById('search-query');
const resultsContainer = document.getElementById('results');
const loginButton = document.getElementById('login-button');
const logoutButton = document.getElementById('logout-button');
const userGreeting = document.getElementById('user-greeting');

// Set up authentication state listener
auth.onAuthStateChanged(user => {
    if (user) {
        userGreeting.innerText = `Hello, ${user.displayName || 'User'}!`;
        loginButton.style.display = 'none';
        logoutButton.style.display = 'block';
        loadUserSavedBooks(user.uid);
    } else {
        userGreeting.innerText = 'Please log in';
        loginButton.style.display = 'block';
        logoutButton.style.display = 'none';
        resultsContainer.innerHTML = ''; // Clear previous results
    }
});

// Login function (using email/password)
loginButton.addEventListener('click', () => {
    const email = prompt("Enter your email");
    const password = prompt("Enter your password");
    auth.signInWithEmailAndPassword(email, password)
        .catch(error => alert(error.message));
});

// Logout function
logoutButton.addEventListener('click', () => {
    auth.signOut();
});

// Search Button Click Event
searchButton.addEventListener('click', () => {
    const query = searchQueryInput.value.trim();
    if (query) {
        searchBooks(query);
    } else {
        alert("Please enter a search query.");
    }
});

// Search Books (fetch from Google Books API)
async function searchBooks(query) {
    const API_KEY = 'AIzaSyCyDyixvXSb5-12cWCV6jx303Yg04QbUaA'; // Use your own API key
    const API_URL = `https://www.googleapis.com/books/v1/volumes?q=${query}&key=${API_KEY}`;

    try {
        const response = await fetch(API_URL);
        const data = await response.json();
        
        if (data.items) {
            displayBooks(data.items);
        } else {
            resultsContainer.innerHTML = '<p>No books found. Try a different search.</p>';
        }
    } catch (error) {
        console.error('Error fetching books:', error);
        resultsContainer.innerHTML = '<p>Error fetching books. Please try again later.</p>';
    }
}

// Display Books
function displayBooks(books) {
    resultsContainer.innerHTML = ''; // Clear previous results

    books.forEach(book => {
        const title = book.volumeInfo.title || 'No title available';
        const authors = book.volumeInfo.authors || ['Unknown author'];
        const thumbnail = book.volumeInfo.imageLinks ? book.volumeInfo.imageLinks.thumbnail : 'https://via.placeholder.com/150';
        const description = book.volumeInfo.description || 'No description available';

        const bookCard = document.createElement('div');
        bookCard.classList.add('book-card');

        bookCard.innerHTML = `
            <img src="${thumbnail}" alt="${title}">
            <h3>${title}</h3>
            <p><strong>Author:</strong> ${authors.join(', ')}</p>
            <p>${description.substring(0, 100)}...</p>
            <button class="save-button">Save to Profile</button>
        `;

        // Add event listener to "Save to Profile" button
        const saveButton = bookCard.querySelector('.save-button');
        saveButton.addEventListener('click', () => saveBookToProfile(book));

        resultsContainer.appendChild(bookCard);
    });
}

// Save Book to User Profile
async function saveBookToProfile(book) {
    const user = auth.currentUser;
    if (!user) {
        alert("You must be logged in to save books.");
        return;
    }

    const bookData = {
        title: book.volumeInfo.title,
        authors: book.volumeInfo.authors || ['Unknown author'],
        description: book.volumeInfo.description || 'No description available',
        thumbnail: book.volumeInfo.imageLinks ? book.volumeInfo.imageLinks.thumbnail : 'https://via.placeholder.com/150',
    };

    try {
        await db.collection('users').doc(user.uid).collection('savedBooks').add(bookData);
        alert("Book saved to your profile!");
    } catch (error) {
        console.error("Error saving book:", error);
        alert("Failed to save book. Please try again.");
    }
}

// Load User's Saved Books
async function loadUserSavedBooks(userId) {
    const savedBooksRef = db.collection('users').doc(userId).collection('savedBooks');
    const snapshot = await savedBooksRef.get();

    if (!snapshot.empty) {
        snapshot.forEach(doc => {
            const book = doc.data();
            const bookCard = document.createElement('div');
            bookCard.classList.add('book-card');
            bookCard.innerHTML = `
                <img src="${book.thumbnail}" alt="${book.title}">
                <h3>${book.title}</h3>
                <p><strong>Author:</strong> ${book.authors.join(', ')}</p>
                <p>${book.description.substring(0, 100)}...</p>
                <button class="remove-button" data-id="${doc.id}">Remove from Profile</button>
            `;
            
            // Add event listener to remove button
            const removeButton = bookCard.querySelector('.remove-button');
            removeButton.addEventListener('click', () => removeBookFromProfile(doc.id));

            resultsContainer.appendChild(bookCard);
        });
    } else {
        resultsContainer.innerHTML = '<p>No saved books yet.</p>';
    }
}

// Remove Book from User Profile
async function removeBookFromProfile(bookId) {
    const user = auth.currentUser;
    if (!user) {
        alert("You must be logged in to remove books.");
        return;
    }

    try {
        await db.collection('users').doc(user.uid).collection('savedBooks').doc(bookId).delete();
        alert("Book removed from your profile.");
        loadUserSavedBooks(user.uid); // Refresh saved books
    } catch (error) {
        console.error("Error removing book:", error);
        alert("Failed to remove book. Please try again.");
    }
}

