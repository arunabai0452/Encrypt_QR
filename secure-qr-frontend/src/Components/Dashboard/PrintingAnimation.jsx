import React, { useEffect, useState } from "react";
import "./PrintingAnimation.css";

const PrintingAnimation = ({ decryptedData }) => {
  const [displayText, setDisplayText] = useState("");
  const fullText = `You're decrypted data is: ${decryptedData}`;

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      if (index < fullText.length) {
        setDisplayText((prevText) => prevText + (fullText[index] || ""));
        index++;
      } else {
        clearInterval(interval);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [decryptedData]);

  return <p className="printing-animation">{displayText}</p>;
};

export default PrintingAnimation;
