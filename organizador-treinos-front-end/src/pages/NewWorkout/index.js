import React, { useState, useEffect } from 'react';

function NewWorkoutPage() {
  const [itemsOrcamento, setItemsOrcamento] = useState([]);

  useEffect(() => {
    // Adicionar um item vazio se a lista estiver vazia no carregamento da página
    if (itemsOrcamento.length === 0) {
      addItemListaMateriasProprios();
    }
  }, []); // Executa apenas uma vez no carregamento do componente

  const addItemListaMateriasProprios = () => {
    const newItem = {
      quantidade: '',
      material: {
        unidadeMedida: '',
        valor: ''
      },
      total: ''
    };
    setItemsOrcamento([...itemsOrcamento, newItem]);
  };

  const removeItemListaMateriasProprios = (index) => {
    const updatedItems = [...itemsOrcamento];
    updatedItems.splice(index, 1);
    setItemsOrcamento(updatedItems);
  };

  const handleChangeQuantidade = (event, index) => {
    const { value } = event.target;
    const updatedItems = [...itemsOrcamento];
    updatedItems[index].quantidade = value;
    setItemsOrcamento(updatedItems);
  };

  // Outras funções de manipulação de dados podem ser adicionadas conforme necessário

  return (
    <div>
      <table className="custom-table">
        <thead>
          <tr>
            <th style={{ textAlign: 'center' }}>Quantidade</th>
            <th style={{ textAlign: 'center' }}>Unidade Medida</th>
            <th style={{ textAlign: 'center' }}>Material</th>
            <th style={{ textAlign: 'center' }}>Valor R$</th>
            <th style={{ textAlign: 'center' }}>Total R$</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {itemsOrcamento.map((item, index) => (
            <tr key={index}>
              <td>
                <input
                  style={{ width: '100%' }}
                  type="text"
                  value={item.quantidade}
                  onChange={(e) => handleChangeQuantidade(e, index)}
                // Adicione outras propriedades de acordo com suas necessidades
                />
              </td>
              {/* Adicione outras colunas conforme necessário */}
              <td>
                <button type="button" onClick={() => addItemListaMateriasProprios()} className="btn btn-success">
                  <i className="pi pi-plus"></i> Adicionar
                </button>
                <button type="button" onClick={() => removeItemListaMateriasProprios(index)} className="btn btn-danger mt-2">
                  <i className="pi pi-trash"></i> Remover
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default NewWorkoutPage;
