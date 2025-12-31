
import { jsPDF } from "jspdf";
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, Header, Footer } from "docx";
import { ThesisData } from "../types";

export const exportToPDF = (data: ThesisData) => {
  const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
  const margin = 20;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const contentWidth = pageWidth - (2 * margin);
  
  const addHeaderFooter = (pdfDoc: jsPDF) => {
    pdfDoc.setFont("helvetica", "italic");
    pdfDoc.setFontSize(8);
    pdfDoc.setTextColor(120, 120, 120);
    pdfDoc.text(data.theme.toUpperCase(), pageWidth / 2, 8, { align: "center" });
    const footerText = `Mémoire de fin de cycle – INFAS – Antenne ${data.metadata.antenne} – Promotion ${data.metadata.promotion} – Page ${pdfDoc.internal.getNumberOfPages()}`;
    pdfDoc.text(footerText, pageWidth / 2, pageHeight - 8, { align: "center" });
    pdfDoc.setTextColor(0, 0, 0);
  };

  // --- PAGE DE GARDE ---
  doc.setLineWidth(0.5);
  doc.rect(5, 5, pageWidth - 10, pageHeight - 10);
  doc.rect(6, 6, pageWidth - 12, pageHeight - 12);
  
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("REPUBLIQUE DE COTE D'IVOIRE\nUnion - Discipline - Travail", pageWidth / 2, 15, { align: "center" });
  doc.text("MINISTERE DE LA SANTE, DE L'HYGIENE PUBLIQUE\nET DE LA COUVERTURE MALADIE UNIVERSELLE", pageWidth / 2, 30, { align: "center" });
  doc.text("INSTITUT NATIONAL DE FORMATION DES AGENTS DE SANTE\n(INFAS)", pageWidth / 2, 55, { align: "center" });
  
  doc.setFontSize(22);
  doc.text("MEMOIRE DE FIN DE CYCLE", pageWidth / 2, 95, { align: "center" });
  
  doc.setFontSize(11);
  doc.text(`Pour l'obtention du Diplôme d'Etat\nOption : ${data.metadata.option}`, pageWidth / 2, 110, { align: "center" });
  
  doc.setFontSize(14);
  const themeLines = doc.splitTextToSize(`THEME : ${data.theme.toUpperCase()}`, contentWidth);
  doc.text(themeLines, pageWidth / 2, 140, { align: "center" });
  
  doc.setFontSize(10);
  doc.text("Présenté par :", margin, 190);
  doc.text(data.metadata.groupMembers.map((m, i) => `${i+1}. ${m}`).join('\n'), margin + 5, 198);
  
  doc.text(`Directeur de mémoire : ${data.metadata.supervisor}`, margin, 240);
  doc.text(`Promotion : ${data.metadata.promotion}`, pageWidth / 2, 280, { align: "center" });

  // --- SECTIONS ---
  data.sections.forEach((section) => {
    // 1. Page de Titre (MAJUSCULE, Centré, Seul sur page)
    doc.addPage();
    addHeaderFooter(doc);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    const titleLines = doc.splitTextToSize(section.title.toUpperCase(), contentWidth);
    doc.text(titleLines, pageWidth / 2, pageHeight / 2, { align: "center" });

    // 2. Page de Contenu (Strictement page suivante)
    if (section.content && section.content.trim() !== "") {
      doc.addPage();
      addHeaderFooter(doc);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      let y = 30;
      const lines = doc.splitTextToSize(section.content, contentWidth);
      lines.forEach(line => {
        if (y > 275) { doc.addPage(); addHeaderFooter(doc); y = 30; }
        doc.text(line, margin, y, { align: 'justify', maxWidth: contentWidth });
        y += 6.5;
      });
    }
  });

  doc.save(`Memoire_INFAS_${data.metadata.antenne}_${data.metadata.author.replace(/\s+/g, '_')}.pdf`);
};

export const exportToWord = async (data: ThesisData) => {
  const doc = new Document({
    sections: [{
      headers: {
        default: new Header({
          children: [new Paragraph({ text: data.theme.toUpperCase(), alignment: AlignmentType.CENTER })],
        }),
      },
      footers: {
        default: new Footer({
          children: [new Paragraph({ text: `Mémoire INFAS – Antenne ${data.metadata.antenne} – Promotion ${data.metadata.promotion}`, alignment: AlignmentType.CENTER })],
        }),
      },
      children: data.sections.flatMap(s => [
        new Paragraph({ 
          text: s.title.toUpperCase(), 
          heading: HeadingLevel.HEADING_1, 
          alignment: AlignmentType.CENTER, 
          pageBreakBefore: true,
          spacing: { before: 4000, after: 4000 } // Force vertical centering approximation
        }),
        ...s.content.split('\n').map(l => new Paragraph({ 
          text: l, 
          alignment: AlignmentType.JUSTIFY,
          pageBreakBefore: l.startsWith('---PAGE_CONTENT---'), // Hook if we needed more control
          spacing: { before: 200, after: 200 }
        }))
      ])
    }]
  });
  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `Memoire_INFAS_${data.metadata.author.replace(/\s+/g, '_')}.docx`;
  link.click();
};
