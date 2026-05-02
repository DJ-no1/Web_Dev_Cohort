import "./App.css";
import Card from "./component/Card.jsx";
import { useState, useEffect } from "react";

function App() {
  const [data, setData] = useState([]);
  const [num, setNum] = useState(1);

  useEffect(() => {
    fetch(`https://api.freeapi.app/api/v1/public/books/${num}`)
      .then((res) => res.json())
      .then((result) => {
        console.log(result);
        setData(result.data);
      })
      // store in state
      .catch((err) =>
        console.error({
          error: err,
        }),
      );
  }, [num]);

  console.log(data);

  return (
    <div className="app-container">
      <Card
        title={data?.volumeInfo?.title}
        description={data?.volumeInfo?.description}
        image={data?.volumeInfo?.imageLinks?.smallThumbnail}
      />
      <div className="button-group">
        <button className="btn-previous" onClick={() => setNum(num - 1)}>
          ← Previous
        </button>
        <button className="btn-next" onClick={() => setNum(num + 1)}>
          Next →
        </button>
      </div>
    </div>
  );
}

export default App;
