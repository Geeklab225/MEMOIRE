
import { jsPDF } from "jspdf";
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, Header, Footer, PageBreak } from "docx";
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
    pdfDoc.setTextColor(150, 150, 150);
    const themeTrim = data.theme.length > 80 ? data.theme.substring(0, 80) + "..." : data.theme;
    pdfDoc.text(themeTrim.toUpperCase(), pageWidth / 2, 10, { align: "center", maxWidth: contentWidth });
    // Fix: Using getNumberOfPages directly on the doc instance instead of internal
    const footerText = `Mémoire INFAS – Antenne ${data.metadata.antenne} – Promotion ${data.metadata.promotion} – Page ${pdfDoc.getNumberOfPages()}`;
    pdfDoc.text(footerText, pageWidth / 2, pageHeight - 10, { align: "center" });
    pdfDoc.setTextColor(0, 0, 0);
  };

  // --- PAGE DE GARDE (TEMPLATE OFFICIEL INFAS) ---
  doc.setLineWidth(0.8);
  doc.rect(5, 5, pageWidth - 10, pageHeight - 10);
  doc.setLineWidth(0.3);
  doc.rect(6.5, 6.5, pageWidth - 13, pageHeight - 13);
  
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("REPUBLIQUE DE COTE D'IVOIRE\nUnion - Discipline - Travail", pageWidth / 2, 18, { align: "center" });
  
  doc.setFontSize(9);
  doc.text("MINISTERE DE LA SANTE, DE L'HYGIENE PUBLIQUE\nET DE LA COUVERTURE MALADIE UNIVERSELLE", pageWidth / 2, 32, { align: "center" });
  
  doc.setLineWidth(0.5);
  doc.line(pageWidth/2 - 20, 40, pageWidth/2 + 20, 40);

  doc.setFontSize(11);
  doc.text("INSTITUT NATIONAL DE FORMATION DES AGENTS DE SANTE\n(INFAS)", pageWidth / 2, 50, { align: "center" });
  
  doc.setFontSize(24);
  doc.text("MEMOIRE DE FIN DE CYCLE", pageWidth / 2, 85, { align: "center" });
  
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text("Pour l'obtention du Diplôme d'Etat", pageWidth / 2, 95, { align: "center" });
  doc.setFont("helvetica", "bold");
  doc.text(`Option : ${data.metadata.option}`, pageWidth / 2, 102, { align: "center" });
  
  doc.setFontSize(14);
  const themeLines = doc.splitTextToSize(`THEME : ${data.theme.toUpperCase()}`, contentWidth - 10);
  doc.text(themeLines, pageWidth / 2, 125, { align: "center" });
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Présenté et soutenu publiquement par le groupe N° ${data.metadata.groupNumber || '………'}`, margin, 160);
  
  let studentY = 170;
  const students = data.metadata.students.filter(s => s.name.trim() !== "");
  students.forEach((s, i) => {
    const studentInfo = `${i+1}. ${s.name.toUpperCase()}`;
    doc.text(studentInfo, margin + 5, studentY);
    
    // Fixed dots logic for visual template consistency
    const textWidth = doc.getTextWidth(studentInfo);
    const dotStart = margin + 5 + textWidth + 2;
    const dotEnd = margin + 110;
    if (dotEnd > dotStart) {
        doc.text(".".repeat(Math.floor((dotEnd - dotStart) / 1.5)), dotStart, studentY);
    }
    
    doc.text(`Matricule : ${s.matricule || '……………'}`, margin + 115, studentY);
    studentY += 7;
  });
  
  let juryY = 220;
  doc.setFont("helvetica", "bold");
  doc.text("DEVANT LE JURY COMPOSÉ DE :", margin, juryY);
  doc.setFont("helvetica", "normal");
  doc.text(`Président : ${data.metadata.juryPresident || '..............................................................'}`, margin + 5, juryY + 10);
  doc.text(`Assesseur : ${data.metadata.juryAssessor || '..............................................................'}`, margin + 5, juryY + 18);
  doc.text(`Directeur de mémoire : ${data.metadata.supervisor || '..................................................'}`, margin + 5, juryY + 26);
  
  let infoY = 265;
  doc.text(`Lieu de soutenance : ${data.metadata.defensePlace || '....................................................'}`, margin, infoY);
  doc.text(`Date de soutenance : ${data.metadata.defenseDate || '....................................................'}`, margin, infoY + 8);
  
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text(`PROMOTION : ${data.metadata.promotion || '2022 – 2025'}`, pageWidth / 2, 285, { align: "center" });

  // --- SECTIONS ---
  data.sections.forEach((section) => {
    // 1. Titre de chapitre sur une page dédiée
    doc.addPage();
    addHeaderFooter(doc);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(28);
    const titleLines = doc.splitTextToSize(section.title.toUpperCase(), contentWidth);
    doc.text(titleLines, pageWidth / 2, pageHeight / 2 - 10, { align: "center" });

    // 2. Contenu sur la page suivante
    if (section.content && section.content.trim() !== "") {
      doc.addPage();
      addHeaderFooter(doc);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(12);
      let y = 25;
      const paragraphs = section.content.split('\n').filter(p => p.trim() !== "");
      paragraphs.forEach(p => {
        const lines = doc.splitTextToSize(p, contentWidth);
        lines.forEach(line => {
          if (y > 275) { doc.addPage(); addHeaderFooter(doc); y = 25; }
          doc.text(line, margin, y, { align: 'justify', maxWidth: contentWidth });
          y += 7;
        });
        y += 5; // Paragraph spacing
      });
    }
  });

  doc.save(`Memoire_INFAS_G${data.metadata.groupNumber || 'X'}_${data.metadata.promotion.replace(/\s/g, '')}.pdf`);
};

export const exportToWord = async (data: ThesisData) => {
  const children: any[] = [];

  // --- PAGE DE GARDE WORD ---
  children.push(
    new Paragraph({ 
      children: [new TextRun({ text: "REPUBLIQUE DE COTE D'IVOIRE", bold: true, size: 24 })],
      alignment: AlignmentType.CENTER 
    }),
    new Paragraph({ 
      children: [new TextRun({ text: "Union - Discipline - Travail", bold: true, size: 20 })],
      alignment: AlignmentType.CENTER 
    }),
    new Paragraph({ text: "", spacing: { after: 200 } }),
    new Paragraph({ 
      children: [new TextRun({ text: "MINISTERE DE LA SANTE, DE L'HYGIENE PUBLIQUE", bold: true, size: 22 })],
      alignment: AlignmentType.CENTER 
    }),
    new Paragraph({ 
      children: [new TextRun({ text: "ET DE LA COUVERTURE MALADIE UNIVERSELLE", bold: true, size: 22 })],
      alignment: AlignmentType.CENTER 
    }),
    new Paragraph({ text: "___________________", alignment: AlignmentType.CENTER }),
    new Paragraph({ text: "", spacing: { after: 200 } }),
    new Paragraph({ 
      children: [new TextRun({ text: "INSTITUT NATIONAL DE FORMATION DES AGENTS DE SANTE", bold: true, size: 24 })],
      alignment: AlignmentType.CENTER 
    }),
    new Paragraph({ 
      children: [new TextRun({ text: "(INFAS)", bold: true, size: 24 })],
      alignment: AlignmentType.CENTER 
    }),
    new Paragraph({ text: "", spacing: { before: 1800 } }),
    new Paragraph({ 
      children: [new TextRun({ text: "MEMOIRE DE FIN DE CYCLE", bold: true, size: 52 })],
      alignment: AlignmentType.CENTER 
    }),
    new Paragraph({ text: "", spacing: { after: 400 } }),
    new Paragraph({ 
      children: [new TextRun({ text: `Pour l'obtention du Diplôme d'Etat`, size: 24 })],
      alignment: AlignmentType.CENTER 
    }),
    new Paragraph({ 
      children: [new TextRun({ text: `Option : ${data.metadata.option}`, bold: true, size: 24 })],
      alignment: AlignmentType.CENTER 
    }),
    new Paragraph({ text: "", spacing: { before: 1200 } }),
    new Paragraph({ 
      children: [new TextRun({ text: `THEME : ${data.theme.toUpperCase()}`, bold: true, size: 32 })],
      alignment: AlignmentType.CENTER 
    }),
    new Paragraph({ text: "", spacing: { before: 1800 } }),
    new Paragraph({ 
      children: [new TextRun({ text: `Présenté et soutenu publiquement par le groupe N° ${data.metadata.groupNumber || '………'}`, size: 24 })],
      alignment: AlignmentType.LEFT 
    }),
    ...data.metadata.students.filter(s => s.name).map((s, i) => new Paragraph({ 
      children: [
        new TextRun({ text: `${i+1}. ${s.name.toUpperCase()} `, size: 22 }),
        new TextRun({ text: ".".repeat(50), size: 22 }),
        new TextRun({ text: ` Matricule : ${s.matricule || '……………'}`, size: 22 })
      ],
      alignment: AlignmentType.LEFT 
    })),
    new Paragraph({ text: "", spacing: { before: 1200 } }),
    new Paragraph({ 
      children: [new TextRun({ text: "DEVANT LE JURY COMPOSÉ DE :", bold: true, size: 24 })],
      alignment: AlignmentType.LEFT 
    }),
    new Paragraph({ children: [new TextRun({ text: `Président : ${data.metadata.juryPresident || '..............................................................'}`, size: 22 })] }),
    new Paragraph({ children: [new TextRun({ text: `Assesseur : ${data.metadata.juryAssessor || '..............................................................'}`, size: 22 })] }),
    new Paragraph({ children: [new TextRun({ text: `Directeur de mémoire : ${data.metadata.supervisor || '..................................................'}`, size: 22 })] }),
    new Paragraph({ text: "", spacing: { before: 1000 } }),
    new Paragraph({ children: [new TextRun({ text: `Lieu de soutenance : ${data.metadata.defensePlace || '....................................................'}`, size: 22 })] }),
    new Paragraph({ children: [new TextRun({ text: `Date de soutenance : ${data.metadata.defenseDate || '....................................................'}`, size: 22 })] }),
    new Paragraph({ text: "", spacing: { before: 1400 } }),
    new Paragraph({ 
      children: [new TextRun({ text: `PROMOTION : ${data.metadata.promotion || '2022 – 2025'}`, bold: true, size: 32 })],
      alignment: AlignmentType.CENTER 
    }),
    new Paragraph({ text: "", pageBreakBefore: true })
  );

  // --- SECTIONS ---
  data.sections.forEach(s => {
    // Page Titre Chapitre
    children.push(
      new Paragraph({ 
        children: [new TextRun({ text: s.title.toUpperCase(), bold: true, size: 56 })],
        alignment: AlignmentType.CENTER, 
        pageBreakBefore: true,
        spacing: { before: 4500 }
      })
    );

    // Page Contenu
    if (s.content) {
      children.push(new Paragraph({ text: "", pageBreakBefore: true }));
      s.content.split('\n').filter(l => l.trim() !== "").forEach(l => {
        children.push(new Paragraph({ 
          children: [new TextRun({ text: l, size: 24 })],
          // Fix: AlignmentType property is JUSTIFIED not JUSTIFY
          alignment: AlignmentType.JUSTIFIED,
          spacing: { before: 240, after: 240 },
          indent: { firstLine: 720 }
        }));
      });
    }
  });

  const doc = new Document({
    sections: [{
      properties: {
        page: { margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 } }
      },
      headers: {
        default: new Header({
          children: [new Paragraph({ 
            // Fix: TextRun option is italics not italic
            children: [new TextRun({ text: data.theme.toUpperCase(), size: 16, italics: true })], 
            alignment: AlignmentType.CENTER 
          })],
        }),
      },
      footers: {
        default: new Footer({
          children: [new Paragraph({ 
            children: [new TextRun({ text: `Mémoire INFAS – Antenne ${data.metadata.antenne} – Promotion ${data.metadata.promotion}`, size: 16 })], 
            alignment: AlignmentType.CENTER 
          })],
        }),
      },
      children: children
    }]
  });

  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `Memoire_INFAS_G${data.metadata.groupNumber || 'X'}.docx`;
  link.click();
};
