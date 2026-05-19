import { jsPDF } from 'jspdf';

export function downloadWorkoutAsPdf(workout) {
  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.text(workout.name, 14, 20);

  doc.setFontSize(11);
  doc.text(`Criado em: ${new Date(workout.createdAt).toLocaleDateString('pt-BR')}`, 14, 30);

  doc.setFontSize(13);
  doc.text('Exercícios:', 14, 45);

  doc.setFontSize(11);
  let y = 55;
  (workout.exercises || []).forEach((ex, i) => {
    const status = ex.completed ? '[✓]' : '[ ]';
    doc.text(`${i + 1}. ${status} ${ex.name}`, 14, y);
    y += 8;
    if (y > 270) {
      doc.addPage();
      y = 20;
    }
  });

  doc.save(`${workout.name}.pdf`);
}
