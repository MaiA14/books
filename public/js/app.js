const bookModal = document.querySelector('.new-book');
const bookLink = document.querySelector('.add-book');
const bookForm = document.querySelector('.new-book form');

// open modal
bookLink.addEventListener('click', () => {
    bookModal.classList.add('open');
});

// close modal
bookModal.addEventListener('click', (e) => {
    if (e.target.classList.contains('new-book')) {
        bookModal.classList.remove('open');
    }
});

// add a new book
bookForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const addBook = firebase.functions().httpsCallable('addBook');
    addBook({
            text: bookForm.book.value
        })
        .then(() => {
            bookForm.reset();
            bookModal.classList.remove('open');
            bookForm.querySelector('.error').textContent = '';
        })
        .catch(error => {
            bookForm.querySelector('.error').textContent = error.message;
        });
})

// notification
const notification = document.querySelector('.notification');

const showNotification = (message) => {
    notification.textContent = message;
    notification.classList.add('active');
    setTimeout(() => {
        notification.classList.remove('active');
        notification.textContent = '';
    }, 4000);
};