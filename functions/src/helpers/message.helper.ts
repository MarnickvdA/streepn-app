// import * as admin from 'firebase-admin';
//
// try {
//     const topic = `house_${data.houseId}_all`;
//
//     const message = {
//         notification: {
//             title: `Transactie in ${house.name} ${transaction.items.length === 0 ? 'verwijderd' : 'aangepast'}`,
//             body: `${currentAccount.name} heeft een transactie ${transaction.items.length === 0 ? 'verwijderd' : 'aangepast'}`,
//         },
//         data: {
//             houseId: data.houseId as string,
//         },
//         topic,
//     };
//
//     admin.messaging().send(message)
//         .catch((error) => {
//             console.error('Error sending message:', error);
//         });
// } catch (e) {
//     console.error(e);
// }
