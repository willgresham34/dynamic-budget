const indexedDB = window.indexedDB;

const req = indexedDB.open("transactions", 1);
let db;

req.onupgradeneeded = ({ target }) => {
  const db = target.result;
  db.createObjectStore("pendingTransactions", { autoIncrement: true });
};

req.onsuccess = (e) => {
  db = req.result;

  let transaction = db.transaction("pendingTransactions", "readwrite");

  let sb = transaction.objectStore("pendingTransactions");

  const all = sb.getAll();

  if (!read) {
    sb.put(failed);
    transaction.oncomplete = () => {
      db.close();
    };
    return;
  }

  all.onsuccess = () => {
    db.close();
    for (let i = 0; i < all.result.length; i++) {
      let results = [];
      results.push({
        name: all.result[i].name,
        value: all.result[i].value,
        date: all.result[i].date,
      });
    }
    fetch("/api/transaction/bulk", {
      method: "POST",
      headers: {
        Accept: "application/json, text/plain, */*",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(results),
    }).then((res) => {
      return res.json();
    });
  };
  let req = indexedDB.deleteDatabase("transactions");
  req.onsuccess = function () {
    console.log("Successfuly deleted the database");
  };
};

window.addEventListener("online", () => {
  saveRecord(null, true);
});
