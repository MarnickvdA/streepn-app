// import * as admin from 'firebase-admin';
//
// try {
//     const topic = `group_${data.groupId}_all`;
//
//     const message = {
//         notification: {
//             title: `Transactie in ${group.name} ${transaction.items.length === 0 ? 'verwijderd' : 'aangepast'}`,
//             body: `${currentAccount.name} heeft een transactie ${transaction.items.length === 0 ? 'verwijderd' : 'aangepast'}`,
//         },
//         data: {
//             groupId: data.groupId as string,
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
