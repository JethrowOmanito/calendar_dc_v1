import { jsPDF } from "jspdf";
import logo from "../Logo/doctor_clean_logo.png";

/**
 * Generate a confirmation PDF with dynamic confirmation number.
 * @param {string} noteText - Notes to display in the PDF.
 * @param {string} title - Title for the PDF filename.
 * @param {string|number} refId - Ref_ID from your events table.
 */
const generateConfirmationPDF = async (
  noteText = "No notes provided",
  title = "event",
  refId = ""
) => {
  const doc = new jsPDF();

  const img = new Image();
  img.src = logo;

  const today = new Date();
  const issuedDate = today.toLocaleDateString("en-GB", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Format confirmation number as 0000 + Ref_ID
  const confirmationNumber = `0000${refId}`;

  img.onload = () => {
    const pageWidth = doc.internal.pageSize.width;
    let y = 20;

    // Logo on the left
    doc.addImage(img, "PNG", 20, y, 70, 40);

    // Right side info
    doc.setFontSize(10);
    const rightX = pageWidth - 90;
    let infoY = y;

    // Issued Date (on a new line)
    doc.setFont("helvetica", "bold");
    doc.text("Issued Date:", rightX, infoY);
    doc.setFont("helvetica", "normal");
    doc.text(issuedDate, rightX, infoY + 6); // Put the date below the label
    infoY += 12; // Move down for next line

    // Confirmation Number (on a new line)
    doc.setFont("helvetica", "bold");
    doc.text("Confirmation Number:", rightX, infoY);
    doc.setFont("helvetica", "normal");
    doc.text(confirmationNumber, rightX, infoY + 6); // Use formatted number
    infoY += 12; // Move down for next content

    const contactLines = [
      "WCEGA TOWER 21 Bukit Batok",
      "Cres, #06-79 Singapore, 658065",
      "+65 8918 2880",
      "doctorclean.com.sg",
      "sales@doctorclean.com.sg",
    ];

    contactLines.forEach((line) => {
      doc.text(line, rightX, infoY);
      infoY += 6;
    });

    // Divider line
    infoY += 5;
    doc.line(20, infoY, pageWidth - 20, infoY);
    infoY += 10;

    // Confirmation Receipt
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("Confirmation Receipt", 20, infoY);
    infoY += 10;

    // Booking Details
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text("Booking Details:", 20, infoY);
    infoY += 10;

    const wrappedNote = doc.splitTextToSize(noteText, pageWidth - 40);
    wrappedNote.forEach((line) => {
      doc.text(line, 20, infoY);
      infoY += 6;
    });

    // Divider line after booking details
    infoY += 5; // Adjust for spacing after last note
    doc.line(20, infoY, pageWidth - 20, infoY);
    infoY += 10; // Move down for footer

    // Footer
    const footerText =
      "Company Registration No: 202312880H. Registered Office: 21 BUKIT BATOK CRESCENT #06-79, Singapore, 658065, Singapore.";
    const footerY = doc.internal.pageSize.height - 10;
    doc.setFontSize(8);
    doc.text(footerText, pageWidth / 2, footerY, { align: "center" });

    doc.save(`confirmation-${title}.pdf`);
  };
};

export default generateConfirmationPDF;