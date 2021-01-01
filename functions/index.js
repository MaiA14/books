const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

// auth trigger (new user signup)
exports.newUserSignUp = functions.auth.user().onCreate(user => {
    // for background triggers you must return a value/promise
    return admin.firestore().collection('users').doc(user.uid).set({
        email: user.email,
        ratedOn: [],
    });
});

// auth trigger (user deleted)
exports.userDeleted = functions.auth.user().onDelete(user => {
    const doc = admin.firestore().collection('users').doc(user.uid);
    return doc.delete();
});

// http callable function (addding a book)
exports.addBook = functions.https.onCall((data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError(
            'unauthenticated',
            'only authenticated users can add books'
        );
    }
    if (data.text.length > 30) {
        throw new functions.https.HttpsError(
            'invalid-argument',
            'book must be no more than 30 characters long'
        );
    }
    return admin.firestore().collection('books').add({
        text: data.text,
        rating: 0
    });
})

// rate callable function
exports.rate = functions.https.onCall(async(data, context) => {
    // check auth state
    if (!context.auth) {
        throw new functions.https.HttpsError(
            'unauthenticated',
            'only authenticated users can rate up books'
        );
    }
    // get refs for user doc & book doc
    const user = admin.firestore().collection('users').doc(context.auth.uid);
    const book = admin.firestore().collection('books').doc(data.id);

    const doc = await user.get();
    // check thew user hasn't already rated
    if (doc.data().ratedOn.includes(data.id)) {
        throw new functions.https.HttpsError(
            'failed-precondition',
            'You can only rate something up once'
        );
    }

    // update the array in user document
    await user.update({
        ratedOn: [...doc.data().ratedOn, data.id]
    });
    // update the votes on the book
    return book.update({
        rating: admin.firestore.FieldValue.increment(1)
    });
});