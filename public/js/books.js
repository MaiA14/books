var app = new Vue({
    el: '#app',
    data: {
        books: [],
    },
    methods: {
        rateBook(id) {
            const rate = firebase.functions().httpsCallable('rate');
            rate({ id })
                .catch(error => {
                    showNotification(error.message);
                });
        }
    },
    mounted() {
        const ref = firebase.firestore().collection('books').orderBy('rating', 'desc');
        ref.onSnapshot(snapshot => {
            let books = [];
            snapshot.forEach(doc => {
                books.push({...doc.data(), id: doc.id });
            });
            this.books = books;
        });
    }
});