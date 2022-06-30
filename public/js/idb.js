const { response } = require("express");

let db;
const request = indexedDB.open('budget',1);

request.onupgradeneeded = ({ target }) => {
    db = target.result;
};

request.onsuccess = ({ target }) =>{
    db = target.result;
    
    if(navigator.onLine) {
        checkDatabase();
    }
};

request.onerror = function (event) {
    console.log(('Woops! ', event.target.errorCode));
};

function saveRecord(record) {
    const transaction = db.transaction(['pending'], 'readwrite');
    const store = transaction.objectStore('pending');
    
    store.add(record);
};

function checkDatabase() {
    const transaction = db.transaction(['pending'],'readwrite');
    const store = transaction.objectStore('pending');
    const getAll = store.getAll();
    
    getAll.onsuccess = function() {
        if(getAll.result.length) {
            fetch('/api/transaction/bulk', {
                method: 'POST',
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: 'appication/json, text/plain, */*',
                    'Content-Type': 'application/json'
                }
            }).then(response => response.json()).then(()=> {
                const transaction = db.transaction(['pending'],'readwrite');
                const store = transaction.objectStore('pending');
                store.claer();
            });
        }
    };
};

window.addEventListener('online', checkDatabase);