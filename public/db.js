const indexedDB = window.indexedDB;

const req = indexedDB.open("transactions", 1);
let db;

req.onupgradeneeded = ({ target }) => {
  const db = target.result;
  db.createObjectStore("pendingTransactions", { autoIncrement: true });
};

req.onsuccess = ({ target }) => {
  db = target.result;

  if (navigator.onLine) {
    reviewData();
  }
};

function saveData(data) {
  const transaction = db.transaction("pendingTransactions", "readwrite");
  const sb = transaction.objectStore("pendingTransactions");

  sb.add(data);
}

function reviewData() {
  const transaction = db.transaction("pendingTransactions", "readwrite");
  const sb = transaction.objectStore("pendingTransactions");
  const all = sb.getAll();

  all.onsuccess = () => {
    for (let i = 0; i < all.result.length; i++) {
      fetch("/api/transaction/bulk", {
        method: "POST",
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(results),
      })
        .then((res) => {
          return res.json();
        })
        .then(() => {
          const transaction = db.transaction(
            "pendingTransactions",
            "readwrite"
          );
          const sb = transaction.objectStore("pendingTransactions");
          sb.clear();
        });
    }
  };
}

window.addEventListener("online", () => {
  saveRecord(null, true);
});
