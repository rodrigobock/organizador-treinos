import React, { useState } from 'react';

function AddTextComponent() {
  const [texts, setTexts] = useState(['']); // estado para armazenar os textos
  const [inputValue, setInputValue] = useState(''); // estado para armazenar o valor do input

  // Função para adicionar um novo texto à lista
  const addText = () => {
    const newtexts = [...texts, ''];
    setTexts(newtexts);
  };

  // Função para atualizar o valor do texto no estado quando o input é alterado
  const handleInputChange = (index, value) => {
    const newtexts = [...texts];
    newtexts[index] = value;
    setTexts(newtexts);
  };

  return (
    <div>
      {/* Mapear os textos e renderizar os inputs */}
      {texts.map((text, index) => (
        <div key={index}>
          <input
            type="text"
            value={text}
            onChange={(e) => handleInputChange(index, e.target.value)}
          />
        </div>
      ))}
      {/* Botão de adicionar novo texto */}
      <button onClick={addText}>+</button>
    </div>
  );
}

export default AddTextComponent;
