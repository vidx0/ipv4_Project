import { useState, useEffect } from 'react'
import './App.css'

function toIP(decimal) {
  return [
    (decimal >>> 24),
    (decimal >> 16) & 255,
    (decimal >> 8) & 255,
    decimal & 255,
  ].join('.');
}
function getRandomPrivateIP() {
  const rangeType = Math.floor(Math.random() * 3);
  if (rangeType === 0) {
    return `10.${rand(0,255)}.${rand(0,255)}.${rand(1,254)}`;
  } else if (rangeType === 1) {
    return `172.${rand(16,31)}.${rand(0,255)}.${rand(1,254)}`;
  } else {
    return `192.168.${rand(0,255)}.${rand(1,254)}`;
  }
}

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}


function fromIP(ip) {
  return ip.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet), 0);
}

function generateRandomSubnet() {
  const cidrs = Array.from({ length: 21 }, (_, i) => i + 8); // /8 to /28
  const cidr = cidrs[Math.floor(Math.random() * cidrs.length)];

  const ip = getRandomPrivateIP();
  const ipDec = fromIP(ip);

  const maskBits = 32 - cidr;
  const blockSize = 2 ** maskBits;

  const networkDec = ipDec & ~(blockSize - 1);
  const broadcastDec = networkDec + blockSize - 1;

  return {
    quizIp: toIP(ipDec),
    cidr,
    answers: {
      network: toIP(networkDec),
      first_host: toIP(networkDec + 1),
      last_host: toIP(broadcastDec - 1),
      broadcast: toIP(broadcastDec),
      next_subnet: toIP(networkDec + blockSize),
    }
  };
}

function App() {
  const [inputs, setInputs] = useState({});
  const [feedback, setFeedback] = useState({});
  const [quizData, setQuizData] = useState(null);

  useEffect(() => {
    createNewQuiz();
  }, []);

  const createNewQuiz = () => {
    const newQuiz = generateRandomSubnet();
    setQuizData(newQuiz);
    setInputs({
      network: "",
      first_host: "",
      last_host: "",
      broadcast: "",
      next_subnet: ""
    });
    setFeedback({});
  };

  const handleChange = (e) => {
    setInputs({ ...inputs, [e.target.name]: e.target.value });
  };

  const checkSingleAnswer = (key) => {
    setFeedback((prev) => ({
      ...prev,
      [key]: inputs[key]?.trim() === quizData.answers[key]
    }));
  };

  if (!quizData) return <div>Loading quiz...</div>;

  return (
    <div className="App" style={{ padding: '1.5rem' }}>
      <h1>Subnetting Quiz</h1>
      <p>IP Address: <strong>{quizData.quizIp}</strong></p>
      <p>Subnet Mask: <strong>/{quizData.cidr}</strong></p>

      <div className="question">
        {Object.keys(quizData.answers).map((key) => (
          <div className="form" key={key} style={{ display: "flex", alignItems: "center", marginBottom: "1rem" }}>
            <label style={{ width: "130px" }}>{key.replace("_", " ")}:</label>
            <textarea
              name={key}
              value={inputs[key] || ""}
              onChange={handleChange}
              rows="1"
              cols="30"
              style={{ marginRight: "10px" }}
            />
            <button onClick={() => checkSingleAnswer(key)}>Check</button>
            {feedback[key] !== undefined && (
              <span style={{ marginLeft: "10px", color: feedback[key] ? "green" : "red" }}>
                {feedback[key] ? "✔ Correct" : `✘ Incorrect (Ans: ${quizData.answers[key]})`}
              </span>
            )}
          </div>
        ))}

        <div className="button" style={{ marginTop: "1rem" }}>
          <button onClick={createNewQuiz}>New Quiz</button>
        </div>
      </div>
    </div>
  );
}

export default App;